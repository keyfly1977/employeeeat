const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

// Add getMealsFromLocal function
const localFunc = `
async function getMealsFromLocal(dateStr, dbEmps, settings) {
    const db = require('./db');
    return new Promise((resolve) => {
        db.all(\`SELECT m.*, e.emp_no, e.name, e.department, e.is_foreign, e.diet_type 
                FROM meal_records m
                JOIN employees e ON m.emp_id = e.emp_id
                WHERE m.date = ?\`, [dateStr], (err, rows) => {
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
`;

if (!code.includes('async function getMealsFromLocal')) {
    code = code.replace(/async function getMealsForDate/, localFunc + '\nasync function getMealsForDate');
}

// Modify /api/meals/today to use getMealsFromLocal for historical
const apiRegex = /let targetDates = \[\];[\s\S]*?finalCombinedList = finalCombinedList\.concat\(list\);\n    \}/;
const apiReplacement = `let targetDates = [];
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
            targetDates.push(\`\${y}/\${m}/\${day}\`);
        }
    } else if (queryDate) {
        isHistorical = true;
        targetDates = [queryDate.replace(/-/g, '/')];
    } else {
        const todayObj = new Date();
        const yyyy = todayObj.getFullYear();
        const mm = String(todayObj.getMonth() + 1).padStart(2, '0');
        const dd = String(todayObj.getDate()).padStart(2, '0');
        targetDates = [\`\${yyyy}/\${mm}/\${dd}\`];
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
    }`;

if (!code.includes('if (isHistorical) {')) {
    code = code.replace(apiRegex, apiReplacement);
}

fs.writeFileSync('server.js', code);
console.log("Successfully rewrote /api/meals/today for local historical queries");
