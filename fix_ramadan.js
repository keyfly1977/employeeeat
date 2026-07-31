const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

// We need to extract ramadan_start and ramadan_end from settings 's'
const rStart = code.match(/const bentoPrice/);
if (rStart) {
    code = code.replace(/const bentoPrice/, "const ramadanStartStr = s['ramadan_start'];\n    const ramadanEndStr = s['ramadan_end'];\n    const bentoPrice");
}

const newCheck1 = `        else if (e.diet_type === '齋戒') {
            if (ramadanStartStr && ramadanEndStr) {
                const rs = new Date(ramadanStartStr);
                const re = new Date(ramadanEndStr);
                if (mDate >= rs && mDate <= re) cellNote = '齋戒';
            }
        }`;
code = code.replace(/else if \(e\.diet_type === '齋戒'\) cellNote = '齋戒';/, newCheck1);

const newCheck2 = `                if (!cellNote && e.diet_type === '齋戒') {
                    if (ramadanStartStr && ramadanEndStr) {
                        const rs = new Date(ramadanStartStr);
                        const re = new Date(ramadanEndStr);
                        if (mDate >= rs && mDate <= re) cellNote = '齋戒';
                    }
                }`;
code = code.replace(/if \(!cellNote && e\.diet_type === '齋戒'\) cellNote = '齋戒';/, newCheck2);

fs.writeFileSync('server.js', code);
console.log('Modified server.js to respect Ramadan dates');
