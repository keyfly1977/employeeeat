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
async function getMealsForDate(targetDateStr, mainToken, otToken, employees, dbEmps) {
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

    const dietMap = {};
    const optOutLunchMap = {};
    const optOutDinnerMap = {};
    if (dbEmps) {
        dbEmps.forEach(e => {
            dietMap[e.emp_id] = e.diet_type;
            optOutLunchMap[e.emp_id] = e.opt_out_lunch === 1;
            optOutDinnerMap[e.emp_id] = e.opt_out_dinner === 1;
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
        const isBoard = (emp.DEPT_NAME && emp.DEPT_NAME.includes('董事'));
        if (isBoard) return false;
        if (emp.EMP_NO && emp.EMP_NO.startsWith('J')) return false; // 忽略 J 開頭工號
        if (!cardMatchMap.has(emp.EMP_ID) && !leaveMap.has(emp.EMP_ID)) return false; 
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

        const isIndonesian = emp.NATIONALITY_NAME && emp.NATIONALITY_NAME.includes("印尼");
        
        // Determine diet type (priority: db > default)
        let defaultDiet = '葷食';
        if (isIndonesian) {
            defaultDiet = '不吃豬';
        }

        let finalDiet = dietMap[emp.EMP_ID] || defaultDiet;
        let optOutLunch = optOutLunchMap[emp.EMP_ID] || false;
        let optOutDinner = optOutDinnerMap[emp.EMP_ID] || false;

        let hasLunch = status === 'present';
        let hasDinner = !!ot;

        if (finalDiet === '齋戒') {
            hasLunch = false;
        }

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
                reason: leave.REASON || '請假',
                start: leave.LEAVE_START ? leave.LEAVE_START.split(' ')[1].substring(0,5) : '',
                end: leave.LEAVE_END ? leave.LEAVE_END.split(' ')[1].substring(0,5) : ''
            } : null,
            dietType: finalDiet,
            optOutLunch: optOutLunch,
            optOutDinner: optOutDinner,
            nationality: emp.NATIONALITY_NAME || "中華民國",
            hasLunch,
            hasDinner,
            hasOt: !!ot
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
        const stmt = db.prepare(`INSERT INTO employees (emp_id, name, department, is_foreign) VALUES (?, ?, ?, ?) ON CONFLICT(emp_id) DO UPDATE SET name=excluded.name, department=excluded.department, is_foreign=excluded.is_foreign`);
        employees.forEach(emp => {
            if (emp.EMP_NO && emp.EMP_NO.startsWith('J')) return; // 忽略 J 開頭工號
            const isForeign = emp.NATIONALITY_NAME && emp.NATIONALITY_NAME.includes("印尼") ? 1 : 0;
            const dept = emp.DEPT5_NAME || emp.DEPT4_NAME || emp.DEPT3_NAME || emp.DEPT2_NAME || emp.DEPT1_NAME || emp.DEPT_NAME || '未分配';
            stmt.run(emp.EMP_ID, emp.EMP_NAME, dept, isForeign);
        });
        stmt.finalize();
    });

    const dbEmps = await new Promise((resolve) => {
        db.all(`SELECT emp_id, diet_type, opt_out_lunch, opt_out_dinner FROM employees`, (err, rows) => {
            resolve(rows || []);
        });
    });

    // Build dates array
    let targetDates = [];
    if (isRangeQuery) {
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
        const list = await getMealsForDate(d, mainToken, otToken, employees, dbEmps);
        finalCombinedList = finalCombinedList.concat(list);
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
app.post('/api/employees/optout', (req, res) => {
    const { empId, optOutLunch, optOutDinner } = req.body;
    db.run(`UPDATE employees SET opt_out_lunch = ?, opt_out_dinner = ? WHERE emp_id = ?`, 
        [optOutLunch ? 1 : 0, optOutDinner ? 1 : 0, empId], 
        function(err) {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            cachedData = null; // Invalidate cache
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

// Export Excel
const ExcelJS = require('exceljs');
app.get('/api/export/excel', async (req, res) => {
    const { yyyymm } = req.query; // format like "2026/05"
    if (!yyyymm) return res.status(400).json({ error: "Missing yyyymm param" });

    // In a real app we'd fetch all meal_records for the month.
    // We'll generate a simplified mock Excel to demonstrate feasibility.
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(`伙食費結算_${yyyymm.replace('/', '')}`);
    
    sheet.columns = [
        { header: '工號', key: 'emp_id', width: 15 },
        { header: '姓名', key: 'name', width: 20 },
        { header: '部門', key: 'dept', width: 20 },
        { header: '午餐次數', key: 'lunch_count', width: 15 },
        { header: '晚餐次數', key: 'dinner_count', width: 15 },
        { header: '應扣伙食費', key: 'deduction', width: 20 },
    ];

    db.all(`SELECT emp_id, sum(has_lunch) as lunch_count, sum(has_dinner) as dinner_count 
            FROM meal_records WHERE date LIKE ? GROUP BY emp_id`, 
            [`${yyyymm}%`], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        db.all(`SELECT * FROM employees`, (err, emps) => {
            const empMap = {};
            emps.forEach(e => empMap[e.emp_id] = e);

            db.get(`SELECT value FROM settings WHERE key='bento_price'`, (err, setting) => {
                const bentoPrice = setting ? parseInt(setting.value) : 60;

                rows.forEach(r => {
                    const emp = empMap[r.emp_id] || { name: 'Unknown', department: 'Unknown' };
                    sheet.addRow({
                        emp_id: r.emp_id,
                        name: emp.name,
                        dept: emp.department,
                        lunch_count: r.lunch_count,
                        dinner_count: r.dinner_count,
                        deduction: (r.lunch_count + r.dinner_count) * bentoPrice
                    });
                });

                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', `attachment; filename=meal_report_${yyyymm.replace('/', '')}.xlsx`);
                workbook.xlsx.write(res).then(() => {
                    res.end();
                });
            });
        });
    });
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
