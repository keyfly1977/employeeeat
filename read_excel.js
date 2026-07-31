const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

function readExcel() {
    const files = fs.readdirSync(__dirname);
    const excelFile = files.find(f => f.includes('財務的伙食費'));
    console.log("Reading:", excelFile);
    const workbook = XLSX.readFile(path.join(__dirname, excelFile));
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    for (let i = 0; i < 40; i++) {
        if (data[i]) {
            console.log(`Row ${i}: `, data[i].join(', '));
        }
    }
}

readExcel();
