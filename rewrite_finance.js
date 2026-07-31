const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const regex = /function getFinanceData\(startStr, endStr\) \{[\s\S]*?(?=\n\/\/ Export Excel|\n\/\/ Finance Preview)/;
const replacement = `async function getFinanceData(startStr, endStr) {
    const config = require('./config.json');
    const db = require('./db');

    let mainToken = '';
    let otToken = '';
    try {
        mainToken = await getAuthToken(config.USER_ACCOUNT, config.USER_PWD);
        otToken = mainToken;
        if (config.OT_USER_ACCOUNT && config.OT_USER_PWD) {
            otToken = await getAuthToken(config.OT_USER_ACCOUNT, config.OT_USER_PWD);
        }
    } catch (e) {
        throw new Error('無法取得 HR 系統授權 Token: ' + e.message);
    }

    const empRes = await fetch(\`\${config.HR_API_BASE}/api/ed/emp\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${mainToken}\` },
      body: JSON.stringify({ CO_ID: config.CO_ID, LIMIT: 1000 })
    });
    if (!empRes.ok) throw new Error(\`Fetch employees failed: \${empRes.status}\`);
    const empResult = await empRes.json();
    const employees = empResult.data || [];

    const dbEmps = await new Promise((resolve) => {
        db.all(\`SELECT * FROM employees\`, (err, rows) => resolve(rows || []));
    });
    const dbEmpsMap = {};
    dbEmps.forEach(e => dbEmpsMap[e.emp_id] = e);

    const settingRows = await new Promise((resolve) => {
        db.all(\`SELECT * FROM settings\`, (err, rows) => resolve(rows || []));
    });
    const s = {};
    settingRows.forEach(r => s[r.key] = r.value);
    
    const bentoPrice = parseInt(s['bento_price'] || 60);
    const twAllowance = parseInt(s['taiwanese_meal_allowance'] || 1800);
    const frHolidayNoOT = parseInt(s['foreign_holiday_allowance'] || 100);
    const frHoliday8hr = parseInt(s['foreign_holiday_ot_8hr_allowance'] || 125);
    const frHoliday10hr = parseInt(s['foreign_holiday_ot_10hr_allowance'] || 150);
    const frBaseAllowance = parseInt(s['foreign_base_allowance'] || 300);
    const twBaseAllowance = parseInt(s['taiwanese_base_allowance'] || 300);

    const dates = getDatesInRange(startStr, endStr);
    if (dates.length === 0) return { dates: [], rows: [] };

    const empMap = {};

    for (const d of dates) {
        const dailyList = await getMealsForDate(d.date, mainToken, otToken, employees, dbEmps, s);
        dailyList.forEach(m => {
            if (m.empNo && m.empNo.startsWith('J')) return; 
            if (m.deptName && m.deptName.includes('董事')) return;

            if (!empMap[m.empId]) {
                const dbEmp = dbEmpsMap[m.empId];
                empMap[m.empId] = {
                    emp_no: m.empNo,
                    name: m.name,
                    department: m.deptName,
                    is_foreign: dbEmp ? dbEmp.is_foreign === 1 : (m.nationality !== '中華民國'),
                    is_returning_home: dbEmp ? dbEmp.is_returning_home === 1 : false,
                    return_home_start: dbEmp ? dbEmp.return_home_start : null,
                    return_home_end: dbEmp ? dbEmp.return_home_end : null,
                    no_accommodation: dbEmp ? dbEmp.no_accommodation === 1 : false,
                    no_holiday_allowance: m.noHolidayAllowance ? 1 : 0,
                    diet_type: m.dietType,
                    stats: { lunch: 0, dinner: 0, normal_days: 0, hol_no_ot: 0, hol_8hr: 0, hol_10hr: 0 },
                    days: {}
                };
            }
            const e = empMap[m.empId];
            e.stats.lunch += m.hasLunch ? 1 : 0;
            e.stats.dinner += m.hasDinner ? 1 : 0;
            
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

            if (d.isHoliday) {
                if (!inReturnHomePeriod) {
                    if (m.otHours >= 10) e.stats.hol_10hr++;
                    else if (m.otHours >= 8) e.stats.hol_8hr++;
                    else e.stats.hol_no_ot++;
                }
            } else {
                e.stats.normal_days++;
            }
            
            let cellNote = '';
            if (inReturnHomePeriod) cellNote = '返鄉';
            else if (m.dietType === '齋戒') cellNote = '齋戒';
            
            e.days[m.date] = {
                l: m.hasLunch,
                d: m.hasDinner,
                note: cellNote,
                lText: '',
                dText: ''
            };
            
            if (cellNote === '返鄉') {
                e.days[m.date].lText = '返鄉';
                e.days[m.date].dText = '返鄉';
            } else if (cellNote === '齋戒') {
                if (!m.hasLunch) e.days[m.date].lText = '齋戒';
                if (!m.hasDinner) e.days[m.date].dText = '齋戒';
            }
        });
    }

    const rows = [];
    Object.values(empMap).forEach(e => {
        const totalMeals = e.stats.lunch + e.stats.dinner;
        if (totalMeals === 0) return; 

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
                note = \`返鄉中 (底數依比例: \${proratedBase})\`;
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
                if (!cellNote && e.diet_type === '齋戒') cellNote = '齋戒';
                
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
`;

if (!regex.test(code)) {
  console.log("Could not find getFinanceData pattern!");
  process.exit(1);
}

const newCode = code.replace(regex, replacement + '\n');
fs.writeFileSync('server.js', newCode);
console.log('Successfully updated server.js');
