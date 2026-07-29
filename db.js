const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // 員工資料表
    db.run(`CREATE TABLE IF NOT EXISTS employees (
        emp_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        department TEXT,
        is_foreign INTEGER DEFAULT 0
    )`);

    // 每日訂餐紀錄
    db.run(`CREATE TABLE IF NOT EXISTS meal_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        emp_id TEXT NOT NULL,
        has_lunch INTEGER DEFAULT 0,
        has_dinner INTEGER DEFAULT 0,
        is_holiday INTEGER DEFAULT 0,
        ot_hours INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(date, emp_id)
    )`);

    // 系統設定 (單價、津貼等)
    db.run(`CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
    )`);

    // Add diet_type column if it doesn't exist
    db.run(`ALTER TABLE employees ADD COLUMN diet_type TEXT`, (err) => {
        // Ignore error if column already exists
    });
    db.run(`ALTER TABLE employees ADD COLUMN opt_out_lunch INTEGER DEFAULT 0`, (err) => {});
    db.run(`ALTER TABLE employees ADD COLUMN opt_out_dinner INTEGER DEFAULT 0`, (err) => {});
    db.run(`ALTER TABLE employees ADD COLUMN no_holiday_allowance INTEGER DEFAULT 0`, (err) => {});

    // 初始化預設設定
    const defaultSettings = {
        'bento_price': '60',
        'foreign_holiday_allowance': '100',
        'foreign_holiday_ot_8hr_allowance': '125',
        'foreign_holiday_ot_10hr_allowance': '150',
        'foreign_holiday_ot_12hr_allowance': '150',
        'foreign_base_allowance': '1000',
        'taiwanese_meal_allowance': '1800',
        'ramadan_start': '2026-02-18',
        'ramadan_end': '2026-03-19'
    };

    const stmt = db.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`);
    for (const [key, value] of Object.entries(defaultSettings)) {
        stmt.run(key, value);
    }
    stmt.finalize();
});

console.log('Database initialized at', dbPath);

module.exports = db;
