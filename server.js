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

// Check if credentials are configured
function isConfigured() {
  return config.CO_ID && config.USER_ACCOUNT && config.USER_PWD;
}

// Helper to authenticate
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

    // 5. Fetch Overtime (emp_ot) using OT token
    const otRes = await fetch(`${config.HR_API_BASE}/api/am/emp_ot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${otToken}` },
      body: JSON.stringify({ CO_ID: config.CO_ID, OT_DATE: targetDateStr, LIMIT: 1000 })
    });
    let otRecords = [];
    if (otRes.ok) {
        const otResult = await otRes.json();
        otRecords = otResult.data || [];
    }
    const otMap = new Map();
    otRecords.forEach(ot => {
        otMap.set(ot.EMP_ID, ot);
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
    const noHolidayAllowanceMap = {};
    if (dbEmps) {
        dbEmps.forEach(e => {
            dietMap[e.emp_id] = e.diet_type;
            optOutLunchMap[e.emp_id] = e.opt_out_lunch === 1;
            optOutDinnerMap[e.emp_id] = e.opt_out_dinner === 1;
            noHolidayAllowanceMap[e.emp_id] = e.no_holiday_allowance === 1;
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
        if (!cardMatchMap.has(emp.EMP_ID) && !leaveMap.has(emp.EMP_ID)) return false; // 不在刷卡應出勤名單且未請假者，略過（免刷卡人員）
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
            
            // Check Ramadan
            if (settings && settings.ramadan_start && settings.ramadan_end) {
                const rStart = new Date(settings.ramadan_start);
                const rEnd = new Date(settings.ramadan_end);
                const current = new Date(targetDateStr.replace(/\//g, '-'));
                if (current >= rStart && current <= rEnd) {
                    isRamadan = true;
                }
            }
        }

        const dbDiet = dietMap[emp.EMP_ID];
        let finalDiet = defaultDiet;
        // DB diet applies only if it's not '齋戒' (which is time-based, not a permanent setting)
        if (dbDiet && dbDiet !== '齋戒') finalDiet = dbDiet;
        // Ramadan always takes final priority for Indonesian employees
        if (isRamadan) finalDiet = '齋戒';

        let optOutLunch = optOutLunchMap[emp.EMP_ID] || false;
        let optOutDinner = optOutDinnerMap[emp.EMP_ID] || false;

        // Auto opt-out lunch during Ramadan (highest priority, overrides DB opt-out setting)
        if (isRamadan && finalDiet === '齋戒') {
            optOutLunch = true;
        }

        let hasLunch = status === 'present';
        let hasDinner = !!ot;

        if (optOutLunch) hasLunch = false;
        if (optOutDinner) hasDinner = false;

        if (localRec) {
            hasLunch = localRec.has_lunch === 1;
            hasDinner = localRec.has_dinner === 1;
        }

        return {
            date: targetDateStr,
            empId: emp.EMP_ID,
            empNo: emp.EMP_NO,
            name: emp.EMP_NAME,
            deptName: emp.DEPT5_NAME || emp.DEPT4_NAME || emp.DEPT3_NAME || emp.DEPT2_NAME || emp.DEPT1_NAME || emp.DEPT_NAME || '未分配',
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
            noHolidayAllowance: noHolidayAllowanceMap[emp.EMP_ID] || false,
            nationality: nationalityStr,
            hasLunch,
            hasDinner,
            hasOt: !!ot,
            otHours: ot ? parseFloat(ot.OT_HOURS || ot.HOURS || ot.TOT_HOURS || 0) : 0
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
        db.all(`SELECT emp_id, diet_type, opt_out_lunch, opt_out_dinner, no_holiday_allowance FROM employees`, (err, rows) => {
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

// Update employee diet
app.post('/api/employees/diet', (req, res) => {
    const { empId, dietType } = req.body;
    db.run(`UPDATE employees SET diet_type = ? WHERE emp_id = ?`, [dietType, empId], function(err) {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        cachedData = null; // Invalidate cache
        res.json({ success: true });
    });
});

// Update employee meal opt-out defaults
// Update employee manual meal opt-out defaults
app.post('/api/employees/optout', (req, res) => {
    const { empId, optOutLunch, optOutDinner, noHolidayAllowance } = req.body;
    db.run(`UPDATE employees SET opt_out_lunch = ?, opt_out_dinner = ?, no_holiday_allowance = ? WHERE emp_id = ?`, 
        [optOutLunch ? 1 : 0, optOutDinner ? 1 : 0, noHolidayAllowance ? 1 : 0, empId], 
        function(err) {
            if (err) return res.status(500).json({ success: false, error: err.message });
            cachedData = null;
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

// Update allowance status (no accommodation / returning home)
app.put('/api/employees/:emp_id/allowance-status', (req, res) => {
    const { emp_id } = req.params;
    const { no_accommodation, is_returning_home, return_home_start, return_home_end } = req.body;
    db.run(`UPDATE employees SET no_accommodation = ?, is_returning_home = ?, return_home_start = ?, return_home_end = ? WHERE emp_id = ?`, 
        [no_accommodation ? 1 : 0, is_returning_home ? 1 : 0, return_home_start || null, return_home_end || null, emp_id], 
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
                res.json({ success: true });
            });
});

// Save all meals as a snapshot for today
app.post('/api/meals/save_all', (req, res) => {
    const { meals } = req.body;
    if (!meals || !Array.isArray(meals)) return res.status(400).json({ error: "Invalid meals data" });

    const todayObj = new Date();
    const yyyy = todayObj.getFullYear();
    const mm = String(todayObj.getMonth() + 1).padStart(2, '0');
    const dd = String(todayObj.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}/${mm}/${dd}`;

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        const stmt = db.prepare(`
            INSERT INTO meal_records (date, emp_id, has_lunch, has_dinner, is_holiday, ot_hours, status, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(date, emp_id) DO UPDATE SET 
            has_lunch=excluded.has_lunch, has_dinner=excluded.has_dinner, is_holiday=excluded.is_holiday, ot_hours=excluded.ot_hours, status=excluded.status, updated_at=CURRENT_TIMESTAMP
        `);
        
        const isHoliday = getDatesInRange(todayStr, todayStr)[0]?.isHoliday ? 1 : 0;

        for (const m of meals) {
            stmt.run([todayStr, m.empId, m.hasLunch ? 1 : 0, m.hasDinner ? 1 : 0, isHoliday, m.otHours || 0, m.status || 'present']);
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
        const isHoliday = (day === 0 || day === 6);
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
    const twAllowance = parseInt(s['taiwanese_meal_allowance'] || 1800);
    const frHolidayNoOT = parseInt(s['foreign_holiday_allowance'] || 100);
    const frHoliday8hr = parseInt(s['foreign_holiday_ot_8hr_allowance'] || 125);
    const frHoliday10hr = parseInt(s['foreign_holiday_ot_10hr_allowance'] || 150);
    const frBaseAllowance = parseInt(s['foreign_base_allowance'] || 300);
    const twBaseAllowance = parseInt(s['taiwanese_base_allowance'] || 300);

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
                no_accommodation: dbEmp.no_accommodation === 1,
                no_holiday_allowance: false, // In local DB only, this comes from employees table, but we don't use it directly here anyway
                diet_type: dbEmp.diet_type || (dbEmp.nationality === '印尼' ? '齋戒' : '葷食'),
                stats: { lunch: 0, dinner: 0, normal_days: 0, hol_no_ot: 0, hol_8hr: 0, hol_10hr: 0 },
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

        if (isHoliday) {
            if (!inReturnHomePeriod) {
                if (otHours >= 10) e.stats.hol_10hr++;
                else if (otHours >= 8) e.stats.hol_8hr++;
                else e.stats.hol_no_ot++;
            }
        } else {
            if (!inReturnHomePeriod) {
                e.stats.normal_days++;
            }
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
        const deduction = totalMeals * bentoPrice;

        let allowance = 0;
        let note = '';
        if (e.is_foreign) {
            if (e.no_accommodation) {
                allowance = 0;
                note = '無住宿 (不發津貼)';
            } else if (e.is_returning_home) {
                const proratedBase = Math.round((frBaseAllowance / 30) * e.stats.normal_days);
                allowance = proratedBase + 
                    (e.stats.hol_no_ot * frHolidayNoOT) + 
                    (e.stats.hol_8hr * frHoliday8hr) + 
                    (e.stats.hol_10hr * frHoliday10hr);
                note = `返鄉中 (底數依比例: ${proratedBase})`;
            } else {
                allowance = frBaseAllowance + 
                    (e.stats.hol_no_ot * frHolidayNoOT) + 
                    (e.stats.hol_8hr * frHoliday8hr) + 
                    (e.stats.hol_10hr * frHoliday10hr);
            }
        } else {
            allowance = Math.round((twAllowance / 30) * e.stats.normal_days) + 
                        twBaseAllowance + 
                        (e.stats.hol_8hr * frHoliday8hr) + 
                        (e.stats.hol_10hr * frHoliday10hr);
        }

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

        rows.push({
            id: e.emp_no,
            name: e.name,
            dept: e.department,
            days: e.days,
            deduction,
            allowance,
            norm: e.stats.normal_days,
            h0: e.stats.hol_no_ot,
            h8: e.stats.hol_8hr,
            h10: e.stats.hol_10hr,
            note: note
        });
    });

    return { dates, rows };
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
            { key: 'allowance', width: 15 },
            { key: 'norm', width: 15 },
            { key: 'h0', width: 15 },
            { key: 'h8', width: 15 },
            { key: 'h10', width: 20 },
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

        const headers2 = ['應扣伙食費', '應發津貼', '一般出勤(天)', '假日未加班(天)', '假日加班8hr(天)', '假日加班10hr+(天)', '備註'];
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
                allowance: r.allowance,
                norm: r.norm,
                h0: r.h0,
                h8: r.h8,
                h10: r.h10,
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

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=meal_report_${start.replace(/-/g, '')}_${end.replace(/-/g, '')}.xlsx`);
        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Print Endpoint
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
