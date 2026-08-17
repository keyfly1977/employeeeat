const express = require('express');
const fs = require('fs');
const path = require('path');
const db = require('./db');

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Read config
let config = {
  HR_API_BASE: "http://192.168.8.11:3001",
  CO_ID: null,
  USER_ACCOUNT: "",
  USER_PWD: "",
  OT_USER_ACCOUNT: "",
  OT_USER_PWD: "",
  PORT: 5000,
  VEGETARIAN_NAMES: [],
  NO_PORK_NAMES: []
};

try {
  const configPath = path.join(__dirname, 'config.json');
  if (fs.existsSync(configPath)) {
    const fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    config = { ...config, ...fileConfig };
  }
} catch (err) {
  console.error("Error reading config.json, using defaults:", err.message);
}

// Simple Cache
let cachedData = null;
let lastFetchTime = 0;
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

// Server-Sent Events (SSE) setup for real-time collaboration
const sseClients = new Set();
function broadcastEvent(type, payload) {
    const data = `data: ${JSON.stringify({ type, payload })}\n\n`;
    for (const client of sseClients) {
        try {
            client.write(data);
        } catch (err) {
            sseClients.delete(client);
        }
    }
}

app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // flush headers to establish SSE

    // Send initial connection event
    res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

    sseClients.add(res);
    req.on('close', () => {
        sseClients.delete(res);
    });
});

// Check if credentials are configured
function isConfigured() {
  return config.CO_ID && config.USER_ACCOUNT && config.USER_PWD;
}

// Helper to authenticate
const hrCalendarCache = {};
let isFetchingCalendar = false;
let globalHrToken = null;

async function ensureHrCalendar(startStr, endStr) {
    if (!config.USER_ACCOUNT || !config.USER_PWD) return;
    const startYear = parseInt(startStr.split(/[-\/]/)[0]);
    const endYear = parseInt(endStr.split(/[-\/]/)[0]);
    
    for (let year = startYear; year <= endYear; year++) {
        if (hrCalendarCache[`${year}/01/01`] !== undefined) continue;
        
        while (isFetchingCalendar) {
            await new Promise(r => setTimeout(r, 100));
        }
        if (hrCalendarCache[`${year}/01/01`] !== undefined) continue;
        
        isFetchingCalendar = true;
        try {
            if (!globalHrToken) {
                globalHrToken = await getAuthToken(config.USER_ACCOUNT, config.USER_PWD);
            }
            
            const basicRes = await fetch(`${config.HR_API_BASE}/api/am/calendar_basic`, {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${globalHrToken}` },
                body: JSON.stringify({ CO_ID: config.CO_ID })
            });
            const basicData = await basicRes.json();
            const basics = basicData.data || [];
            if (!basics.length) continue;
            
            const activeBasic = basics.find(b => b.IS_ACT === 1) || basics[0];
            const basicId = activeBasic.CALENDAR_BASIC_ID;

            const dayRes = await fetch(`${config.HR_API_BASE}/api/am/calendar_day`, {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${globalHrToken}` },
                body: JSON.stringify({ CO_ID: config.CO_ID, CALENDAR_BASIC_ID: basicId, CALENDAR_YEAR: String(year) })
            });
            const dayData = await dayRes.json();
            const days = dayData.data || [];
            
            days.forEach(d => {
                hrCalendarCache[d.CALENDAR_DATE] = [2, 3, 4].includes(d.CALENDAR_LEAVE_ID);
            });
            
            if (hrCalendarCache[`${year}/01/01`] === undefined) {
                hrCalendarCache[`${year}/01/01`] = false;
            }
        } catch (err) {
            console.error(`Failed to fetch HR calendar for ${year}:`, err);
            globalHrToken = null;
        } finally {
            isFetchingCalendar = false;
        }
    }
}

async function getAuthToken(account, password) {
  const signInBody = {
    account: account,
    password: password,
    USER_ACCOUNT: account,
    USER_PWD: password
  };
  const res = await fetch(`${config.HR_API_BASE}/api/auth/signIn`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(signInBody)
  });
  if (!res.ok) throw new Error(`Sign in failed for ${account} with status: ${res.status}`);
  const data = await res.json();
  const token = data.accessToken || (data.data && (data.data.ACCESS_TOKEN || data.data.accessToken));
  if (!token) throw new Error(`Unable to retrieve accessToken for ${account}.`);
  return token;
}

// Helper to format time to HH:mm
const formatTimeStr = (dateTimeStr) => {
  if (!dateTimeStr) return '';
  const parts = dateTimeStr.split(' ');
  if (parts.length > 1) {
    return parts[1].substring(0, 5);
  }
  const tParts = dateTimeStr.split('T');
  if (tParts.length > 1) {
    return tParts[1].substring(0, 5);
  }
  return '';
};

// Generate Mock Data for Testing
function generateMockData() {
    return []; // Simplified for brevity in new version, will rely on real data mostly
}

// Backend route to query attendance and OT, combined with local sqlite overrides

// Helper to get meals for a specific date

async function getMealsFromLocal(dateStr, dbEmps, settings) {
    const db = require('./db');
    return new Promise((resolve) => {
        db.all(`SELECT m.*, e.emp_no, e.name, e.department, e.is_foreign, e.diet_type 
                FROM meal_records m
                JOIN employees e ON m.emp_id = e.emp_id
                WHERE m.date = ?`, [dateStr], (err, rows) => {
            if (err || !rows) return resolve([]);
            
            const results = rows.map(r => {
                const isForeign = r.is_foreign === 1;
                const natStr = isForeign ? '外籍' : '本籍';
                return {
                    date: r.date,
                    empId: r.emp_id,
                    empNo: r.emp_no,
                    name: r.name,
                    empName: r.name,
                    deptName: r.department,
                    status: 'present', // Snapshot queries don't track leave/absent directly, just assume present if saved, or just show 'saved'
                    cardTime: '',
                    leaveInfo: null,
                    dietType: r.diet_type || '葷食',
                    optOutLunch: false,
                    optOutDinner: false,
                    noHolidayAllowance: false,
                    nationality: natStr,
                    hasLunch: r.has_lunch === 1,
                    hasDinner: r.has_dinner === 1,
                    hasOt: (r.ot_hours || 0) > 0,
                    otHours: r.ot_hours || 0
                };
            });
            resolve(results);
        });
    });
}

// Temporary debug endpoint
app.get('/api/debug/hr', async (req, res) => {
    try {
        const { date, emp_no } = req.query;
        if (!date || !emp_no) return res.json({error: "missing args"});
        const mainToken = await getAuthToken(config.USER_ACCOUNT, config.USER_PWD);
        
        // get emp
        const empRes = await fetch(`${config.HR_API_BASE}/api/ed/emp`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${mainToken}` },
            body: JSON.stringify({ CO_ID: config.CO_ID, LIMIT: 1000 })
        });
        const empResult = await empRes.json();
        const emp = (empResult.data || []).find(e => e.EMP_NO === emp_no);
        if (!emp) return res.json({error: "emp not found"});

        // get cardmatch
        const cardMatchRes = await fetch(`${config.HR_API_BASE}/api/am/emp_cardmatch`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${mainToken}` },
            body: JSON.stringify({ CO_ID: config.CO_ID, WORK_SDATE: date, WORK_EDATE: date, LIMIT: 1000 })
        });
        const cmResult = await cardMatchRes.json();
        const cm = (cmResult.data || []).find(c => c.EMP_ID === emp.EMP_ID);

        // get ot
        let otToken = mainToken;
        if (config.OT_USER_ACCOUNT && config.OT_USER_PWD) {
            otToken = await getAuthToken(config.OT_USER_ACCOUNT, config.OT_USER_PWD);
        }
        const otRes = await fetch(`${config.HR_API_BASE}/api/am/emp_ot`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${otToken}` },
            body: JSON.stringify({ CO_ID: config.CO_ID, OT_DATE: date, LIMIT: 1000 })
        });
        const otResult = await otRes.json();
        const ot = (otResult.data || []).find(o => o.EMP_ID === emp.EMP_ID);

        res.json({ emp, cardmatch: cm, ot: ot });
    } catch(e) {
        res.json({error: e.message});
    }
});

async function getMealsForDate(targetDateStr, mainToken, otToken, employees, dbEmps, settings) {
    const config = require('./config.json');
    // 3. Fetch Clock-in comparison results
    const cardMatchRes = await fetch(`${config.HR_API_BASE}/api/am/emp_cardmatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${mainToken}` },
      body: JSON.stringify({ CO_ID: config.CO_ID, WORK_SDATE: targetDateStr, WORK_EDATE: targetDateStr, LIMIT: 1000 })
    });
    let cardMatches = [];
    if (cardMatchRes.ok) {
      const cardMatchResult = await cardMatchRes.json();
      cardMatches = cardMatchResult.data || [];
    }

    // 4. Map card matches by EMP_ID
    const cardMatchMap = new Map();
    cardMatches.forEach(match => {
        if (!cardMatchMap.has(match.EMP_ID) || match.CARD_DATETIME) {
            cardMatchMap.set(match.EMP_ID, match);
        }
    });

    // Expand query by 1 day on each side: OT_SDATE = prevDay, OT_EDATE = nextDay
    // This ensures we capture overnight OT and same-day OT (API filters by OT_END time).
    const tDate = new Date(targetDateStr.replace(/\//g, '-'));
    const prevDate = new Date(tDate);
    prevDate.setDate(prevDate.getDate() - 1);
    const nextDate = new Date(tDate);
    nextDate.setDate(nextDate.getDate() + 1);
    const pad = (n) => String(n).padStart(2, '0');
    const prevDateStr = `${prevDate.getFullYear()}/${pad(prevDate.getMonth()+1)}/${pad(prevDate.getDate())}`;
    const nextDateStr = `${nextDate.getFullYear()}/${pad(nextDate.getMonth()+1)}/${pad(nextDate.getDate())}`;

    const otRes = await fetch(`${config.HR_API_BASE}/api/am/emp_ot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${otToken}` },
      body: JSON.stringify({ CO_ID: config.CO_ID, OT_SDATE: prevDateStr, OT_EDATE: nextDateStr, LIMIT: 1000 })
    });
    let otRecords = [];
    if (otRes.ok) {
        const otResult = await otRes.json();
        otRecords = otResult.data || [];
    }

    // Normalize a date string (e.g. "2026-07-31", "2026/07/31") to "20260731"
    const normDate = (dStr) => {
        if (!dStr) return '';
        const parts = String(dStr).split(/[ T]/)[0].split(/[-/]/);
        if (parts.length === 3) {
            return `${parts[0]}${String(parseInt(parts[1])).padStart(2,'0')}${String(parseInt(parts[2])).padStart(2,'0')}`;
        }
        return '';
    };
    const targetClean = normDate(targetDateStr);

    // Group OT by EMP_ID, only including records where OT_DATE matches the target date
    const otMap = new Map();
    otRecords.forEach(ot => {
        const otDateClean = normDate(ot.OT_DATE);
        // Only count OT whose attribution date (OT_DATE) matches today
        if (!otDateClean || otDateClean !== targetClean) return;

        const existing = otMap.get(ot.EMP_ID) || { OT_VALUE: 0 };
        const recordHours = parseFloat(ot.OT_VALUE || 0) || 0;
        existing.OT_VALUE += recordHours;
        otMap.set(ot.EMP_ID, existing);
    });

    // 6. Fetch Leaves (emp_leave)
    const leaveRes = await fetch(`${config.HR_API_BASE}/api/am/emp_leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${mainToken}` },
      body: JSON.stringify({ CO_ID: config.CO_ID, LEAVE_START: targetDateStr, LEAVE_END: targetDateStr, LIMIT: 1000 })
    });
    let leaveRecords = [];
    if (leaveRes.ok) {
        const leaveResult = await leaveRes.json();
        leaveRecords = leaveResult.data || [];
    }
    const leaveMap = new Map();
    leaveRecords.forEach(leave => {
        leaveMap.set(leave.EMP_ID, leave);
    });

    // 6b. Fetch Leave Item Names (leaveitem)
    const leaveItemMap = new Map();
    try {
        const leaveItemRes = await fetch(`${config.HR_API_BASE}/api/am/leaveitem`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${mainToken}` },
          body: JSON.stringify({ CO_ID: config.CO_ID, LIMIT: 200 })
        });
        if (leaveItemRes.ok) {
            const leaveItemResult = await leaveItemRes.json();
            (leaveItemResult.data || []).forEach(item => {
                leaveItemMap.set(item.LEAVEITEM_ID, item.LEAVEITEM_NAME);
            });
        }
    } catch(e) { /* ignore */ }

    const dietMap = {};
    const optOutLunchMap = {};
    const optOutDinnerMap = {};
    const divisionMap = {};
    const ramadanStartMap = {};
    const ramadanEndMap = {};
    if (dbEmps) {
        dbEmps.forEach(e => {
            dietMap[e.emp_id] = e.diet_type;
            optOutLunchMap[e.emp_id] = e.opt_out_lunch === 1;
            optOutDinnerMap[e.emp_id] = e.opt_out_dinner === 1;
            divisionMap[e.emp_id] = e.division;
            ramadanStartMap[e.emp_id] = e.ramadan_start;
            ramadanEndMap[e.emp_id] = e.ramadan_end;
        });
    }

    const db = require('./db');
    const localRecords = await new Promise((resolve) => {
        db.all(`SELECT * FROM meal_records WHERE date = ?`, [targetDateStr], (err, rows) => {
            resolve(rows || []);
        });
    });

    const localRecordMap = new Map();
    localRecords.forEach(r => {
        localRecordMap.set(r.emp_id, r);
    });

    const combinedList = employees
    .filter(emp => {
        const deptStr = emp.DEPT5_NAME || emp.DEPT4_NAME || emp.DEPT3_NAME || emp.DEPT2_NAME || emp.DEPT1_NAME || emp.DEPT_NAME || '';
        const isBoard = deptStr.includes('董事') || (emp.EMP_NAME && emp.EMP_NAME.includes('董事長'));
        if (isBoard) return false;
        if (emp.EMP_NO && emp.EMP_NO.startsWith('J')) return false; // 忽略 J 開頭工號
        if (emp.LEAVE_DATE || emp.QUIT_DATE) return false; // 忽略離職人員
        if (!cardMatchMap.has(emp.EMP_ID) && !leaveMap.has(emp.EMP_ID) && !otMap.has(emp.EMP_ID)) return false; // 不在刷卡應出勤名單、未請假、且無加班者，略過
        return true;
    })
    .map(emp => {
        const match = cardMatchMap.get(emp.EMP_ID);
        const ot = otMap.get(emp.EMP_ID);
        const leave = leaveMap.get(emp.EMP_ID);
        const localRec = localRecordMap.get(String(emp.EMP_ID));

        let status = 'absent';
        let cardTime = null;
        if (match && match.CARD_DATETIME) {
            cardTime = match.CARD_DATETIME;
            status = 'present';
        }
        
        // If they have any leave today, mark status as leave (even if they clocked in)
        if (leave) {
            status = 'leave';
        }

        const isIndonesian = emp.NATIONALITY === 'ID';
        
        let nationalityStr = "中華民國";
        if (emp.NATIONALITY === 'ID') nationalityStr = "印尼";
        if (emp.NATIONALITY === 'VN') nationalityStr = "越南";
        if (emp.NATIONALITY === 'TH') nationalityStr = "泰國";
        
        // Determine diet type
        // Priority: Ramadan (time-based, always wins) > DB setting > default
        // Note: '齋戒' in DB is a past snapshot; it must NOT override Ramadan calculation
        let defaultDiet = '葷食';
        let isRamadan = false;
        
        if (isIndonesian) {
            defaultDiet = '不吃豬';
        }

        // Check Ramadan (Employee specific - applies to anyone who has it set)
        const rStartStr = ramadanStartMap[emp.EMP_ID];
        const rEndStr = ramadanEndMap[emp.EMP_ID];
        if (rStartStr && rEndStr) {
            const rStart = new Date(rStartStr);
            const rEnd = new Date(rEndStr);
            const current = new Date(targetDateStr.replace(/\//g, '-'));
            if (current >= rStart && current <= rEnd) {
                isRamadan = true;
            }
        }

        const dbDiet = dietMap[emp.EMP_ID];
        let finalDiet = defaultDiet;
        // DB diet applies only if it's not '齋戒' (which is time-based, not a permanent setting)
        if (dbDiet && dbDiet !== '齋戒') finalDiet = dbDiet;

        // Ensure Indonesians revert to '不吃豬' after Ramadan (unless they are specifically '素食')
        if (isIndonesian && !isRamadan && finalDiet !== '素食') {
            finalDiet = '不吃豬';
        }

        // Ramadan always takes final priority
        if (isRamadan) finalDiet = '齋戒';

        let optOutLunch = optOutLunchMap[emp.EMP_ID] || false;
        let optOutDinner = optOutDinnerMap[emp.EMP_ID] || false;

        // Auto opt-out lunch during Ramadan (highest priority, overrides DB opt-out setting)
        if (isRamadan && finalDiet === '齋戒') {
            optOutLunch = true;
        }

        let hasLunch = status === 'present';
        
        let otHoursVal = ot ? ot.OT_VALUE : 0;
        const isRestOvertime = (match && match.IS_REST_OVERTIME === 1);
        
        // --- 預報機制 ---
        // 不再強制依賴 HR 加班資料 (otHoursVal >= 2) 來預設晚餐
        // 晚餐預設為不吃，由各單位主管於每日下午前在系統上手動勾選 (預報)
        let hasDinner = false;
        
        // 假日加班不供餐
        if (isRestOvertime) {
            hasLunch = false;
        }

        if (optOutLunch) hasLunch = false;
        if (optOutDinner) hasDinner = false;

        // 如果資料庫中已經有今天儲存的預報紀錄，則以預報紀錄為準
        if (localRec) {
            hasLunch = localRec.has_lunch === 1;
            hasDinner = localRec.has_dinner === 1;
        }

        const deptStr = emp.DEPT5_NAME || emp.DEPT4_NAME || emp.DEPT3_NAME || emp.DEPT2_NAME || emp.DEPT1_NAME || emp.DEPT_NAME || '未分配';
        
        let finalDivision = '其他';
        const manualDiv = divisionMap[emp.EMP_ID];
        if (manualDiv) {
            finalDivision = manualDiv;
        } else if (emp.EMP_NO) {
            if (emp.EMP_NO.startsWith('T1') || emp.EMP_NO.startsWith('T2')) finalDivision = '皮革';
            else if (emp.EMP_NO.startsWith('T4')) finalDivision = '紡織';
            else {
                if (deptStr.includes('皮')) finalDivision = '皮革';
                else if (deptStr.includes('紡')) finalDivision = '紡織';
            }
        }

        return {
            date: targetDateStr,
            empId: emp.EMP_ID,
            empNo: emp.EMP_NO,
            name: emp.EMP_NAME,
            deptName: deptStr,
            status,
            cardTime,
            leaveInfo: leave ? {
                leaveName: leaveItemMap.get(leave.LEAVEITEM_ID) || '請假',
                reason: leave.REASON || '',
                start: leave.LEAVE_START ? leave.LEAVE_START.split(' ')[1].substring(0,5) : '',
                end: leave.LEAVE_END ? leave.LEAVE_END.split(' ')[1].substring(0,5) : ''
            } : null,
            dietType: finalDiet,
            optOutLunch: optOutLunch,
            optOutDinner: optOutDinner,
            nationality: nationalityStr,
            hasLunch,
            hasDinner,
            hasOt: !!ot,
            otHours: otHoursVal,
            isRestOvertime: isRestOvertime,
            division: finalDivision,
            ramadanStart: ramadanStartMap[emp.EMP_ID] || '',
            ramadanEnd: ramadanEndMap[emp.EMP_ID] || ''
        };
    });

    return combinedList;
}

// Backend route to query attendance and OT, combined with local sqlite overrides
app.get('/api/meals/today', async (req, res) => {
  const forceRefresh = req.query.refresh === 'true';
  const queryDate = req.query.date; // Optional single date
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  const now = Date.now();

  const isRangeQuery = startDate && endDate;

  // Return cache if valid (only for today's data, don't cache historical queries)
  if (!queryDate && !isRangeQuery && cachedData && (now - lastFetchTime < CACHE_DURATION) && !forceRefresh) {
    return res.json(cachedData);
  }

  if (!isConfigured()) {
    return res.json({ error: true, message: "API not configured." });
  }

  try {
    console.log("Connecting to HR Server...");

    // 1. Get Tokens
    const mainToken = await getAuthToken(config.USER_ACCOUNT, config.USER_PWD);
    let otToken = mainToken;
    if (config.OT_USER_ACCOUNT && config.OT_USER_PWD) {
        try {
            otToken = await getAuthToken(config.OT_USER_ACCOUNT, config.OT_USER_PWD);
        } catch (err) {
            console.error("OT Login failed, falling back to main token", err);
        }
    }

    // 2. Fetch Employee Basic Info
    const empRes = await fetch(`${config.HR_API_BASE}/api/ed/emp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${mainToken}` },
      body: JSON.stringify({ CO_ID: config.CO_ID, LIMIT: 1000 })
    });
    if (!empRes.ok) throw new Error(`Fetch employees failed: ${empRes.status}`);
    const empResult = await empRes.json();
    const employees = empResult.data || [];

    // Sync employees to local DB
    db.serialize(() => {
        const stmt = db.prepare(`INSERT INTO employees (emp_id, emp_no, name, department, is_foreign, nationality) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(emp_id) DO UPDATE SET emp_no=excluded.emp_no, name=excluded.name, department=excluded.department, is_foreign=excluded.is_foreign, nationality=excluded.nationality`);
        employees.forEach(emp => {
            if (emp.EMP_NO && emp.EMP_NO.startsWith('J')) return; // 忽略 J 開頭工號
            const dept = emp.DEPT5_NAME || emp.DEPT4_NAME || emp.DEPT3_NAME || emp.DEPT2_NAME || emp.DEPT1_NAME || emp.DEPT_NAME || '未分配';
            if (dept.includes('董事')) return; // 忽略董事會
            if (emp.LEAVE_DATE || emp.QUIT_DATE) return; // 忽略離職人員
            const isForeign = emp.NATIONALITY !== 'TW' ? 1 : 0;
            
            let nationalityStr = "中華民國";
            if (emp.NATIONALITY === 'ID') nationalityStr = "印尼";
            if (emp.NATIONALITY === 'VN') nationalityStr = "越南";
            if (emp.NATIONALITY === 'TH') nationalityStr = "泰國";

            stmt.run(emp.EMP_ID, emp.EMP_NO, emp.EMP_NAME, dept, isForeign, nationalityStr);
        });
        stmt.finalize();
    });

    const dbEmps = await new Promise((resolve) => {
        db.all(`SELECT emp_id, diet_type, opt_out_lunch, opt_out_dinner, division, ramadan_start, ramadan_end FROM employees`, (err, rows) => {
            resolve(rows || []);
        });
    });

    const settings = await new Promise((resolve) => {
        db.all(`SELECT key, value FROM settings`, (err, rows) => {
            const map = {};
            if (rows) rows.forEach(r => map[r.key] = r.value);
            resolve(map);
        });
    });

    // Build dates array
    let targetDates = [];
    let isHistorical = false;
    if (isRangeQuery) {
        isHistorical = true;
        const s = new Date(startDate);
        const e = new Date(endDate);
        const diffTime = Math.abs(e - s);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 31) {
            return res.json({ error: true, message: "查詢區間不可超過 31 天。" });
        }
        for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            targetDates.push(`${y}/${m}/${day}`);
        }
    } else if (queryDate) {
        isHistorical = true;
        targetDates = [queryDate.replace(/-/g, '/')];
    } else {
        const todayObj = new Date();
        const yyyy = todayObj.getFullYear();
        const mm = String(todayObj.getMonth() + 1).padStart(2, '0');
        const dd = String(todayObj.getDate()).padStart(2, '0');
        targetDates = [`${yyyy}/${mm}/${dd}`];
    }

    let finalCombinedList = [];
    for (const d of targetDates) {
        if (isHistorical) {
            const list = await getMealsFromLocal(d, dbEmps, settings);
            finalCombinedList = finalCombinedList.concat(list);
        } else {
            const list = await getMealsForDate(d, mainToken, otToken, employees, dbEmps, settings);
            finalCombinedList = finalCombinedList.concat(list);
        }
    }

    const responsePayload = {
        mock: false,
        data: finalCombinedList,
        timestamp: new Date().toISOString()
    };

    if (!queryDate && !isRangeQuery) {
        cachedData = responsePayload;
        lastFetchTime = now;
    }

    res.json(responsePayload);

  } catch (error) {
    console.error("Error communicating with HR Server:", error.message);
    res.json({ error: true, message: error.message });
  }
});

// Update employee division
app.post('/api/employees/division', (req, res) => {
    const { empId, division } = req.body;
    const finalDiv = division === '未分類' ? null : division;
    db.run(`UPDATE employees SET division = ? WHERE emp_id = ?`, [finalDiv, empId], function(err) {
        if (err) return res.status(500).json({ success: false, error: err.message });
        cachedData = null;
        broadcastEvent('division_changed', { empId, division: finalDiv });
        res.json({ success: true });
    });
});

// Update employee diet
app.post('/api/employees/diet', (req, res) => {
    const { empId, dietType } = req.body;
    db.run(`UPDATE employees SET diet_type = ? WHERE emp_id = ?`, [dietType, empId], function(err) {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        cachedData = null; // Invalidate cache
        broadcastEvent('diet_changed', { empId, dietType });
        res.json({ success: true });
    });
});

// Update employee meal opt-out defaults
// Update employee manual meal opt-out defaults
app.post('/api/employees/optout', (req, res) => {
    const { empId, optOutLunch, optOutDinner } = req.body;
    db.run(`UPDATE employees SET opt_out_lunch = ?, opt_out_dinner = ? WHERE emp_id = ?`, 
        [optOutLunch ? 1 : 0, optOutDinner ? 1 : 0, empId], 
        function(err) {
            if (err) return res.status(500).json({ success: false, error: err.message });
            cachedData = null;
            broadcastEvent('optout_changed', { empId, optOutLunch, optOutDinner });
            res.json({ success: true });
        }
    );
});

// Get all employees
app.get('/api/employees', (req, res) => {
    db.all(`SELECT * FROM employees`, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Update allowance status (no accommodation / returning home / division)
app.put('/api/employees/:emp_id/allowance-status', (req, res) => {
    const { emp_id } = req.params;
    const { no_accommodation, is_returning_home, return_home_start, return_home_end, ramadan_start, ramadan_end, division } = req.body;
    db.run(`UPDATE employees SET no_accommodation = ?, is_returning_home = ?, return_home_start = ?, return_home_end = ?, ramadan_start = ?, ramadan_end = ?, division = ? WHERE emp_id = ?`, 
        [no_accommodation ? 1 : 0, is_returning_home ? 1 : 0, return_home_start || null, return_home_end || null, ramadan_start || null, ramadan_end || null, division || null, emp_id], 
        function(err) {
            if (err) return res.status(500).json({ success: false, error: err.message });
            cachedData = null;
            res.json({ success: true });
        }
    );
});

// Update manual override for a specific employee's meal today
app.post('/api/meals/update', (req, res) => {
    const { empId, hasLunch, hasDinner } = req.body;
    const todayObj = new Date();
    const yyyy = todayObj.getFullYear();
    const mm = String(todayObj.getMonth() + 1).padStart(2, '0');
    const dd = String(todayObj.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}/${mm}/${dd}`;

    db.run(`INSERT INTO meal_records (date, emp_id, has_lunch, has_dinner, updated_at) 
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(date, emp_id) DO UPDATE SET 
            has_lunch=excluded.has_lunch, has_dinner=excluded.has_dinner, updated_at=CURRENT_TIMESTAMP`,
            [todayStr, empId, hasLunch ? 1 : 0, hasDinner ? 1 : 0], 
            function(err) {
                if (err) {
                    return res.status(500).json({ success: false, error: err.message });
                }
                cachedData = null; // Invalidate cache
                broadcastEvent('meal_toggled', { empId, hasLunch, hasDinner });
                res.json({ success: true });
            });
});

async function getCrossCheckAnomalies(startStr, endStr) {
    await ensureHrCalendar(startStr, endStr);
    const dates = getDatesInRange(startStr, endStr);
    if (dates.length === 0) return [];

    const mainToken = await getAuthToken(config.USER_ACCOUNT, config.USER_PWD);
    let otToken = mainToken;
    if (config.OT_USER_ACCOUNT && config.OT_USER_PWD) {
        try { otToken = await getAuthToken(config.OT_USER_ACCOUNT, config.OT_USER_PWD); } catch(e) {}
    }

    const anomalies = [];
    const db = require('./db');
    
    // Process one date at a time
    for (const d of dates) {
        const targetDate = d.date; // "2026/08/06"

        // 1. Fetch Overtime
        const otRes = await fetch(`${config.HR_API_BASE}/api/am/emp_ot`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${otToken}` },
            body: JSON.stringify({ CO_ID: config.CO_ID, OT_DATE: targetDate, LIMIT: 5000 })
        });
        
        let otRecords = [];
        if (otRes.ok) {
            const otResult = await otRes.json();
            otRecords = otResult.data || [];
        }
        
        const otMap = new Map();
        otRecords.forEach(ot => {
            const hours = parseFloat(ot.OT_HOURS || ot.HOURS || ot.TOT_HOURS || 0);
            otMap.set(ot.EMP_ID, hours);
        });

        // 2. Fetch Local Meal Records
        const localRecords = await new Promise((resolve) => {
            db.all(`
                SELECT m.emp_id, m.has_dinner, e.name, e.department, e.is_foreign 
                FROM meal_records m
                JOIN employees e ON m.emp_id = e.emp_id
                WHERE m.date = ?`, [targetDate], (err, rows) => {
                resolve(rows || []);
            });
        });

        // 3. Cross Check Logic
        for (const rec of localRecords) {
            const hasDinner = rec.has_dinner === 1;
            const hrOtHours = otMap.get(rec.emp_id) || 0;
            
            if (hasDinner && hrOtHours < 2) {
                anomalies.push({
                    date: targetDate,
                    empId: rec.emp_id,
                    name: rec.name,
                    department: rec.department,
                    hasDinner: true,
                    hrOtHours: hrOtHours,
                    type: 'error',
                    message: '有訂晚餐，但 HR 無足夠加班紀錄 (防弊)'
                });
            }
            if (!hasDinner && hrOtHours >= 2) {
                anomalies.push({
                    date: targetDate,
                    empId: rec.emp_id,
                    name: rec.name,
                    department: rec.department,
                    hasDinner: false,
                    hrOtHours: hrOtHours,
                    type: 'warning',
                    message: '有加班紀錄，但未訂晚餐 (提醒)'
                });
            }
        }
    }
    return anomalies;
}

// --- 新增：事後勾稽 (Cross Check) API ---
app.post('/api/meals/cross_check', async (req, res) => {
    let { startDate, endDate } = req.body;
    
    // Fallback to yesterday if no dates provided (for backward compatibility if needed)
    if (!startDate || !endDate) {
        if (req.body.targetDate) {
            startDate = req.body.targetDate;
            endDate = req.body.targetDate;
        } else {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yStr = `${yesterday.getFullYear()}/${String(yesterday.getMonth() + 1).padStart(2, '0')}/${String(yesterday.getDate()).padStart(2, '0')}`;
            startDate = yStr;
            endDate = yStr;
        }
    }
    
    startDate = startDate.replace(/-/g, '/');
    endDate = endDate.replace(/-/g, '/');

    if (!isConfigured()) {
        return res.json({ error: true, message: "API not configured." });
    }

    try {
        const anomalies = await getCrossCheckAnomalies(startDate, endDate);
        res.json({ success: true, anomalies });

    } catch (error) {
        console.error("Cross check error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Save all meals as a snapshot for today
app.post('/api/meals/save_all', async (req, res) => {
    const { meals } = req.body;
    if (!meals || !Array.isArray(meals)) return res.status(400).json({ error: "Invalid meals data" });

    const todayObj = new Date();
    const yyyy = todayObj.getFullYear();
    const mm = String(todayObj.getMonth() + 1).padStart(2, '0');
    const dd = String(todayObj.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}/${mm}/${dd}`;

    await ensureHrCalendar(todayStr, todayStr);

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        const stmt = db.prepare(`
            INSERT INTO meal_records (date, emp_id, has_lunch, has_dinner, is_holiday, ot_hours, status, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(date, emp_id) DO UPDATE SET 
            has_lunch=excluded.has_lunch, has_dinner=excluded.has_dinner, is_holiday=excluded.is_holiday, ot_hours=excluded.ot_hours, status=excluded.status, updated_at=CURRENT_TIMESTAMP
        `);
        
        const globalFallbackIsHoliday = getDatesInRange(todayStr, todayStr)[0]?.isHoliday ? 1 : 0;

        for (const m of meals) {
            // Prefer the employee-specific isRestOvertime flag if available (from HR API),
            // Otherwise fallback to whether it's a weekend.
            const isEmpHoliday = m.isRestOvertime ? 1 : globalFallbackIsHoliday;
            stmt.run([todayStr, m.empId, m.hasLunch ? 1 : 0, m.hasDinner ? 1 : 0, isEmpHoliday, m.otHours || 0, m.status || 'present']);
        }
        
        stmt.finalize((err) => {
            if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ success: false, error: err.message });
            }
            db.run('COMMIT', (commitErr) => {
                if (commitErr) {
                    return res.status(500).json({ success: false, error: commitErr.message });
                }
                cachedData = null;
                res.json({ success: true });
            });
        });
    });
});

// Sync historical HR data (Option A logic: updates OT/status but preserves manual lunch/dinner)
app.post('/api/finance/sync', async (req, res) => {
    const startDateStr = req.query.startDate;
    const endDateStr = req.query.endDate;
    if (!startDateStr || !endDateStr) return res.status(400).json({ error: "Missing dates" });
    await ensureHrCalendar(startDateStr, endDateStr);
    const dates = getDatesInRange(startDateStr, endDateStr);
    
    if (!isConfigured()) return res.status(400).json({ error: "API not configured." });

    try {
        const s = new Date(startDateStr);
        const e = new Date(endDateStr);
        const diffDays = Math.ceil(Math.abs(e - s) / (1000 * 60 * 60 * 24));
        if (diffDays > 45) return res.status(400).json({ error: "查詢區間不可超過 45 天。" });

        let targetDates = [];
        for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            targetDates.push(`${y}/${m}/${day}`);
        }

        const mainToken = await getAuthToken(config.USER_ACCOUNT, config.USER_PWD);
        let otToken = mainToken;
        if (config.OT_USER_ACCOUNT && config.OT_USER_PWD) {
            try { otToken = await getAuthToken(config.OT_USER_ACCOUNT, config.OT_USER_PWD); } catch (err) {}
        }

        const empRes = await fetch(`${config.HR_API_BASE}/api/ed/emp`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${mainToken}` },
            body: JSON.stringify({ CO_ID: config.CO_ID, LIMIT: 1000 })
        });
        const empResult = await empRes.json();
        const employees = empResult.data || [];

        const dbEmps = await new Promise(resolve => {
            db.all(`SELECT emp_id, diet_type, opt_out_lunch, opt_out_dinner, division, ramadan_start, ramadan_end FROM employees`, (err, rows) => resolve(rows || []));
        });
        const settingsMap = await new Promise(resolve => {
            db.all(`SELECT key, value FROM settings`, (err, rows) => {
                const map = {};
                if (rows) rows.forEach(r => map[r.key] = r.value);
                resolve(map);
            });
        });

        // 1. Fetch all data sequentially from HR API
        await ensureHrCalendar(startDateStr, endDateStr);
        let allMealsToInsert = [];
        for (const d of targetDates) {
            const meals = await getMealsForDate(d, mainToken, otToken, employees, dbEmps, settingsMap);
            const globalFallbackIsHoliday = getDatesInRange(d, d)[0]?.isHoliday ? 1 : 0;

            // === DEBUG ===
            const otSample = meals.filter(m => m.otHours > 0);
            if (otSample.length > 0) {
                console.log(`[SYNC] ${d}: ${otSample.length} employees with OT ->`, otSample.map(m => `${m.empNo} ${m.otHours}hr`));
            } else {
                console.log(`[SYNC] ${d}: No OT found. Sample meal:`, meals[0] ? { empNo: meals[0].empNo, otHours: meals[0].otHours, hasOt: meals[0].hasOt } : 'no meals');
            }
            // === END DEBUG ===

            meals.forEach(m => {
                const isEmpHoliday = m.isRestOvertime ? 1 : globalFallbackIsHoliday;
                allMealsToInsert.push([d, m.empId, m.hasLunch ? 1 : 0, m.hasDinner ? 1 : 0, isEmpHoliday, m.otHours || 0, m.status || 'present']);
            });
        }

        // 2. Save to DB using Option A logic (preserve existing has_lunch/has_dinner)
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');
            const stmt = db.prepare(`
                INSERT INTO meal_records (date, emp_id, has_lunch, has_dinner, is_holiday, ot_hours, status, updated_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(date, emp_id) DO UPDATE SET 
                is_holiday=excluded.is_holiday, ot_hours=excluded.ot_hours, status=excluded.status, updated_at=CURRENT_TIMESTAMP
            `);

            for (const row of allMealsToInsert) {
                stmt.run(row);
            }

            stmt.finalize((err) => {
                if (err) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ success: false, error: err.message });
                }
                db.run('COMMIT', (commitErr) => {
                    if (commitErr) return res.status(500).json({ success: false, error: commitErr.message });
                    cachedData = null; // invalidate cache
                    res.json({ success: true });
                });
            });
        });

    } catch (error) {
        console.error("Sync error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get settings
app.get('/api/settings', (req, res) => {
    db.all(`SELECT * FROM settings`, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const settings = {};
        rows.forEach(r => settings[r.key] = r.value);
        res.json(settings);
    });
});

// Update settings
app.post('/api/settings', (req, res) => {
    const settings = req.body;
    db.serialize(() => {
        const stmt = db.prepare(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`);
        for (const [key, value] of Object.entries(settings)) {
            stmt.run(key, value);
        }
        stmt.finalize(() => {
            cachedData = null; // Invalidate cache so new settings apply immediately
            broadcastEvent('settings_changed', settings);
            res.json({ success: true });
        });
    });
});

function getDatesInRange(startStr, endStr) {
    const dates = [];
    const [sy, sm, sd] = startStr.split(/[-/]/);
    const [ey, em, ed] = endStr.split(/[-/]/);
    let curr = new Date(sy, sm - 1, sd);
    const end = new Date(ey, em - 1, ed);
    while (curr <= end) {
        const yyyy = curr.getFullYear();
        const m = String(curr.getMonth() + 1).padStart(2, '0');
        const d = String(curr.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}/${m}/${d}`;
        const day = curr.getDay();
        const isHoliday = hrCalendarCache[dateStr] ?? (day === 0 || day === 6);
        dates.push({
            date: dateStr,
            label: `${parseInt(m)}/${parseInt(d)}`,
            isHoliday
        });
        curr.setDate(curr.getDate() + 1);
    }
    return dates;
}

async function getFinanceData(startStr, endStr) {
    const db = require('./db');


    const dbEmps = await new Promise((resolve) => {
        db.all(`SELECT * FROM employees`, (err, rows) => resolve(rows || []));
    });
    const dbEmpsMap = {};
    dbEmps.forEach(e => dbEmpsMap[e.emp_id] = e);

    const settingRows = await new Promise((resolve) => {
        db.all(`SELECT * FROM settings`, (err, rows) => resolve(rows || []));
    });
    const s = {};
    settingRows.forEach(r => s[r.key] = r.value);
    
    const ramadanStartStr = s['ramadan_start'];
    const ramadanEndStr = s['ramadan_end'];
    const bentoPrice = parseInt(s['bento_price'] || 60);
    const mealSubsidy = parseInt(s['meal_subsidy_per_meal'] || 70);  // company subsidy per meal eaten
    const fixedAllowance = parseInt(s['fixed_monthly_allowance'] || 300); // fixed 300 per month
    const foreignSpecialDayAllowance = parseInt(s['foreign_hol_no_ot_allowance'] || 100); 
    const foreignHol8Extra = parseInt(s['foreign_hol8_extra_allowance'] || 50);
    const ot4Allowance = parseInt(s['common_ot4_allowance'] || 75);
    const ot8Allowance = parseInt(s['common_hol8_allowance'] || 75);
    const ot10Allowance = parseInt(s['common_hol10_allowance'] || 150);
    const ot12Allowance = parseInt(s['common_hol12_allowance'] || 225);

    const dates = getDatesInRange(startStr, endStr);
    if (dates.length === 0) return { dates: [], rows: [] };

    // Fetch ALL meal records for this date range from local DB
    const placeholders = dates.map(() => '?').join(',');
    const dateStrings = dates.map(d => d.date);
    
    const records = await new Promise((resolve) => {
        db.all(`SELECT * FROM meal_records WHERE date IN (${placeholders})`, dateStrings, (err, rows) => {
            resolve(rows || []);
        });
    });

    const empMap = {};

    records.forEach(m => {
        const dbEmp = dbEmpsMap[m.emp_id];
        if (!dbEmp) return; // Ignore if employee doesn't exist in local DB (shouldn't happen)
        
        if (dbEmp.emp_no && dbEmp.emp_no.startsWith('J')) return; 
        if (dbEmp.department && dbEmp.department.includes('董事')) return;

        if (!empMap[m.emp_id]) {
            empMap[m.emp_id] = {
                emp_no: dbEmp.emp_no,
                name: dbEmp.name,
                department: dbEmp.department,
                is_foreign: dbEmp.is_foreign === 1,
                is_returning_home: dbEmp.is_returning_home === 1,
                    return_home_start: dbEmp.return_home_start,
                    return_home_end: dbEmp.return_home_end,
                    diet_type: dbEmp.diet_type || (dbEmp.nationality === '印尼' ? '齋戒' : '葷食'),
                return_home_start: dbEmp.return_home_start,
                return_home_end: dbEmp.return_home_end,
                no_accommodation: dbEmp.no_accommodation === 1,
                no_holiday_allowance: false,
                diet_type: dbEmp.diet_type || (dbEmp.nationality === '印尼' ? '齋戒' : '葷食'),
                stats: { lunch: 0, dinner: 0, normal_days: 0, hol_no_ot: 0, hol_8hr: 0, hol_10hr: 0, hol_12hr: 0, weekday_ot_4hr: 0, free_dinners: 0, weekday_meals: 0, foreign_special_days: 0 },
                days: {}
            };
        }
        
        const e = empMap[m.emp_id];
        const hasLunch = m.has_lunch === 1;
        const hasDinner = m.has_dinner === 1;
        
        e.stats.lunch += hasLunch ? 1 : 0;
        e.stats.dinner += hasDinner ? 1 : 0;
        
        const mDate = new Date(m.date);
        let inReturnHomePeriod = false;
        if (e.is_returning_home && e.return_home_start && e.return_home_end) {
            const [rsy, rsm, rsd] = e.return_home_start.split(/[-/]/);
            const [rey, rem, red] = e.return_home_end.split(/[-/]/);
            const sDate = new Date(rsy, rsm - 1, rsd);
            const eDate = new Date(rey, rem - 1, red);
            if (mDate >= sDate && mDate <= eDate) {
                inReturnHomePeriod = true;
            }
        }

        const isHoliday = m.is_holiday === 1;
        const otHours = m.ot_hours || 0;

        // Free dinners: weekday OT >= 2hr dinner is free AND subsidy-eligible
        if (hasDinner && !isHoliday && otHours >= 2) {
            e.stats.free_dinners++;
        }

        if (isHoliday) {
            if (!inReturnHomePeriod) {
                if (otHours >= 12) e.stats.hol_12hr++;
                else if (otHours >= 10) e.stats.hol_10hr++;
                else if (otHours >= 8) e.stats.hol_8hr++;
                else {
                    e.stats.hol_no_ot++;
                    // Foreign worker: holiday with no OT = special day, give 100
                    if (e.is_foreign) e.stats.foreign_special_days++;
                }
            } else {
                // In return home period (holiday) = foreign special day
                if (e.is_foreign) e.stats.foreign_special_days++;
            }
        } else {
            if (!inReturnHomePeriod) {
                e.stats.normal_days++;
                if (otHours >= 4) e.stats.weekday_ot_4hr++;
                // Count weekday meals eaten (for 70/meal subsidy)
                const mealsToday = (hasLunch ? 1 : 0) + (hasDinner ? 1 : 0);
                e.stats.weekday_meals += mealsToday;
            } else {
                // Returning home on weekday = foreign special day
                if (e.is_foreign) e.stats.foreign_special_days++;
            }
        }

        // Foreign worker on leave = foreign special day
        if (e.is_foreign && m.status === 'leave' && !inReturnHomePeriod) {
            e.stats.foreign_special_days++;
        }
        
        let cellNote = '';
        if (inReturnHomePeriod) cellNote = '返鄉';
                else if (e.diet_type === '齋戒') {
            if (ramadanStartStr && ramadanEndStr) {
                const rs = new Date(ramadanStartStr.replace(/-/g, '/'));
                const re = new Date(ramadanEndStr.replace(/-/g, '/'));
                if (mDate >= rs && mDate <= re) cellNote = '齋戒';
            }
        }
        else if (m.status === 'leave') cellNote = '請假';
        
        e.days[m.date] = {
            l: hasLunch,
            d: hasDinner,
            note: cellNote,
            lText: '',
            dText: ''
        };
        
        if (cellNote === '返鄉') {
            e.days[m.date].lText = '返鄉';
            e.days[m.date].dText = '返鄉';
        } else if (cellNote === '齋戒') {
            if (!hasLunch) e.days[m.date].lText = '齋戒';
            if (!hasDinner) e.days[m.date].dText = '齋戒';
        } else if (cellNote === '請假') {
            if (!hasLunch) e.days[m.date].lText = '請假';
            if (!hasDinner) e.days[m.date].dText = '請假';
        }
    });

    const rows = [];
    Object.values(empMap).forEach(e => {
        const totalMeals = e.stats.lunch + e.stats.dinner;
        const chargeableMeals = Math.max(0, totalMeals - e.stats.free_dinners);
        const deduction = chargeableMeals * bentoPrice;

        let note = '';
        
        // OT subsidies (universal for all)
        let otSubsidies = (e.stats.weekday_ot_4hr * ot4Allowance) +
                          (e.stats.hol_8hr * ot8Allowance) +
                          (e.stats.hol_10hr * ot10Allowance) +
                          (e.stats.hol_12hr * ot12Allowance);
                          
        // Add foreign extra for hol_8hr
        if (e.is_foreign) {
            otSubsidies += (e.stats.hol_8hr * foreignHol8Extra);
        }

        // Interpretation A:
        //   allowance = 固定300 + (平日有吃便當的餐數 × 70) + 加班補貼 + (外勞特殊天數 × 100)
        const weekdayMealSubsidy = e.stats.weekday_meals * mealSubsidy;
        const foreignSpecialSubsidy = e.is_foreign ? (e.stats.foreign_special_days * foreignSpecialDayAllowance) : 0;
        const allowance = fixedAllowance + weekdayMealSubsidy + otSubsidies + foreignSpecialSubsidy;

        if (e.is_returning_home) note = '返鄉中';
        if (e.no_accommodation) note = (note ? note + ' ' : '') + '無住宿';

        if (totalMeals === 0 && allowance === 0 && e.diet_type !== '齋戒' && !e.is_returning_home) return;

        dates.forEach(d => {
            if (!e.days[d.date]) {
                let cellNote = '';
                const [mSy, mSm, mSd] = d.date.split('/');
                const mDate = new Date(mSy, mSm - 1, mSd);
                if (e.is_returning_home && e.return_home_start && e.return_home_end) {
                    const [rsy, rsm, rsd] = e.return_home_start.split(/[-/]/);
                    const [rey, rem, red] = e.return_home_end.split(/[-/]/);
                    const sDate = new Date(rsy, rsm - 1, rsd);
                    const eDate = new Date(rey, rem - 1, red);
                    if (mDate >= sDate && mDate <= eDate) cellNote = '返鄉';
                }
                                if (!cellNote && e.diet_type === '齋戒') {
                    if (ramadanStartStr && ramadanEndStr) {
                        const rs = new Date(ramadanStartStr.replace(/-/g, '/'));
                        const re = new Date(ramadanEndStr.replace(/-/g, '/'));
                        if (mDate >= rs && mDate <= re) cellNote = '齋戒';
                    }
                }
                
                e.days[d.date] = {
                    l: false, d: false, note: cellNote, lText: '', dText: ''
                };
                if (cellNote === '返鄉') {
                    e.days[d.date].lText = '返鄉';
                    e.days[d.date].dText = '返鄉';
                } else if (cellNote === '齋戒') {
                    e.days[d.date].lText = '齋戒';
                    e.days[d.date].dText = '齋戒';
                }
            }
        });

        const rowData = {
            id: e.emp_no, 
            name: e.name, 
            dept: e.department, 
            deduction, 
            special: foreignSpecialSubsidy,
            allowance, 
            norm: e.stats.normal_days, 
            w4: e.stats.weekday_ot_4hr,
            h0: e.stats.hol_no_ot, 
            h8: e.stats.hol_8hr, 
            h10: e.stats.hol_10hr,
            h12: e.stats.hol_12hr,
            note,
            days: e.days
        };
        rows.push(rowData);
    });

    return { 
        dates, 
        rows,
        labels: {
            special: s['fr_special_label'] || '特殊日補貼(返鄉/請假/假日休息)'
        }
    };
}

// ============================================================
// OT Summary: 假日加班統計 (新格式)
// ============================================================
async function getOtSummaryData(startStr, endStr) {
    const db = require('./db');

    const dbEmps = await new Promise((resolve) => {
        db.all(`SELECT * FROM employees`, (err, rows) => resolve(rows || []));
    });
    const dbEmpsMap = {};
    dbEmps.forEach(e => dbEmpsMap[e.emp_id] = e);

    const settingRows = await new Promise((resolve) => {
        db.all(`SELECT * FROM settings`, (err, rows) => resolve(rows || []));
    });
    const s = {};
    settingRows.forEach(r => s[r.key] = r.value);

    // Common Allowances
    const fixedAllowance = parseInt(s['fixed_monthly_allowance'] || 300);
    const commonOt4 = parseInt(s['common_ot4_allowance'] || 75);
    const commonHol8 = parseInt(s['common_hol8_allowance'] || 75);
    const commonHol10 = parseInt(s['common_hol10_allowance'] || 150);
    const commonHol12 = parseInt(s['common_hol12_allowance'] || 225);

    // Foreign-specific Allowances
    const foreignHolNoOt = parseInt(s['foreign_hol_no_ot_allowance'] || 100);
    const foreignHol8Extra = parseInt(s['foreign_hol8_extra_allowance'] || 50);
        const ramadanStartStr = s['ramadan_start'];
        const ramadanEndStr = s['ramadan_end'];

    const dates = getDatesInRange(startStr, endStr);
    if (dates.length === 0) return { rows: [], settings: {} };

    const placeholders = dates.map(() => '?').join(',');
    const dateStrings = dates.map(d => d.date);

    const records = await new Promise((resolve) => {
        db.all(`SELECT * FROM meal_records WHERE date IN (${placeholders})`, dateStrings, (err, rows) => {
            resolve(rows || []);
        });
    });

    const empMap = {};

    records.forEach(m => {
        const dbEmp = dbEmpsMap[m.emp_id];
        if (!dbEmp) return;
        if (dbEmp.emp_no && dbEmp.emp_no.startsWith('J')) return;
        if (dbEmp.department && dbEmp.department.includes('董事')) return;

        if (!empMap[m.emp_id]) {
            empMap[m.emp_id] = {
                emp_no: dbEmp.emp_no,
                name: dbEmp.name,
                department: dbEmp.department,
                is_foreign: dbEmp.is_foreign === 1,
                is_returning_home: dbEmp.is_returning_home === 1,
                    return_home_start: dbEmp.return_home_start,
                    return_home_end: dbEmp.return_home_end,
                    diet_type: dbEmp.diet_type || (dbEmp.nationality === '印尼' ? '齋戒' : '葷食'),
                is_returning_home: dbEmp.is_returning_home === 1,
                    return_home_start: dbEmp.return_home_start,
                    return_home_end: dbEmp.return_home_end,
                    diet_type: dbEmp.diet_type || (dbEmp.nationality === '印尼' ? '齋戒' : '葷食'),
                no_accommodation: dbEmp.no_accommodation === 1,
                w4: 0, h0: 0, h8: 0, h10: 0, h12: 0
            };
        }

        const e = empMap[m.emp_id];
        
        // 判斷是否為假日 (如果資料庫沒標記，但日期是週末也算)
        const mDate = new Date(m.date);
        const day = mDate.getDay();
        const isWeekend = (day === 0 || day === 6);
        const isHoliday = (m.is_holiday === 1) || (hrCalendarCache[m.date.replace(/-/g, '/')] ?? isWeekend);
        
        // 外勞平日請假 (Rule 6)
        const isForeignWeekdayLeave = !isHoliday && e.is_foreign && (m.status === 'leave');

        // 確保 otHours 是數字
        const otHours = parseFloat(m.ot_hours) || 0;

        if (isHoliday) {
            if (otHours >= 12) e.h12++;
            else if (otHours >= 10) e.h10++;
            else if (otHours >= 8) e.h8++;
            else e.h0++;
        } else {
            if (isForeignWeekdayLeave) {
                // 平日請假且為外勞，視同假日未加班(發 100 元)
                e.h0++;
            } else if (otHours >= 4) {
                // 平日加班滿 4 小時
                e.w4++;
            }
        }

    });

    const rows = [];
    Object.values(empMap).forEach(e => {
        // 不給假日伙食津貼：返鄉中 or 無住宿
        const noHolidayAllowance = e.is_returning_home || e.no_accommodation;

        // 判定外勞資格：非返鄉且非無住宿的外勞
        const isEligibleForeigner = (!noHolidayAllowance && e.is_foreign);
        
        const w4Total = e.w4 * commonOt4;
        
        // 假日未出勤(h0)：只有符合資格的外勞有補貼
        const h0Total = e.h0 * (isEligibleForeigner ? foreignHolNoOt : 0);
        
        // 假日加班8hr(h8)：共同津貼 + 外勞專屬額外補貼
        const h8Total = e.h8 * (commonHol8 + (isEligibleForeigner ? foreignHol8Extra : 0));
        
        // 假日加班10hr/12hr：皆領取共同津貼
        const h10Total = e.h10 * commonHol10;
        const h12Total = e.h12 * commonHol12;

        const fixed = noHolidayAllowance ? 0 : fixedAllowance;

        const grandTotal = w4Total + h0Total + h8Total + h10Total + h12Total + fixed;

        // Skip employees with no data at all
        if (grandTotal === 0 && e.w4 === 0 && e.h0 === 0 && e.h8 === 0 && e.h10 === 0 && e.h12 === 0) return;

        let note = '';
        if (e.is_returning_home && e.no_accommodation) {
            note = '返鄉、外宿';
        } else if (e.is_returning_home) {
            note = '返鄉';
        } else if (e.no_accommodation) {
            note = '外宿';
        }

        rows.push({
            emp_no: e.emp_no,
            name: e.name,
            department: e.department,
            w4_days: e.w4, w4_total: w4Total,
            h0_days: e.h0, h0_total: h0Total,
            h8_days: e.h8, h8_total: h8Total,
            h10_days: e.h10, h10_total: h10Total,
            h12_days: e.h12, h12_total: h12Total,
            fixed,
            grand_total: grandTotal,
            note
        });
    });

    // Sort by emp_no
    rows.sort((a, b) => (a.emp_no || '').localeCompare(b.emp_no || ''));

    return {
        rows,
        settings: {
            fixedAllowance,
            commonOt4,
            commonHol8,
            commonHol10,
            commonHol12,
            foreignHolNoOt,
            foreignHol8Extra
        }
    };
}


// Finance Preview
app.get('/api/finance/preview', async (req, res) => {
    try {
        const { start, end } = req.query;
        if (!start || !end) return res.status(400).json({ error: "Missing start or end param" });
        const data = await getFinanceData(start, end);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


const ExcelJS = require('exceljs');
app.get('/api/export/excel', async (req, res) => {
    try {
        const { start, end } = req.query;
        if (!start || !end) return res.status(400).json({ error: "Missing start or end param" });
        
        const data = await getFinanceData(start, end);
        
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet(`餐費結算_${start.replace(/-/g, '')}_${end.replace(/-/g, '')}`);
        sheet.views = [{ state: 'frozen', xSplit: 2, ySplit: 2 }];
        
        const baseColumns1 = [
            { key: 'id', width: 12 },
            { key: 'name', width: 15 },
            { key: 'dept', width: 15 }
        ];

        const dailyColumns = [];
        data.dates.forEach((d, i) => {
            dailyColumns.push({ key: `d${i}_l`, width: 8 });
            dailyColumns.push({ key: `d${i}_d`, width: 8 });
        });

        const baseColumns2 = [
            { key: 'deduction', width: 15 },
            { key: 'special', width: 15 },
            { key: 'norm', width: 15 },
            { key: 'note', width: 25 }
        ];

        sheet.columns = [...baseColumns1, ...dailyColumns, ...baseColumns2];

        const row1 = ['工號', '姓名', '部門'];
        const row2 = ['工號', '姓名', '部門'];

        data.dates.forEach(d => {
            row1.push(d.label);
            row1.push(d.label);
            row2.push('午');
            row2.push('晚');
        });

        const headers2 = ['應扣伙食費', data.labels.special, '一般出勤(天)', '備註'];
        headers2.forEach(h => {
            row1.push(h);
            row2.push(h);
        });

        sheet.insertRow(1, row1);
        sheet.insertRow(2, row2);

        sheet.mergeCells('A1:A2');
        sheet.mergeCells('B1:B2');
        sheet.mergeCells('C1:C2');
        
        let colIndex = 4;
        data.dates.forEach(() => {
            const cellStart = sheet.getRow(1).getCell(colIndex).address;
            const cellEnd = sheet.getRow(1).getCell(colIndex + 1).address;
            sheet.mergeCells(`${cellStart}:${cellEnd}`);
            colIndex += 2;
        });

        headers2.forEach(() => {
            const startAddr = sheet.getRow(1).getCell(colIndex).address;
            const endAddr = sheet.getRow(2).getCell(colIndex).address;
            sheet.mergeCells(`${startAddr}:${endAddr}`);
            colIndex++;
        });

        sheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
        sheet.getRow(2).alignment = { vertical: 'middle', horizontal: 'center' };

        data.rows.forEach(r => {
            const rowData = {
                id: r.id, 
                name: r.name, 
                dept: r.dept,
                deduction: r.deduction,
                special: r.special,
                norm: r.norm,
                note: r.note
            };

            data.dates.forEach((d, i) => {
                const dayData = r.days[d.date];
                rowData[`d${i}_l`] = dayData.lText || (dayData.l ? 'V' : '');
                rowData[`d${i}_d`] = dayData.dText || (dayData.d ? 'V' : '');
            });

            const excelRow = sheet.addRow(rowData);
            
            // Apply styling
            let cellColIndex = 4;
            data.dates.forEach((d, i) => {
                const dayData = r.days[d.date];
                const bg = dayData.note === '返鄉' ? 'FFFFF9C4' : 
                           dayData.note === '齋戒' ? 'FFAF52DE' : 
                           dayData.note === '請假' ? 'FFFFE0B2' : 
                           d.isHoliday ? 'FFF2F2F2' : null;
                
                if (bg) {
                    const lCell = excelRow.getCell(cellColIndex);
                    const dCell = excelRow.getCell(cellColIndex + 1);
                    lCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
                    dCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
                    if (bg === 'FFAF52DE') {
                        lCell.font = { color: { argb: 'FFFFFFFF' } };
                        dCell.font = { color: { argb: 'FFFFFFFF' } };
                    }
                }
                
                excelRow.getCell(cellColIndex).alignment = { vertical: 'middle', horizontal: 'center' };
                excelRow.getCell(cellColIndex + 1).alignment = { vertical: 'middle', horizontal: 'center' };
                cellColIndex += 2;
            });
            
            // Center align base columns
            excelRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
            excelRow.getCell(2).alignment = { vertical: 'middle', horizontal: 'center' };
            excelRow.getCell(3).alignment = { vertical: 'middle', horizontal: 'center' };
            for(let i=0; i<headers2.length; i++){
                excelRow.getCell(cellColIndex + i).alignment = { vertical: 'middle', horizontal: 'center' };
            }
        });
        // Add Cross Check Anomalies Sheet
        try {
            const anomalies = await getCrossCheckAnomalies(start.replace(/-/g, '/'), end.replace(/-/g, '/'));
            if (anomalies && anomalies.length > 0) {
                const sheet2 = workbook.addWorksheet('防弊異常清單');
                sheet2.columns = [
                    { header: '日期', key: 'date', width: 12 },
                    { header: '工號', key: 'empId', width: 12 },
                    { header: '姓名', key: 'name', width: 15 },
                    { header: '部門', key: 'department', width: 15 },
                    { header: 'HR加班(小時)', key: 'hrOtHours', width: 15 },
                    { header: '系統訂晚餐', key: 'hasDinner', width: 12 },
                    { header: '異常原因', key: 'message', width: 40 }
                ];
                
                sheet2.getRow(1).font = { bold: true };
                sheet2.getRow(1).alignment = { horizontal: 'center' };
                
                anomalies.forEach(a => {
                    const row = sheet2.addRow({
                        date: a.date,
                        empId: a.empId,
                        name: a.name,
                        department: a.department || '',
                        hrOtHours: a.hrOtHours,
                        hasDinner: a.hasDinner ? '有' : '無',
                        message: a.message
                    });
                    
                    const typeColor = a.type === 'error' ? 'FFFF0000' : 'FFFFA500'; // Red for error, Orange for warning
                    row.getCell('message').font = { color: { argb: typeColor }, bold: true };
                });
            }
        } catch (err) {
            console.error('Error generating cross check for excel:', err);
        }

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=meal_report_${start.replace(/-/g, '')}_${end.replace(/-/g, '')}.xlsx`);
        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// OT Summary Excel Export (假日加班統計 - 新格式)
app.get('/api/export/excel/ot-summary', async (req, res) => {
    try {
        const { start, end } = req.query;
        if (!start || !end) return res.status(400).json({ error: "Missing start or end param" });

        const startStr = start.replace(/-/g, '/');
        const endStr = end.replace(/-/g, '/');
        const data = await getOtSummaryData(startStr, endStr);
        const cfg = data.settings;

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('加班統計');
        sheet.views = [{ state: 'frozen', xSplit: 2, ySplit: 2 }];

        // Header labels
        const h0Label = `假日未加班\n補貼 ${cfg.foreignHolNoOt}/天`;
        const h8Label  = `假日加班8hr\n(外勞+${cfg.foreignHol8Extra})`;

        // Row 1: group headers
        const row1 = sheet.addRow([
            '工號', '姓名',
            '假日未加班', '',
            '假日加班8hr', '',
            '假日加班10hr', '',
            '假日加班12hr', '',
            '平日加班4hr+', '',
            `固定津貼\n${cfg.fixedAllowance}/人`,
            '總計', '備註'
        ]);
        // Row 2: sub-headers (天數 / 合計)
        const row2 = sheet.addRow([
            '工號', '姓名',
            '天數', `補貼合計\n(外勞${cfg.foreignHolNoOt}/天)`,
            '天數', `合計\n(共同${cfg.commonHol8}外勞+${cfg.foreignHol8Extra})`,
            '天數', `合計\n(${cfg.commonHol10})`,
            '天數', `合計\n(${cfg.commonHol12})`,
            '天數', `合計\n(${cfg.commonOt4}/次)`,
            '', '總計', '備註'
        ]);

        // Merge row1 group cells
        sheet.mergeCells('A1:A2'); // 工號
        sheet.mergeCells('B1:B2'); // 姓名
        sheet.mergeCells('C1:D1'); // 假日未加班
        sheet.mergeCells('E1:F1'); // 假日加班8hr
        sheet.mergeCells('G1:H1'); // 假日加班10hr
        sheet.mergeCells('I1:J1'); // 假日加班12hr
        sheet.mergeCells('K1:L1'); // 平日加班4hr+
        sheet.mergeCells('M1:M2'); // 固定津貼
        sheet.mergeCells('N1:N2'); // 總計
        sheet.mergeCells('O1:O2'); // 備註

        // Column widths
        sheet.columns = [
            { key: 'emp_no',     width: 12 },
            { key: 'name',       width: 12 },
            { key: 'h0_days',    width: 9  },
            { key: 'h0_total',   width: 14 },
            { key: 'h8_days',    width: 9  },
            { key: 'h8_total',   width: 14 },
            { key: 'h10_days',   width: 10 },
            { key: 'h10_total',  width: 14 },
            { key: 'h12_days',   width: 10 },
            { key: 'h12_total',  width: 14 },
            { key: 'w4_days',    width: 10 },
            { key: 'w4_total',   width: 14 },
            { key: 'fixed',      width: 12 },
            { key: 'grand_total',width: 12 },
            { key: 'note',       width: 20 }
        ];

        // Style header rows
        const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
        const subHeaderFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2D5A9E' } };
        const headerFont = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
        const centerAlign = { vertical: 'middle', horizontal: 'center', wrapText: true };

        [row1, row2].forEach((r, idx) => {
            r.height = 32;
            r.eachCell(cell => {
                cell.fill = idx === 0 ? headerFill : subHeaderFill;
                cell.font = headerFont;
                cell.alignment = centerAlign;
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FFFFFFFF' } },
                    left: { style: 'thin', color: { argb: 'FFFFFFFF' } },
                    bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } },
                    right: { style: 'thin', color: { argb: 'FFFFFFFF' } }
                };
            });
        });

        // Color coding for column groups
        const groupColors = {
            C: 'FFE8F4FD', D: 'FFE8F4FD',   // 未加班 - light blue
            E: 'FFFFE0B2', F: 'FFFFE0B2',   // 8hr - light orange
            G: 'FFFCE4EC', H: 'FFFCE4EC',   // 10hr - light red
            I: 'FFEDE7F6', J: 'FFEDE7F6',   // 12hr - light purple
            K: 'FFE8F8FF', L: 'FFE8F8FF',   // 4hr - light cyan
        };

        // Data rows
        data.rows.forEach(r => {
            const excelRow = sheet.addRow({
                emp_no:      r.emp_no,
                name:        r.name,
                h0_days:     r.h0_days,
                h0_total:    r.h0_total,
                h8_days:     r.h8_days,
                h8_total:    r.h8_total,
                h10_days:    r.h10_days,
                h10_total:   r.h10_total,
                h12_days:    r.h12_days,
                h12_total:   r.h12_total,
                w4_days:     r.w4_days,
                w4_total:    r.w4_total,
                fixed:       r.fixed,
                grand_total: r.grand_total,
                note:        r.note
            });

            excelRow.height = 22;
            const borderStyle = { style: 'thin', color: { argb: 'FFCCCCCC' } };
            const thinBorder = { top: borderStyle, left: borderStyle, bottom: borderStyle, right: borderStyle };

            excelRow.eachCell((cell, colNum) => {
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.border = thinBorder;

                // Apply group background colors
                const colLetter = String.fromCharCode(64 + colNum);
                if (groupColors[colLetter]) {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: groupColors[colLetter] } };
                }
            });

            // Grand total: bold, yellow background
            const totalCell = excelRow.getCell('grand_total');
            totalCell.font = { bold: true };
            totalCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF9C4' } };

            // Note: red text if has content
            if (r.note) {
                const noteCell = excelRow.getCell('note');
                noteCell.font = { color: { argb: 'FFCC0000' }, bold: true };
                noteCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3F3' } };
            }

            // Zero days: dim the number
            ['h0_days', 'h8_days', 'h10_days', 'h12_days'].forEach(k => {
                if (r[k] === 0) {
                    const col = { h0_days: 'C', h8_days: 'E', h10_days: 'G', h12_days: 'I' }[k];
                    excelRow.getCell(col).font = { color: { argb: 'FFAAAAAA' } };
                }
            });
        });

        // Grand total footer row
        if (data.rows.length > 0) {
            const startDataRow = 3;
            const endDataRow = 2 + data.rows.length;
            const footerRow = sheet.addRow([
                '合計', '',
                { formula: `SUM(C${startDataRow}:C${endDataRow})` },
                { formula: `SUM(D${startDataRow}:D${endDataRow})` },
                { formula: `SUM(E${startDataRow}:E${endDataRow})` },
                { formula: `SUM(F${startDataRow}:F${endDataRow})` },
                { formula: `SUM(G${startDataRow}:G${endDataRow})` },
                { formula: `SUM(H${startDataRow}:H${endDataRow})` },
                { formula: `SUM(I${startDataRow}:I${endDataRow})` },
                { formula: `SUM(J${startDataRow}:J${endDataRow})` },
                { formula: `SUM(K${startDataRow}:K${endDataRow})` },
                { formula: `SUM(L${startDataRow}:L${endDataRow})` },
                ''
            ]);
            footerRow.height = 22;
            footerRow.font = { bold: true };
            footerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
            footerRow.eachCell(cell => {
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.border = {
                    top: { style: 'medium' },
                    left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
                    bottom: { style: 'medium' },
                    right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
                };
            });
            sheet.mergeCells(`A${endDataRow + 1}:B${endDataRow + 1}`);
        }

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=ot_summary_${start.replace(/-/g, '')}_${end.replace(/-/g, '')}.xlsx`);
        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Leather Dept + Taiwanese Only OT Summary Excel Export
app.get('/api/export/excel/ot-summary-leather-tw', async (req, res) => {
    try {
        const { start, end } = req.query;
        if (!start || !end) return res.status(400).json({ error: "Missing start or end param" });

        const startStr = start.replace(/-/g, '/');
        const endStr = end.replace(/-/g, '/');

        // --- 取資料 (只篩皮革部門 + 本國員工) ---
        const db = require('./db');
        const dbEmps = await new Promise((resolve) => {
            db.all(`SELECT * FROM employees`, (err, rows) => resolve(rows || []));
        });
        const dbEmpsMap = {};
        dbEmps.forEach(e => dbEmpsMap[e.emp_id] = e);

        const settingRows = await new Promise((resolve) => {
            db.all(`SELECT * FROM settings`, (err, rows) => resolve(rows || []));
        });
        const s = {};
        settingRows.forEach(r => s[r.key] = r.value);

        const fixedAllowance = parseInt(s['fixed_monthly_allowance'] || 300);
        const commonOt4  = parseInt(s['common_ot4_allowance']  || 75);
        const commonHol8 = parseInt(s['common_hol8_allowance'] || 75);
        const commonHol10 = parseInt(s['common_hol10_allowance'] || 150);
        const commonHol12 = parseInt(s['common_hol12_allowance'] || 225);
        const foreignHolNoOt   = parseInt(s['foreign_hol_no_ot_allowance']  || 100);
        const foreignHol8Extra = parseInt(s['foreign_hol8_extra_allowance'] || 50);
        const ramadanStartStr = s['ramadan_start'];
        const ramadanEndStr = s['ramadan_end'];

        const dates = getDatesInRange(startStr, endStr);
        if (dates.length === 0) return res.status(400).json({ error: '日期範圍無效' });

        const placeholders = dates.map(() => '?').join(',');
        const dateStrings = dates.map(d => d.date);

        const records = await new Promise((resolve) => {
            db.all(`SELECT * FROM meal_records WHERE date IN (${placeholders})`, dateStrings, (err, rows) => resolve(rows || []));
        });

        const empMap = {};
        records.forEach(m => {
            const dbEmp = dbEmpsMap[m.emp_id];
            if (!dbEmp) return;
            // 只保留「皮革廠」且「本國員工」
            // T1/T2 開頭 = 皮革; T7 外勞靠 division 欄位判斷
            const empNo = dbEmp.emp_no || '';
            let isLeatherDiv = empNo.startsWith('T1') || empNo.startsWith('T2');
            if (!isLeatherDiv && dbEmp.division) isLeatherDiv = (dbEmp.division === '皮革');
            if (!isLeatherDiv) return;
            if (dbEmp.is_foreign === 1) return;
            if (empNo.startsWith('J')) return;
            if (dbEmp.department && dbEmp.department.includes('董事')) return;

            if (!empMap[m.emp_id]) {
                empMap[m.emp_id] = {
                    emp_no: dbEmp.emp_no,
                    name: dbEmp.name,
                    department: dbEmp.department,
                    is_foreign: false,
                    is_returning_home: dbEmp.is_returning_home === 1,
                    return_home_start: dbEmp.return_home_start,
                    return_home_end: dbEmp.return_home_end,
                    diet_type: dbEmp.diet_type || (dbEmp.nationality === '印尼' ? '齋戒' : '葷食'),
                    no_accommodation: dbEmp.no_accommodation === 1,
                    w4: 0, h0: 0, h8: 0, h10: 0, h12: 0
                };
            }

            const e = empMap[m.emp_id];
            const mDate = new Date(m.date);
            const day = mDate.getDay();
            const isWeekend = (day === 0 || day === 6);
            const isHoliday = (m.is_holiday === 1) || (hrCalendarCache[m.date.replace(/-/g, '/')] ?? isWeekend);
            const otHours = parseFloat(m.ot_hours) || 0;

            if (isHoliday) {
                if (otHours >= 12) e.h12++;
                else if (otHours >= 10) e.h10++;
                else if (otHours >= 8) e.h8++;
                else e.h0++;
            } else {
                if (otHours >= 4) e.w4++;
            }
        });

        const dataRows = [];
        Object.values(empMap).forEach(e => {
            const noHolidayAllowance = e.is_returning_home || e.no_accommodation;
            const w4Total  = e.w4  * commonOt4;
            const h0Total  = 0;  // 本國員工不計假日未加班補貼
            const h8Total  = e.h8  * commonHol8;
            const h10Total = e.h10 * commonHol10;
            const h12Total = e.h12 * commonHol12;
            const fixed = noHolidayAllowance ? 0 : fixedAllowance;
            const grandTotal = w4Total + h8Total + h10Total + h12Total + fixed;

            if (grandTotal === 0 && e.w4 === 0 && e.h0 === 0 && e.h8 === 0 && e.h10 === 0 && e.h12 === 0) return;

            let note = '';
            if (e.is_returning_home && e.no_accommodation) note = '返鄉、外宿';
            else if (e.is_returning_home) note = '返鄉';
            else if (e.no_accommodation) note = '外宿';

            if (e.is_returning_home && e.return_home_start && e.return_home_end) {
                note += (note === '返鄉' || note === '返鄉、外宿' ? ` (${e.return_home_start}~${e.return_home_end})` : ` 返鄉(${e.return_home_start}~${e.return_home_end})`);
            }
            if (e.diet_type === '齋戒' && ramadanStartStr && ramadanEndStr) {
                note += (note ? ' ' : '') + `齋戒 (${ramadanStartStr}~${ramadanEndStr})`;
            }

            dataRows.push({
                emp_no: e.emp_no, name: e.name, department: e.department,
                w4_days: e.w4, w4_total: w4Total,
                h0_days: e.h0, h0_total: h0Total,
                h8_days: e.h8, h8_total: h8Total,
                h10_days: e.h10, h10_total: h10Total,
                h12_days: e.h12, h12_total: h12Total,
                fixed, grand_total: grandTotal, note
            });
        });
        dataRows.sort((a, b) => (a.emp_no || '').localeCompare(b.emp_no || ''));

        // --- 產生 Excel ---
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('皮革本國加班統計');
        sheet.views = [{ state: 'frozen', xSplit: 2, ySplit: 2 }];

        const row1 = sheet.addRow([
            '工號', '姓名',
            '假日未加班', '',
            '假日加班8hr', '',
            '假日加班10hr', '',
            '假日加班12hr', '',
            '平日加班4hr+', '',
            `固定津貼\n${fixedAllowance}/人`,
            '總計', '備註'
        ]);
        const row2 = sheet.addRow([
            '工號', '姓名',
            '天數', `補貼合計\n(本國員工不適用)`,
            '天數', `合計\n(共同${commonHol8}/天)`,
            '天數', `合計\n(${commonHol10}/天)`,
            '天數', `合計\n(${commonHol12}/天)`,
            '天數', `合計\n(${commonOt4}/次)`,
            '', '總計', '備註'
        ]);

        sheet.mergeCells('A1:A2'); sheet.mergeCells('B1:B2');
        sheet.mergeCells('C1:D1'); sheet.mergeCells('E1:F1');
        sheet.mergeCells('G1:H1'); sheet.mergeCells('I1:J1');
        sheet.mergeCells('K1:L1'); sheet.mergeCells('M1:M2');
        sheet.mergeCells('N1:N2'); sheet.mergeCells('O1:O2');

        sheet.columns = [
            { key: 'emp_no',      width: 12 }, { key: 'name',       width: 12 },
            { key: 'h0_days',     width: 9  }, { key: 'h0_total',   width: 16 },
            { key: 'h8_days',     width: 9  }, { key: 'h8_total',   width: 14 },
            { key: 'h10_days',    width: 10 }, { key: 'h10_total',  width: 14 },
            { key: 'h12_days',    width: 10 }, { key: 'h12_total',  width: 14 },
            { key: 'w4_days',     width: 10 }, { key: 'w4_total',   width: 14 },
            { key: 'fixed',       width: 12 }, { key: 'grand_total',width: 12 },
            { key: 'note',        width: 20 }
        ];

        const headerFill    = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
        const subHeaderFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2D5A9E' } };
        const headerFont  = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
        const centerAlign = { vertical: 'middle', horizontal: 'center', wrapText: true };

        [row1, row2].forEach((r, idx) => {
            r.height = 32;
            r.eachCell(cell => {
                cell.fill = idx === 0 ? headerFill : subHeaderFill;
                cell.font = headerFont;
                cell.alignment = centerAlign;
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FFFFFFFF' } },
                    left: { style: 'thin', color: { argb: 'FFFFFFFF' } },
                    bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } },
                    right: { style: 'thin', color: { argb: 'FFFFFFFF' } }
                };
            });
        });

        const groupColors = {
            C: 'FFE8F4FD', D: 'FFE8F4FD',
            E: 'FFFFE0B2', F: 'FFFFE0B2',
            G: 'FFFCE4EC', H: 'FFFCE4EC',
            I: 'FFEDE7F6', J: 'FFEDE7F6',
            K: 'FFE8F8FF', L: 'FFE8F8FF',
        };

        dataRows.forEach(r => {
            const excelRow = sheet.addRow({
                emp_no: r.emp_no, name: r.name,
                h0_days: r.h0_days, h0_total: r.h0_total,
                h8_days: r.h8_days, h8_total: r.h8_total,
                h10_days: r.h10_days, h10_total: r.h10_total,
                h12_days: r.h12_days, h12_total: r.h12_total,
                w4_days: r.w4_days, w4_total: r.w4_total,
                fixed: r.fixed, grand_total: r.grand_total, note: r.note
            });
            excelRow.height = 22;
            const borderStyle = { style: 'thin', color: { argb: 'FFCCCCCC' } };
            const thinBorder = { top: borderStyle, left: borderStyle, bottom: borderStyle, right: borderStyle };
            excelRow.eachCell((cell, colNum) => {
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.border = thinBorder;
                const colLetter = String.fromCharCode(64 + colNum);
                if (groupColors[colLetter]) {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: groupColors[colLetter] } };
                }
            });
            excelRow.getCell('grand_total').font = { bold: true };
            excelRow.getCell('grand_total').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF9C4' } };
            if (r.note) {
                const noteCell = excelRow.getCell('note');
                noteCell.font = { color: { argb: 'FFCC0000' }, bold: true };
                noteCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3F3' } };
            }
            ['h0_days', 'h8_days', 'h10_days', 'h12_days'].forEach(k => {
                if (r[k] === 0) {
                    const col = { h0_days: 'C', h8_days: 'E', h10_days: 'G', h12_days: 'I' }[k];
                    excelRow.getCell(col).font = { color: { argb: 'FFAAAAAA' } };
                }
            });
        });

        if (dataRows.length > 0) {
            const startDataRow = 3;
            const endDataRow = 2 + dataRows.length;
            const footerRow = sheet.addRow([
                '合計', '',
                { formula: `SUM(C${startDataRow}:C${endDataRow})` },
                { formula: `SUM(D${startDataRow}:D${endDataRow})` },
                { formula: `SUM(E${startDataRow}:E${endDataRow})` },
                { formula: `SUM(F${startDataRow}:F${endDataRow})` },
                { formula: `SUM(G${startDataRow}:G${endDataRow})` },
                { formula: `SUM(H${startDataRow}:H${endDataRow})` },
                { formula: `SUM(I${startDataRow}:I${endDataRow})` },
                { formula: `SUM(J${startDataRow}:J${endDataRow})` },
                { formula: `SUM(K${startDataRow}:K${endDataRow})` },
                { formula: `SUM(L${startDataRow}:L${endDataRow})` },
                ''
            ]);
            footerRow.height = 22;
            footerRow.font = { bold: true };
            footerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
            footerRow.eachCell(cell => {
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.border = {
                    top: { style: 'medium' },
                    left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
                    bottom: { style: 'medium' },
                    right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
                };
            });
            sheet.mergeCells(`A${endDataRow + 1}:B${endDataRow + 1}`);
        }

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=ot_leather_tw_${start.replace(/-/g, '')}_${end.replace(/-/g, '')}.xlsx`);
        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Leather Dept + Foreign Workers Only OT Summary Excel Export
app.get('/api/export/excel/ot-summary-leather-fr', async (req, res) => {
    try {
        const { start, end } = req.query;
        if (!start || !end) return res.status(400).json({ error: "Missing start or end param" });

        const startStr = start.replace(/-/g, '/');
        const endStr = end.replace(/-/g, '/');

        const db = require('./db');
        const dbEmps = await new Promise((resolve) => {
            db.all(`SELECT * FROM employees`, (err, rows) => resolve(rows || []));
        });
        const dbEmpsMap = {};
        dbEmps.forEach(e => dbEmpsMap[e.emp_id] = e);

        const settingRows = await new Promise((resolve) => {
            db.all(`SELECT * FROM settings`, (err, rows) => resolve(rows || []));
        });
        const s = {};
        settingRows.forEach(r => s[r.key] = r.value);

        const fixedAllowance  = parseInt(s['fixed_monthly_allowance'] || 300);
        const commonOt4       = parseInt(s['common_ot4_allowance']    || 75);
        const commonHol8      = parseInt(s['common_hol8_allowance']   || 75);
        const commonHol10     = parseInt(s['common_hol10_allowance']  || 150);
        const commonHol12     = parseInt(s['common_hol12_allowance']  || 225);
        const foreignHolNoOt  = parseInt(s['foreign_hol_no_ot_allowance']  || 100);
        const foreignHol8Extra = parseInt(s['foreign_hol8_extra_allowance'] || 50);
        const ramadanStartStr = s['ramadan_start'];
        const ramadanEndStr = s['ramadan_end'];

        const dates = getDatesInRange(startStr, endStr);
        if (dates.length === 0) return res.status(400).json({ error: '日期範圍無效' });

        const placeholders = dates.map(() => '?').join(',');
        const dateStrings = dates.map(d => d.date);

        const records = await new Promise((resolve) => {
            db.all(`SELECT * FROM meal_records WHERE date IN (${placeholders})`, dateStrings, (err, rows) => resolve(rows || []));
        });

        const empMap = {};
        records.forEach(m => {
            const dbEmp = dbEmpsMap[m.emp_id];
            if (!dbEmp) return;
            // 只保留「皮革廠」且「外籍員工」
            // T1/T2 開頭 = 皮革; T7 外勞靠 division 欄位判斷
            const empNo = dbEmp.emp_no || '';
            let isLeatherDiv = empNo.startsWith('T1') || empNo.startsWith('T2');
            if (!isLeatherDiv && dbEmp.division) isLeatherDiv = (dbEmp.division === '皮革');
            if (!isLeatherDiv) return;
            if (dbEmp.is_foreign !== 1) return;
            if (empNo.startsWith('J')) return;
            if (dbEmp.department && dbEmp.department.includes('董事')) return;

            if (!empMap[m.emp_id]) {
                empMap[m.emp_id] = {
                    emp_no: dbEmp.emp_no,
                    name: dbEmp.name,
                    department: dbEmp.department,
                    is_foreign: true,
                    is_returning_home: dbEmp.is_returning_home === 1,
                    return_home_start: dbEmp.return_home_start,
                    return_home_end: dbEmp.return_home_end,
                    diet_type: dbEmp.diet_type || (dbEmp.nationality === '印尼' ? '齋戒' : '葷食'),
                    no_accommodation: dbEmp.no_accommodation === 1,
                    w4: 0, h0: 0, h8: 0, h10: 0, h12: 0
                };
            }

            const e = empMap[m.emp_id];
            const mDate = new Date(m.date);
            const day = mDate.getDay();
            const isWeekend = (day === 0 || day === 6);
            const isHoliday = (m.is_holiday === 1) || (hrCalendarCache[m.date.replace(/-/g, '/')] ?? isWeekend);
            const otHours = parseFloat(m.ot_hours) || 0;
            const isForeignWeekdayLeave = !isHoliday && (m.status === 'leave');

            if (isHoliday) {
                if (otHours >= 12) e.h12++;
                else if (otHours >= 10) e.h10++;
                else if (otHours >= 8) e.h8++;
                else e.h0++;
            } else {
                if (isForeignWeekdayLeave) e.h0++; // 外勞平日請假視同假日未加班
                else if (otHours >= 4) e.w4++;
            }
        });

        const dataRows = [];
        Object.values(empMap).forEach(e => {
            const noHolidayAllowance = e.is_returning_home || e.no_accommodation;
            const isEligibleForeigner = !noHolidayAllowance;
            const w4Total  = e.w4  * commonOt4;
            const h0Total  = e.h0  * (isEligibleForeigner ? foreignHolNoOt : 0);
            const h8Total  = e.h8  * (commonHol8 + (isEligibleForeigner ? foreignHol8Extra : 0));
            const h10Total = e.h10 * commonHol10;
            const h12Total = e.h12 * commonHol12;
            const fixed = noHolidayAllowance ? 0 : fixedAllowance;
            const grandTotal = w4Total + h0Total + h8Total + h10Total + h12Total + fixed;

            if (grandTotal === 0 && e.w4 === 0 && e.h0 === 0 && e.h8 === 0 && e.h10 === 0 && e.h12 === 0) return;

            let note = '';
            if (e.is_returning_home && e.no_accommodation) note = '返鄉、外宿';
            else if (e.is_returning_home) note = '返鄉';
            else if (e.no_accommodation) note = '外宿';

            if (e.is_returning_home && e.return_home_start && e.return_home_end) {
                note += (note === '返鄉' || note === '返鄉、外宿' ? ` (${e.return_home_start}~${e.return_home_end})` : ` 返鄉(${e.return_home_start}~${e.return_home_end})`);
            }
            if (e.diet_type === '齋戒' && ramadanStartStr && ramadanEndStr) {
                note += (note ? ' ' : '') + `齋戒 (${ramadanStartStr}~${ramadanEndStr})`;
            }

            dataRows.push({
                emp_no: e.emp_no, name: e.name, department: e.department,
                w4_days: e.w4, w4_total: w4Total,
                h0_days: e.h0, h0_total: h0Total,
                h8_days: e.h8, h8_total: h8Total,
                h10_days: e.h10, h10_total: h10Total,
                h12_days: e.h12, h12_total: h12Total,
                fixed, grand_total: grandTotal, note
            });
        });
        dataRows.sort((a, b) => (a.emp_no || '').localeCompare(b.emp_no || ''));

        // --- 產生 Excel ---
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('皮革外勞加班統計');
        sheet.views = [{ state: 'frozen', xSplit: 2, ySplit: 2 }];

        const row1 = sheet.addRow([
            '工號', '姓名',
            '假日未加班', '',
            '假日加班8hr', '',
            '假日加班10hr', '',
            '假日加班12hr', '',
            '平日加班4hr+', '',
            `固定津貼\n${fixedAllowance}/人`,
            '總計', '備註'
        ]);
        const row2 = sheet.addRow([
            '工號', '姓名',
            '天數', `補貼合計\n(外勞${foreignHolNoOt}/天)`,
            '天數', `合計\n(共同${commonHol8}+外勞+${foreignHol8Extra})`,
            '天數', `合計\n(${commonHol10}/天)`,
            '天數', `合計\n(${commonHol12}/天)`,
            '天數', `合計\n(${commonOt4}/次)`,
            '', '總計', '備註'
        ]);

        sheet.mergeCells('A1:A2'); sheet.mergeCells('B1:B2');
        sheet.mergeCells('C1:D1'); sheet.mergeCells('E1:F1');
        sheet.mergeCells('G1:H1'); sheet.mergeCells('I1:J1');
        sheet.mergeCells('K1:L1'); sheet.mergeCells('M1:M2');
        sheet.mergeCells('N1:N2'); sheet.mergeCells('O1:O2');

        sheet.columns = [
            { key: 'emp_no',      width: 12 }, { key: 'name',       width: 12 },
            { key: 'h0_days',     width: 9  }, { key: 'h0_total',   width: 16 },
            { key: 'h8_days',     width: 9  }, { key: 'h8_total',   width: 18 },
            { key: 'h10_days',    width: 10 }, { key: 'h10_total',  width: 14 },
            { key: 'h12_days',    width: 10 }, { key: 'h12_total',  width: 14 },
            { key: 'w4_days',     width: 10 }, { key: 'w4_total',   width: 14 },
            { key: 'fixed',       width: 12 }, { key: 'grand_total',width: 12 },
            { key: 'note',        width: 20 }
        ];

        const headerFill    = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
        const subHeaderFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2D5A9E' } };
        const headerFont  = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
        const centerAlign = { vertical: 'middle', horizontal: 'center', wrapText: true };

        [row1, row2].forEach((r, idx) => {
            r.height = 32;
            r.eachCell(cell => {
                cell.fill = idx === 0 ? headerFill : subHeaderFill;
                cell.font = headerFont;
                cell.alignment = centerAlign;
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FFFFFFFF' } },
                    left: { style: 'thin', color: { argb: 'FFFFFFFF' } },
                    bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } },
                    right: { style: 'thin', color: { argb: 'FFFFFFFF' } }
                };
            });
        });

        const groupColors = {
            C: 'FFE8F4FD', D: 'FFE8F4FD',
            E: 'FFFFE0B2', F: 'FFFFE0B2',
            G: 'FFFCE4EC', H: 'FFFCE4EC',
            I: 'FFEDE7F6', J: 'FFEDE7F6',
            K: 'FFE8F8FF', L: 'FFE8F8FF',
        };

        dataRows.forEach(r => {
            const excelRow = sheet.addRow({
                emp_no: r.emp_no, name: r.name,
                h0_days: r.h0_days, h0_total: r.h0_total,
                h8_days: r.h8_days, h8_total: r.h8_total,
                h10_days: r.h10_days, h10_total: r.h10_total,
                h12_days: r.h12_days, h12_total: r.h12_total,
                w4_days: r.w4_days, w4_total: r.w4_total,
                fixed: r.fixed, grand_total: r.grand_total, note: r.note
            });
            excelRow.height = 22;
            const borderStyle = { style: 'thin', color: { argb: 'FFCCCCCC' } };
            const thinBorder = { top: borderStyle, left: borderStyle, bottom: borderStyle, right: borderStyle };
            excelRow.eachCell((cell, colNum) => {
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.border = thinBorder;
                const colLetter = String.fromCharCode(64 + colNum);
                if (groupColors[colLetter]) {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: groupColors[colLetter] } };
                }
            });
            excelRow.getCell('grand_total').font = { bold: true };
            excelRow.getCell('grand_total').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF9C4' } };
            if (r.note) {
                const noteCell = excelRow.getCell('note');
                noteCell.font = { color: { argb: 'FFCC0000' }, bold: true };
                noteCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3F3' } };
            }
            ['h0_days', 'h8_days', 'h10_days', 'h12_days'].forEach(k => {
                if (r[k] === 0) {
                    const col = { h0_days: 'C', h8_days: 'E', h10_days: 'G', h12_days: 'I' }[k];
                    excelRow.getCell(col).font = { color: { argb: 'FFAAAAAA' } };
                }
            });
        });

        if (dataRows.length > 0) {
            const startDataRow = 3;
            const endDataRow = 2 + dataRows.length;
            const footerRow = sheet.addRow([
                '合計', '',
                { formula: `SUM(C${startDataRow}:C${endDataRow})` },
                { formula: `SUM(D${startDataRow}:D${endDataRow})` },
                { formula: `SUM(E${startDataRow}:E${endDataRow})` },
                { formula: `SUM(F${startDataRow}:F${endDataRow})` },
                { formula: `SUM(G${startDataRow}:G${endDataRow})` },
                { formula: `SUM(H${startDataRow}:H${endDataRow})` },
                { formula: `SUM(I${startDataRow}:I${endDataRow})` },
                { formula: `SUM(J${startDataRow}:J${endDataRow})` },
                { formula: `SUM(K${startDataRow}:K${endDataRow})` },
                { formula: `SUM(L${startDataRow}:L${endDataRow})` },
                ''
            ]);
            footerRow.height = 22;
            footerRow.font = { bold: true };
            footerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
            footerRow.eachCell(cell => {
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.border = {
                    top: { style: 'medium' },
                    left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
                    bottom: { style: 'medium' },
                    right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
                };
            });
            sheet.mergeCells(`A${endDataRow + 1}:B${endDataRow + 1}`);
        }

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=ot_leather_fr_${start.replace(/-/g, '')}_${end.replace(/-/g, '')}.xlsx`);
        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Textile Dept + Taiwanese Only OT Summary Excel Export
app.get('/api/export/excel/ot-summary-textile-tw', async (req, res) => {
    try {
        const { start, end } = req.query;
        if (!start || !end) return res.status(400).json({ error: "Missing start or end param" });

        const startStr = start.replace(/-/g, '/');
        const endStr = end.replace(/-/g, '/');

        // --- 取資料 (只篩紡織部門 + 本國員工) ---
        const db = require('./db');
        const dbEmps = await new Promise((resolve) => {
            db.all(`SELECT * FROM employees`, (err, rows) => resolve(rows || []));
        });
        const dbEmpsMap = {};
        dbEmps.forEach(e => dbEmpsMap[e.emp_id] = e);

        const settingRows = await new Promise((resolve) => {
            db.all(`SELECT * FROM settings`, (err, rows) => resolve(rows || []));
        });
        const s = {};
        settingRows.forEach(r => s[r.key] = r.value);

        const fixedAllowance = parseInt(s['fixed_monthly_allowance'] || 300);
        const commonOt4  = parseInt(s['common_ot4_allowance']  || 75);
        const commonHol8 = parseInt(s['common_hol8_allowance'] || 75);
        const commonHol10 = parseInt(s['common_hol10_allowance'] || 150);
        const commonHol12 = parseInt(s['common_hol12_allowance'] || 225);
        const foreignHolNoOt   = parseInt(s['foreign_hol_no_ot_allowance']  || 100);
        const foreignHol8Extra = parseInt(s['foreign_hol8_extra_allowance'] || 50);
        const ramadanStartStr = s['ramadan_start'];
        const ramadanEndStr = s['ramadan_end'];

        const dates = getDatesInRange(startStr, endStr);
        if (dates.length === 0) return res.status(400).json({ error: '日期範圍無效' });

        const placeholders = dates.map(() => '?').join(',');
        const dateStrings = dates.map(d => d.date);

        const records = await new Promise((resolve) => {
            db.all(`SELECT * FROM meal_records WHERE date IN (${placeholders})`, dateStrings, (err, rows) => resolve(rows || []));
        });

        const empMap = {};
        records.forEach(m => {
            const dbEmp = dbEmpsMap[m.emp_id];
            if (!dbEmp) return;
            // 只保留「紡織廠」且「本國員工」
            // T4 開頭 = 紡織; T7 外勞靠 division 欄位判斷
            const empNo = dbEmp.emp_no || '';
            let isTextileDiv = empNo.startsWith('T4');
            if (!isTextileDiv && dbEmp.division) isTextileDiv = (dbEmp.division === '紡織');
            if (!isTextileDiv) return;
            if (dbEmp.is_foreign === 1) return;
            if (empNo.startsWith('J')) return;
            if (dbEmp.department && dbEmp.department.includes('董事')) return;

            if (!empMap[m.emp_id]) {
                empMap[m.emp_id] = {
                    emp_no: dbEmp.emp_no,
                    name: dbEmp.name,
                    department: dbEmp.department,
                    is_foreign: false,
                    is_returning_home: dbEmp.is_returning_home === 1,
                    return_home_start: dbEmp.return_home_start,
                    return_home_end: dbEmp.return_home_end,
                    diet_type: dbEmp.diet_type || (dbEmp.nationality === '印尼' ? '齋戒' : '葷食'),
                    no_accommodation: dbEmp.no_accommodation === 1,
                    w4: 0, h0: 0, h8: 0, h10: 0, h12: 0
                };
            }

            const e = empMap[m.emp_id];
            const mDate = new Date(m.date);
            const day = mDate.getDay();
            const isWeekend = (day === 0 || day === 6);
            const isHoliday = (m.is_holiday === 1) || (hrCalendarCache[m.date.replace(/-/g, '/')] ?? isWeekend);
            const otHours = parseFloat(m.ot_hours) || 0;

            if (isHoliday) {
                if (otHours >= 12) e.h12++;
                else if (otHours >= 10) e.h10++;
                else if (otHours >= 8) e.h8++;
                else e.h0++;
            } else {
                if (otHours >= 4) e.w4++;
            }
        });

        const dataRows = [];
        Object.values(empMap).forEach(e => {
            const noHolidayAllowance = e.is_returning_home || e.no_accommodation;
            const w4Total  = e.w4  * commonOt4;
            const h0Total  = 0;  // 本國員工不計假日未加班補貼
            const h8Total  = e.h8  * commonHol8;
            const h10Total = e.h10 * commonHol10;
            const h12Total = e.h12 * commonHol12;
            const fixed = noHolidayAllowance ? 0 : fixedAllowance;
            const grandTotal = w4Total + h8Total + h10Total + h12Total + fixed;

            if (grandTotal === 0 && e.w4 === 0 && e.h0 === 0 && e.h8 === 0 && e.h10 === 0 && e.h12 === 0) return;

            let note = '';
            if (e.is_returning_home && e.no_accommodation) note = '返鄉、外宿';
            else if (e.is_returning_home) note = '返鄉';
            else if (e.no_accommodation) note = '外宿';

            if (e.is_returning_home && e.return_home_start && e.return_home_end) {
                note += (note === '返鄉' || note === '返鄉、外宿' ? ` (${e.return_home_start}~${e.return_home_end})` : ` 返鄉(${e.return_home_start}~${e.return_home_end})`);
            }
            if (e.diet_type === '齋戒' && ramadanStartStr && ramadanEndStr) {
                note += (note ? ' ' : '') + `齋戒 (${ramadanStartStr}~${ramadanEndStr})`;
            }

            dataRows.push({
                emp_no: e.emp_no, name: e.name, department: e.department,
                w4_days: e.w4, w4_total: w4Total,
                h0_days: e.h0, h0_total: h0Total,
                h8_days: e.h8, h8_total: h8Total,
                h10_days: e.h10, h10_total: h10Total,
                h12_days: e.h12, h12_total: h12Total,
                fixed, grand_total: grandTotal, note
            });
        });
        dataRows.sort((a, b) => (a.emp_no || '').localeCompare(b.emp_no || ''));

        // --- 產生 Excel ---
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('紡織本國加班統計');
        sheet.views = [{ state: 'frozen', xSplit: 2, ySplit: 2 }];

        const row1 = sheet.addRow([
            '工號', '姓名',
            '假日未加班', '',
            '假日加班8hr', '',
            '假日加班10hr', '',
            '假日加班12hr', '',
            '平日加班4hr+', '',
            `固定津貼\n${fixedAllowance}/人`,
            '總計', '備註'
        ]);
        const row2 = sheet.addRow([
            '工號', '姓名',
            '天數', `補貼合計\n(本國員工不適用)`,
            '天數', `合計\n(共同${commonHol8}/天)`,
            '天數', `合計\n(${commonHol10}/天)`,
            '天數', `合計\n(${commonHol12}/天)`,
            '天數', `合計\n(${commonOt4}/次)`,
            '', '總計', '備註'
        ]);

        sheet.mergeCells('A1:A2'); sheet.mergeCells('B1:B2');
        sheet.mergeCells('C1:D1'); sheet.mergeCells('E1:F1');
        sheet.mergeCells('G1:H1'); sheet.mergeCells('I1:J1');
        sheet.mergeCells('K1:L1'); sheet.mergeCells('M1:M2');
        sheet.mergeCells('N1:N2'); sheet.mergeCells('O1:O2');

        sheet.columns = [
            { key: 'emp_no',      width: 12 }, { key: 'name',       width: 12 },
            { key: 'h0_days',     width: 9  }, { key: 'h0_total',   width: 16 },
            { key: 'h8_days',     width: 9  }, { key: 'h8_total',   width: 14 },
            { key: 'h10_days',    width: 10 }, { key: 'h10_total',  width: 14 },
            { key: 'h12_days',    width: 10 }, { key: 'h12_total',  width: 14 },
            { key: 'w4_days',     width: 10 }, { key: 'w4_total',   width: 14 },
            { key: 'fixed',       width: 12 }, { key: 'grand_total',width: 12 },
            { key: 'note',        width: 20 }
        ];

        const headerFill    = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
        const subHeaderFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2D5A9E' } };
        const headerFont  = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
        const centerAlign = { vertical: 'middle', horizontal: 'center', wrapText: true };

        [row1, row2].forEach((r, idx) => {
            r.height = 32;
            r.eachCell(cell => {
                cell.fill = idx === 0 ? headerFill : subHeaderFill;
                cell.font = headerFont;
                cell.alignment = centerAlign;
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FFFFFFFF' } },
                    left: { style: 'thin', color: { argb: 'FFFFFFFF' } },
                    bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } },
                    right: { style: 'thin', color: { argb: 'FFFFFFFF' } }
                };
            });
        });

        const groupColors = {
            C: 'FFE8F4FD', D: 'FFE8F4FD',
            E: 'FFFFE0B2', F: 'FFFFE0B2',
            G: 'FFFCE4EC', H: 'FFFCE4EC',
            I: 'FFEDE7F6', J: 'FFEDE7F6',
            K: 'FFE8F8FF', L: 'FFE8F8FF',
        };

        dataRows.forEach(r => {
            const excelRow = sheet.addRow({
                emp_no: r.emp_no, name: r.name,
                h0_days: r.h0_days, h0_total: r.h0_total,
                h8_days: r.h8_days, h8_total: r.h8_total,
                h10_days: r.h10_days, h10_total: r.h10_total,
                h12_days: r.h12_days, h12_total: r.h12_total,
                w4_days: r.w4_days, w4_total: r.w4_total,
                fixed: r.fixed, grand_total: r.grand_total, note: r.note
            });
            excelRow.height = 22;
            const borderStyle = { style: 'thin', color: { argb: 'FFCCCCCC' } };
            const thinBorder = { top: borderStyle, left: borderStyle, bottom: borderStyle, right: borderStyle };
            excelRow.eachCell((cell, colNum) => {
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.border = thinBorder;
                const colLetter = String.fromCharCode(64 + colNum);
                if (groupColors[colLetter]) {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: groupColors[colLetter] } };
                }
            });
            excelRow.getCell('grand_total').font = { bold: true };
            excelRow.getCell('grand_total').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF9C4' } };
            if (r.note) {
                const noteCell = excelRow.getCell('note');
                noteCell.font = { color: { argb: 'FFCC0000' }, bold: true };
                noteCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3F3' } };
            }
            ['h0_days', 'h8_days', 'h10_days', 'h12_days'].forEach(k => {
                if (r[k] === 0) {
                    const col = { h0_days: 'C', h8_days: 'E', h10_days: 'G', h12_days: 'I' }[k];
                    excelRow.getCell(col).font = { color: { argb: 'FFAAAAAA' } };
                }
            });
        });

        if (dataRows.length > 0) {
            const startDataRow = 3;
            const endDataRow = 2 + dataRows.length;
            const footerRow = sheet.addRow([
                '合計', '',
                { formula: `SUM(C${startDataRow}:C${endDataRow})` },
                { formula: `SUM(D${startDataRow}:D${endDataRow})` },
                { formula: `SUM(E${startDataRow}:E${endDataRow})` },
                { formula: `SUM(F${startDataRow}:F${endDataRow})` },
                { formula: `SUM(G${startDataRow}:G${endDataRow})` },
                { formula: `SUM(H${startDataRow}:H${endDataRow})` },
                { formula: `SUM(I${startDataRow}:I${endDataRow})` },
                { formula: `SUM(J${startDataRow}:J${endDataRow})` },
                { formula: `SUM(K${startDataRow}:K${endDataRow})` },
                { formula: `SUM(L${startDataRow}:L${endDataRow})` },
                ''
            ]);
            footerRow.height = 22;
            footerRow.font = { bold: true };
            footerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
            footerRow.eachCell(cell => {
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.border = {
                    top: { style: 'medium' },
                    left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
                    bottom: { style: 'medium' },
                    right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
                };
            });
            sheet.mergeCells(`A${endDataRow + 1}:B${endDataRow + 1}`);
        }

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=ot_textile_tw_${start.replace(/-/g, '')}_${end.replace(/-/g, '')}.xlsx`);
        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Textile Dept + Foreign Workers Only OT Summary Excel Export
app.get('/api/export/excel/ot-summary-textile-fr', async (req, res) => {
    try {
        const { start, end } = req.query;
        if (!start || !end) return res.status(400).json({ error: "Missing start or end param" });

        const startStr = start.replace(/-/g, '/');
        const endStr = end.replace(/-/g, '/');

        const db = require('./db');
        const dbEmps = await new Promise((resolve) => {
            db.all(`SELECT * FROM employees`, (err, rows) => resolve(rows || []));
        });
        const dbEmpsMap = {};
        dbEmps.forEach(e => dbEmpsMap[e.emp_id] = e);

        const settingRows = await new Promise((resolve) => {
            db.all(`SELECT * FROM settings`, (err, rows) => resolve(rows || []));
        });
        const s = {};
        settingRows.forEach(r => s[r.key] = r.value);

        const fixedAllowance  = parseInt(s['fixed_monthly_allowance'] || 300);
        const commonOt4       = parseInt(s['common_ot4_allowance']    || 75);
        const commonHol8      = parseInt(s['common_hol8_allowance']   || 75);
        const commonHol10     = parseInt(s['common_hol10_allowance']  || 150);
        const commonHol12     = parseInt(s['common_hol12_allowance']  || 225);
        const foreignHolNoOt  = parseInt(s['foreign_hol_no_ot_allowance']  || 100);
        const foreignHol8Extra = parseInt(s['foreign_hol8_extra_allowance'] || 50);
        const ramadanStartStr = s['ramadan_start'];
        const ramadanEndStr = s['ramadan_end'];

        const dates = getDatesInRange(startStr, endStr);
        if (dates.length === 0) return res.status(400).json({ error: '日期範圍無效' });

        const placeholders = dates.map(() => '?').join(',');
        const dateStrings = dates.map(d => d.date);

        const records = await new Promise((resolve) => {
            db.all(`SELECT * FROM meal_records WHERE date IN (${placeholders})`, dateStrings, (err, rows) => resolve(rows || []));
        });

        const empMap = {};
        records.forEach(m => {
            const dbEmp = dbEmpsMap[m.emp_id];
            if (!dbEmp) return;
            // 只保留「紡織廠」且「外籍員工」
            const empNo = dbEmp.emp_no || '';
            let isTextileDiv = empNo.startsWith('T4');
            if (!isTextileDiv && dbEmp.division) isTextileDiv = (dbEmp.division === '紡織');
            if (!isTextileDiv) return;
            if (dbEmp.is_foreign !== 1) return;
            if (empNo.startsWith('J')) return;
            if (dbEmp.department && dbEmp.department.includes('董事')) return;

            if (!empMap[m.emp_id]) {
                empMap[m.emp_id] = {
                    emp_no: dbEmp.emp_no,
                    name: dbEmp.name,
                    department: dbEmp.department,
                    is_foreign: true,
                    is_returning_home: dbEmp.is_returning_home === 1,
                    return_home_start: dbEmp.return_home_start,
                    return_home_end: dbEmp.return_home_end,
                    diet_type: dbEmp.diet_type || (dbEmp.nationality === '印尼' ? '齋戒' : '葷食'),
                    no_accommodation: dbEmp.no_accommodation === 1,
                    w4: 0, h0: 0, h8: 0, h10: 0, h12: 0
                };
            }

            const e = empMap[m.emp_id];
            const mDate = new Date(m.date);
            const day = mDate.getDay();
            const isWeekend = (day === 0 || day === 6);
            const isHoliday = (m.is_holiday === 1) || (hrCalendarCache[m.date.replace(/-/g, '/')] ?? isWeekend);
            const otHours = parseFloat(m.ot_hours) || 0;
            const isForeignWeekdayLeave = !isHoliday && (m.status === 'leave');

            if (isHoliday) {
                if (otHours >= 12) e.h12++;
                else if (otHours >= 10) e.h10++;
                else if (otHours >= 8) e.h8++;
                else e.h0++;
            } else {
                if (isForeignWeekdayLeave) e.h0++; // 外勞平日請假視同假日未加班
                else if (otHours >= 4) e.w4++;
            }
        });

        const dataRows = [];
        Object.values(empMap).forEach(e => {
            const noHolidayAllowance = e.is_returning_home || e.no_accommodation;
            const isEligibleForeigner = !noHolidayAllowance;
            const w4Total  = e.w4  * commonOt4;
            const h0Total  = e.h0  * (isEligibleForeigner ? foreignHolNoOt : 0);
            const h8Total  = e.h8  * (commonHol8 + (isEligibleForeigner ? foreignHol8Extra : 0));
            const h10Total = e.h10 * commonHol10;
            const h12Total = e.h12 * commonHol12;
            const fixed = noHolidayAllowance ? 0 : fixedAllowance;
            const grandTotal = w4Total + h0Total + h8Total + h10Total + h12Total + fixed;

            if (grandTotal === 0 && e.w4 === 0 && e.h0 === 0 && e.h8 === 0 && e.h10 === 0 && e.h12 === 0) return;

            let note = '';
            if (e.is_returning_home && e.no_accommodation) note = '返鄉、外宿';
            else if (e.is_returning_home) note = '返鄉';
            else if (e.no_accommodation) note = '外宿';

            if (e.is_returning_home && e.return_home_start && e.return_home_end) {
                note += (note === '返鄉' || note === '返鄉、外宿' ? ` (${e.return_home_start}~${e.return_home_end})` : ` 返鄉(${e.return_home_start}~${e.return_home_end})`);
            }
            if (e.diet_type === '齋戒' && ramadanStartStr && ramadanEndStr) {
                note += (note ? ' ' : '') + `齋戒 (${ramadanStartStr}~${ramadanEndStr})`;
            }

            dataRows.push({
                emp_no: e.emp_no, name: e.name, department: e.department,
                w4_days: e.w4, w4_total: w4Total,
                h0_days: e.h0, h0_total: h0Total,
                h8_days: e.h8, h8_total: h8Total,
                h10_days: e.h10, h10_total: h10Total,
                h12_days: e.h12, h12_total: h12Total,
                fixed, grand_total: grandTotal, note
            });
        });
        dataRows.sort((a, b) => (a.emp_no || '').localeCompare(b.emp_no || ''));

        // --- 產生 Excel ---
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('紡織外勞加班統計');
        sheet.views = [{ state: 'frozen', xSplit: 2, ySplit: 2 }];

        const row1 = sheet.addRow([
            '工號', '姓名',
            '假日未加班', '',
            '假日加班8hr', '',
            '假日加班10hr', '',
            '假日加班12hr', '',
            '平日加班4hr+', '',
            `固定津貼\n${fixedAllowance}/人`,
            '總計', '備註'
        ]);
        const row2 = sheet.addRow([
            '工號', '姓名',
            '天數', `補貼合計\n(外勞${foreignHolNoOt}/天)`,
            '天數', `合計\n(共同${commonHol8}+外勞+${foreignHol8Extra})`,
            '天數', `合計\n(${commonHol10}/天)`,
            '天數', `合計\n(${commonHol12}/天)`,
            '天數', `合計\n(${commonOt4}/次)`,
            '', '總計', '備註'
        ]);

        sheet.mergeCells('A1:A2'); sheet.mergeCells('B1:B2');
        sheet.mergeCells('C1:D1'); sheet.mergeCells('E1:F1');
        sheet.mergeCells('G1:H1'); sheet.mergeCells('I1:J1');
        sheet.mergeCells('K1:L1'); sheet.mergeCells('M1:M2');
        sheet.mergeCells('N1:N2'); sheet.mergeCells('O1:O2');

        sheet.columns = [
            { key: 'emp_no',      width: 12 }, { key: 'name',       width: 12 },
            { key: 'h0_days',     width: 9  }, { key: 'h0_total',   width: 16 },
            { key: 'h8_days',     width: 9  }, { key: 'h8_total',   width: 18 },
            { key: 'h10_days',    width: 10 }, { key: 'h10_total',  width: 14 },
            { key: 'h12_days',    width: 10 }, { key: 'h12_total',  width: 14 },
            { key: 'w4_days',     width: 10 }, { key: 'w4_total',   width: 14 },
            { key: 'fixed',       width: 12 }, { key: 'grand_total',width: 12 },
            { key: 'note',        width: 20 }
        ];

        const headerFill    = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
        const subHeaderFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2D5A9E' } };
        const headerFont  = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
        const centerAlign = { vertical: 'middle', horizontal: 'center', wrapText: true };

        [row1, row2].forEach((r, idx) => {
            r.height = 32;
            r.eachCell(cell => {
                cell.fill = idx === 0 ? headerFill : subHeaderFill;
                cell.font = headerFont;
                cell.alignment = centerAlign;
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FFFFFFFF' } },
                    left: { style: 'thin', color: { argb: 'FFFFFFFF' } },
                    bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } },
                    right: { style: 'thin', color: { argb: 'FFFFFFFF' } }
                };
            });
        });

        const groupColors = {
            C: 'FFE8F4FD', D: 'FFE8F4FD',
            E: 'FFFFE0B2', F: 'FFFFE0B2',
            G: 'FFFCE4EC', H: 'FFFCE4EC',
            I: 'FFEDE7F6', J: 'FFEDE7F6',
            K: 'FFE8F8FF', L: 'FFE8F8FF',
        };

        dataRows.forEach(r => {
            const excelRow = sheet.addRow({
                emp_no: r.emp_no, name: r.name,
                h0_days: r.h0_days, h0_total: r.h0_total,
                h8_days: r.h8_days, h8_total: r.h8_total,
                h10_days: r.h10_days, h10_total: r.h10_total,
                h12_days: r.h12_days, h12_total: r.h12_total,
                w4_days: r.w4_days, w4_total: r.w4_total,
                fixed: r.fixed, grand_total: r.grand_total, note: r.note
            });
            excelRow.height = 22;
            const borderStyle = { style: 'thin', color: { argb: 'FFCCCCCC' } };
            const thinBorder = { top: borderStyle, left: borderStyle, bottom: borderStyle, right: borderStyle };
            excelRow.eachCell((cell, colNum) => {
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.border = thinBorder;
                const colLetter = String.fromCharCode(64 + colNum);
                if (groupColors[colLetter]) {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: groupColors[colLetter] } };
                }
            });
            excelRow.getCell('grand_total').font = { bold: true };
            excelRow.getCell('grand_total').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF9C4' } };
            if (r.note) {
                const noteCell = excelRow.getCell('note');
                noteCell.font = { color: { argb: 'FFCC0000' }, bold: true };
                noteCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3F3' } };
            }
            ['h0_days', 'h8_days', 'h10_days', 'h12_days'].forEach(k => {
                if (r[k] === 0) {
                    const col = { h0_days: 'C', h8_days: 'E', h10_days: 'G', h12_days: 'I' }[k];
                    excelRow.getCell(col).font = { color: { argb: 'FFAAAAAA' } };
                }
            });
        });

        if (dataRows.length > 0) {
            const startDataRow = 3;
            const endDataRow = 2 + dataRows.length;
            const footerRow = sheet.addRow([
                '合計', '',
                { formula: `SUM(C${startDataRow}:C${endDataRow})` },
                { formula: `SUM(D${startDataRow}:D${endDataRow})` },
                { formula: `SUM(E${startDataRow}:E${endDataRow})` },
                { formula: `SUM(F${startDataRow}:F${endDataRow})` },
                { formula: `SUM(G${startDataRow}:G${endDataRow})` },
                { formula: `SUM(H${startDataRow}:H${endDataRow})` },
                { formula: `SUM(I${startDataRow}:I${endDataRow})` },
                { formula: `SUM(J${startDataRow}:J${endDataRow})` },
                { formula: `SUM(K${startDataRow}:K${endDataRow})` },
                { formula: `SUM(L${startDataRow}:L${endDataRow})` },
                ''
            ]);
            footerRow.height = 22;
            footerRow.font = { bold: true };
            footerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
            footerRow.eachCell(cell => {
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.border = {
                    top: { style: 'medium' },
                    left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
                    bottom: { style: 'medium' },
                    right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
                };
            });
            sheet.mergeCells(`A${endDataRow + 1}:B${endDataRow + 1}`);
        }

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=ot_textile_fr_${start.replace(/-/g, '')}_${end.replace(/-/g, '')}.xlsx`);
        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// OT Summary settings preview API
app.get('/api/ot-summary/preview', async (req, res) => {
    try {
        const { start, end } = req.query;
        if (!start || !end) return res.status(400).json({ error: "Missing start or end param" });
        const data = await getOtSummaryData(start.replace(/-/g, '/'), end.replace(/-/g, '/'));
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.post('/api/print', async (req, res) => {
    try {
        const { htmlContent } = req.body;
        if (!htmlContent) return res.status(400).json({ error: "Missing HTML content" });
        
        const puppeteer = require('puppeteer');
        const ptp = require('pdf-to-printer');

        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        
        const pdfPath = path.join(__dirname, `temp_print_${Date.now()}.pdf`);
        await page.pdf({ 
            path: pdfPath, 
            format: 'A4', 
            printBackground: true, 
            margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' } 
        });
        
        await browser.close();

        await ptp.print(pdfPath, { printer: "RICOH MP C3503" });
        
        fs.unlinkSync(pdfPath);
        
        res.json({ success: true, message: "列印指令已發送至 RICOH MP C3503" });
    } catch (err) {
        console.error("Print Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Start server
app.listen(config.PORT, () => {
  console.log(`=========================================`);
  console.log(`警衛出勤訂餐看板伺服器啟動完成！`);
  console.log(`網址: http://localhost:${config.PORT}`);
  console.log(`設定檔狀態: ${isConfigured() ? '✅ 真實模式 (已設定 API 連線)' : '⚠️ 模擬測試模式 (尚未填寫 API 帳密)'}`);
  console.log(`=========================================`);
});
