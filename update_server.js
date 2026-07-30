const fs = require('fs');

const file = fs.readFileSync('server.js', 'utf8');

const replacement = `function getDatesInRange(startStr, endStr) {
    const dates = [];
    const [sy, sm, sd] = startStr.split(/[-/]/);
    const [ey, em, ed] = endStr.split(/[-/]/);
    let curr = new Date(sy, sm - 1, sd);
    const end = new Date(ey, em - 1, ed);
    while (curr <= end) {
        const yyyy = curr.getFullYear();
        const m = String(curr.getMonth() + 1).padStart(2, '0');
        const d = String(curr.getDate()).padStart(2, '0');
        const dateStr = \`\${yyyy}/\${m}/\${d}\`;
        const day = curr.getDay();
        const isHoliday = (day === 0 || day === 6);
        dates.push({
            date: dateStr,
            label: \`\${parseInt(m)}/\${parseInt(d)}\`,
            isHoliday
        });
        curr.setDate(curr.getDate() + 1);
    }
    return dates;
}

function getFinanceData(startStr, endStr) {
    return new Promise((resolve, reject) => {
        db.all(\`SELECT * FROM settings\`, (err, settingRows) => {
            if (err) return reject(err);
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
            if (dates.length === 0) return resolve({ dates: [], rows: [] });

            db.all(\`SELECT * FROM employees\`, (err, emps) => {
                if (err) return reject(err);
                const empMap = {};
                emps.forEach(e => {
                    empMap[e.emp_id] = e;
                    e.stats = { lunch: 0, dinner: 0, normal_days: 0, hol_no_ot: 0, hol_8hr: 0, hol_10hr: 0 };
                    e.days = {};
                });

                const placeholders = dates.map(() => '?').join(',');
                const dateValues = dates.map(d => d.date);
                db.all(\`SELECT * FROM meal_records WHERE date IN (\${placeholders})\`, dateValues, (err, meals) => {
                    if (err) return reject(err);
                    
                    meals.forEach(m => {
                        const e = empMap[m.emp_id];
                        if (!e) return;
                        e.stats.lunch += m.has_lunch || 0;
                        e.stats.dinner += m.has_dinner || 0;
                        
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

                        if (m.is_holiday) {
                            if (!inReturnHomePeriod) {
                                if (m.ot_hours >= 10) e.stats.hol_10hr++;
                                else if (m.ot_hours >= 8) e.stats.hol_8hr++;
                                else e.stats.hol_no_ot++;
                            }
                        } else {
                            e.stats.normal_days++;
                        }
                        
                        let cellNote = '';
                        if (inReturnHomePeriod) cellNote = '返鄉';
                        else if (e.diet_type === '齋戒') cellNote = '齋戒';
                        
                        e.days[m.date] = {
                            l: m.has_lunch ? true : false,
                            d: m.has_dinner ? true : false,
                            note: cellNote,
                            lText: '',
                            dText: ''
                        };
                        
                        if (cellNote === '返鄉') {
                            e.days[m.date].lText = '返鄉';
                            e.days[m.date].dText = '返鄉';
                        } else if (cellNote === '齋戒') {
                            if (!m.has_lunch) e.days[m.date].lText = '齋戒';
                            if (!m.has_dinner) e.days[m.date].dText = '齋戒';
                        }
                    });

                    const rows = [];
                    Object.values(empMap).forEach(e => {
                        if (!e.emp_no) return;
                        const empNo = e.emp_no.toString();
                        const dept = e.department || '';
                        if (empNo.startsWith('J')) return;
                        if (dept.includes('董事')) return;
                        
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
                            id: empNo,
                            name: e.name,
                            dept: e.department,
                            deduction,
                            allowance,
                            norm: e.stats.normal_days,
                            h0: e.stats.hol_no_ot,
                            h8: e.stats.hol_8hr,
                            h10: e.stats.hol_10hr,
                            note,
                            days: e.days
                        });
                    });
                    
                    resolve({ dates, rows });
                });
            });
        });
    });
}

app.get('/api/finance/preview', async (req, res) => {
    try {
        const { start, end } = req.query;
        if (!start || !end) return res.status(400).json({ error: "Missing start or end date" });
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
        const sheet = workbook.addWorksheet(\`餐費結算_\${start.replace(/-/g, '')}_\${end.replace(/-/g, '')}\`);
        
        const baseColumns1 = [
            { key: 'id', width: 12 },
            { key: 'name', width: 15 },
            { key: 'dept', width: 15 }
        ];

        const dailyColumns = [];
        data.dates.forEach((d, i) => {
            dailyColumns.push({ key: \`d\${i}_l\`, width: 8 });
            dailyColumns.push({ key: \`d\${i}_d\`, width: 8 });
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
            sheet.mergeCells(\`\${cellStart}:\${cellEnd}\`);
            colIndex += 2;
        });

        headers2.forEach(() => {
            const startAddr = sheet.getRow(1).getCell(colIndex).address;
            const endAddr = sheet.getRow(2).getCell(colIndex).address;
            sheet.mergeCells(\`\${startAddr}:\${endAddr}\`);
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
                rowData[\`d\${i}_l\`] = dayData.lText || (dayData.l ? 'V' : '');
                rowData[\`d\${i}_d\`] = dayData.dText || (dayData.d ? 'V' : '');
            });

            const excelRow = sheet.addRow(rowData);
            
            // Apply styling
            let cellColIndex = 4;
            data.dates.forEach((d, i) => {
                const dayData = r.days[d.date];
                const bg = d.isHoliday ? 'FFF2F2F2' : (dayData.note === '返鄉' ? 'FFFFF9C4' : (dayData.note === '齋戒' ? 'FFE8F5E9' : null));
                
                if (bg) {
                    const lCell = excelRow.getCell(cellColIndex);
                    const dCell = excelRow.getCell(cellColIndex + 1);
                    lCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
                    dCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
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
        res.setHeader('Content-Disposition', \`attachment; filename=meal_report_\${start.replace(/-/g, '')}_\${end.replace(/-/g, '')}.xlsx\`);
        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});`;

const searchRegex = /\/\/ Export Excel\nconst ExcelJS = require\('exceljs'\);\napp\.get\('\/api\/export\/excel', async \(req, res\) => \{[\s\S]*?(?=\/\/ Print Endpoint)/;

const newFile = file.replace(searchRegex, replacement + '\n\n');
fs.writeFileSync('server.js', newFile);
