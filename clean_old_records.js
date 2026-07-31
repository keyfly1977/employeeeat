const db = require('./db');

db.run("DELETE FROM meal_records WHERE date < '2026/07/29'", (err) => {
    if (err) {
        console.error("Error deleting old records:", err);
    } else {
        console.log("Successfully deleted meal_records before 2026/07/29");
    }
});
