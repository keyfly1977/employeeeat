const fs = require('fs');
let code = fs.readFileSync('public/index.html', 'utf8');

// 1. the wrapper div
code = code.replace(
    '<div class="table-container" style="overflow-x: auto;">',
    `<style>
          .sticky-col-1 { position: sticky; left: 0; background: #fff; z-index: 5; outline: 1px solid var(--glass-border); }
          .sticky-col-2 { position: sticky; left: 70px; background: #fff; z-index: 5; outline: 1px solid var(--glass-border); }
          .sticky-top { position: sticky; top: 0; z-index: 4; background: #fff; outline: 1px solid var(--glass-border); }
          .sticky-top-2 { position: sticky; top: 46px; z-index: 4; background: #fff; outline: 1px solid var(--glass-border); }
          .sticky-cross-1 { position: sticky; top: 0; left: 0; z-index: 10; background: #fff; min-width: 70px; max-width: 70px; outline: 1px solid var(--glass-border); }
          .sticky-cross-2 { position: sticky; top: 0; left: 70px; z-index: 10; background: #fff; min-width: 90px; max-width: 90px; outline: 1px solid var(--glass-border); }
        </style>
        <div class="table-container" style="overflow: auto; max-height: 65vh; position: relative; border-radius: 8px; border: 1px solid var(--glass-border);">`
);

// 3. headerRow1 in JS
code = code.replace(
    '<th rowspan="2" style="padding: 12px 15px; font-weight: 600; border-bottom: 2px solid var(--glass-border); border-right: 1px solid var(--glass-border);">工號</th>',
    '<th class="sticky-cross-1" rowspan="2" style="padding: 12px 15px; font-weight: 600; border-bottom: 2px solid var(--glass-border); border-right: 1px solid var(--glass-border);">工號</th>'
);
code = code.replace(
    '<th rowspan="2" style="padding: 12px 15px; font-weight: 600; border-bottom: 2px solid var(--glass-border); border-right: 1px solid var(--glass-border);">姓名</th>',
    '<th class="sticky-cross-2" rowspan="2" style="padding: 12px 15px; font-weight: 600; border-bottom: 2px solid var(--glass-border); border-right: 1px solid var(--glass-border);">姓名</th>'
);
code = code.replace(
    '<th rowspan="2" style="padding: 12px 15px; font-weight: 600; border-bottom: 2px solid var(--glass-border); border-right: 1px solid var(--glass-border);">部門</th>',
    '<th class="sticky-top" rowspan="2" style="padding: 12px 15px; font-weight: 600; border-bottom: 2px solid var(--glass-border); border-right: 1px solid var(--glass-border);">部門</th>'
);

// 4. data.dates loop headers
code = code.replace(
    /headerRow1 \+= `<th colspan="2" style="padding: 8px; font-weight: 600; border-bottom: 1px solid var\(--glass-border\); border-right: 1px solid var\(--glass-border\); text-align: center;">\$\{d\.label\}<\/th>`;/g,
    'headerRow1 += `<th class="sticky-top" colspan="2" style="padding: 8px; font-weight: 600; border-bottom: 1px solid var(--glass-border); border-right: 1px solid var(--glass-border); text-align: center;">${d.label}</th>`;'
);
code = code.replace(
    /headerRow2 \+= `<th style="padding: 8px; font-weight: 500; border-bottom: 2px solid var\(--glass-border\); text-align: center;">午<\/th><th style="padding: 8px; font-weight: 500; border-bottom: 2px solid var\(--glass-border\); border-right: 1px solid var\(--glass-border\); text-align: center;">晚<\/th>`;/g,
    'headerRow2 += `<th class="sticky-top-2" style="padding: 8px; font-weight: 500; border-bottom: 2px solid var(--glass-border); text-align: center;">午</th><th class="sticky-top-2" style="padding: 8px; font-weight: 500; border-bottom: 2px solid var(--glass-border); border-right: 1px solid var(--glass-border); text-align: center;">晚</th>`;'
);

// 5. trailing headers
code = code.replace(
    /<th rowspan="2" style="padding: 12px 15px; font-weight: 600; border-bottom: 2px solid var\(--glass-border\);">應扣伙食費<\/th>/g,
    '<th class="sticky-top" rowspan="2" style="padding: 12px 15px; font-weight: 600; border-bottom: 2px solid var(--glass-border);">應扣伙食費</th>'
);
code = code.replace(
    /<th rowspan="2" style="padding: 12px 15px; font-weight: 600; border-bottom: 2px solid var\(--glass-border\);">應發津貼<\/th>/g,
    '<th class="sticky-top" rowspan="2" style="padding: 12px 15px; font-weight: 600; border-bottom: 2px solid var(--glass-border);">應發津貼</th>'
);
code = code.replace(
    /<th rowspan="2" style="padding: 12px 15px; font-weight: 600; border-bottom: 2px solid var\(--glass-border\);">一般出勤<\/th>/g,
    '<th class="sticky-top" rowspan="2" style="padding: 12px 15px; font-weight: 600; border-bottom: 2px solid var(--glass-border);">一般出勤</th>'
);
code = code.replace(
    /<th rowspan="2" style="padding: 12px 15px; font-weight: 600; border-bottom: 2px solid var\(--glass-border\);">假日\(0h\)<\/th>/g,
    '<th class="sticky-top" rowspan="2" style="padding: 12px 15px; font-weight: 600; border-bottom: 2px solid var(--glass-border);">假日(0h)</th>'
);
code = code.replace(
    /<th rowspan="2" style="padding: 12px 15px; font-weight: 600; border-bottom: 2px solid var\(--glass-border\);">假日\(8h\)<\/th>/g,
    '<th class="sticky-top" rowspan="2" style="padding: 12px 15px; font-weight: 600; border-bottom: 2px solid var(--glass-border);">假日(8h)</th>'
);
code = code.replace(
    /<th rowspan="2" style="padding: 12px 15px; font-weight: 600; border-bottom: 2px solid var\(--glass-border\);">假日\(10h\+\)<\/th>/g,
    '<th class="sticky-top" rowspan="2" style="padding: 12px 15px; font-weight: 600; border-bottom: 2px solid var(--glass-border);">假日(10h+)</th>'
);
code = code.replace(
    /<th rowspan="2" style="padding: 12px 15px; font-weight: 600; border-bottom: 2px solid var\(--glass-border\);">備註<\/th>/g,
    '<th class="sticky-top" rowspan="2" style="padding: 12px 15px; font-weight: 600; border-bottom: 2px solid var(--glass-border);">備註</th>'
);

// 6. data rows td
code = code.replace(
    /html \+= `<td style="padding: 10px; border-bottom: 1px solid var\(--glass-border\); border-right: 1px solid var\(--glass-border\);">\$\{r\.id\}<\/td>`;/g,
    'html += `<td class="sticky-col-1" style="padding: 10px; border-bottom: 1px solid var(--glass-border); border-right: 1px solid var(--glass-border);">${r.id}</td>`;'
);
code = code.replace(
    /html \+= `<td style="padding: 10px; border-bottom: 1px solid var\(--glass-border\); border-right: 1px solid var\(--glass-border\);">\$\{r\.name\}<\/td>`;/g,
    'html += `<td class="sticky-col-2" style="padding: 10px; border-bottom: 1px solid var(--glass-border); border-right: 1px solid var(--glass-border);">${r.name}</td>`;'
);

fs.writeFileSync('public/index.html', code);
