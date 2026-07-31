const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/ryan.hsu/Downloads/外勞用餐';

async function readExcelInfo(filename) {
    console.log(`\n=== Analyzing ${filename} ===`);
    const workbook = new ExcelJS.Workbook();
    try {
        await workbook.xlsx.readFile(path.join(dir, filename));
        workbook.eachSheet((worksheet, sheetId) => {
            console.log(`Sheet ID: ${sheetId}, Name: ${worksheet.name}`);
            
            // Get first 15 rows
            for (let i = 1; i <= Math.min(15, worksheet.rowCount); i++) {
                const row = worksheet.getRow(i);
                console.log(`Row ${i}:`, JSON.stringify(row.values));
            }
            console.log('-------------------------');
        });
    } catch (e) {
        console.error(`Error reading ${filename}:`, e.message);
    }
}

async function main() {
    await readExcelInfo('總務的伙食費115年.xlsx');
    await readExcelInfo('財務的伙食費115年.xlsx');
}

main();
