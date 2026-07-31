const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');
db.all("SELECT emp_id, emp_no, name, department FROM employees WHERE name LIKE '%曾文玲%'", (err, rows) => {
    console.log(rows);
});
