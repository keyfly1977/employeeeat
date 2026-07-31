const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const startStr = 'function getFinanceData(startStr, endStr) {';
const endStr = "const ExcelJS = require('exceljs');";

const startIndex = code.indexOf(startStr);
const endIndex = code.indexOf(endStr);

if (startIndex === -1 || endIndex === -1) {
    console.log("Could not find boundaries", startIndex, endIndex);
    process.exit(1);
}

let rewriteScript = fs.readFileSync('rewrite_finance.js', 'utf8');
const replStart = rewriteScript.indexOf('async function getFinanceData(startStr, endStr) {');
const replEnd = rewriteScript.indexOf('`;\n\nif (!regex.test(code))');
const replacement = rewriteScript.substring(replStart, replEnd);

const newCode = code.substring(0, startIndex) + replacement + '\n\n' + code.substring(endIndex);
fs.writeFileSync('server.js', newCode);
console.log("Successfully updated server.js");
