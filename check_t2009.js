const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');
db.run("UPDATE employees SET diet_type = NULL WHERE diet_type = '齋戒'", function(err) {
    if (err) console.log('err:', err.message);
    else console.log('已清除 ' + this.changes + ' 筆殘留的齋戒 diet_type 記錄');
    db.close();
});
