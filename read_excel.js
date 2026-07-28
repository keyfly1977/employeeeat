const ExcelJS = require('exceljs');

async function readExcel(filePath) {
    console.log(`\n--- Reading ${filePath} ---`);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    workbook.eachSheet((worksheet, sheetId) => {
        console.log(`Sheet: ${worksheet.name}`);
        
        let rowCount = 0;
        worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
            if (rowCount < 5) {
                let rowValues = [];
                row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                    if (cell.type === ExcelJS.ValueType.Formula) {
                        rowValues.push(`[Formula: ${cell.formula} | Result: ${cell.result}]`);
                    } else {
                        rowValues.push(cell.value);
                    }
                });
                console.log(`Row ${rowNumber}: `, rowValues);
            }
            rowCount++;
        });
        console.log(`Total rows: ${rowCount}`);
    });
}

async function main() {
    try {
        await readExcel('./總務的伙食費115年.xlsx');
        await readExcel('./財務的伙食費115年.xlsx');
    } catch (error) {
        console.error('Error reading excel files:', error);
    }
}

main();
