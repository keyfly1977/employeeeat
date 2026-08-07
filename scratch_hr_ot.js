const fs = require(" fs\);
const config = JSON.parse(fs.readFileSync(\config.json\, \utf8\));

async function getAuthToken(account, password) {
 const res = await fetch(config.HR_API_BASE + \/api/auth/signIn\, {
 method: \POST\,
 headers: { \Content-Type\: \application/json\ },
 body: JSON.stringify({ account, password, USER_ACCOUNT: account, USER_PWD: password })
 });
 const text = await res.text();
 try {
 const data = JSON.parse(text);
 return data.accessToken || (data.data && (data.data.ACCESS_TOKEN || data.data.accessToken));
 } catch(e) {
 console.log(\Auth resp:\, text.substring(0,200));
 throw new Error(\Auth failed\);
 }
}

async function tryOT(token, label, body) {
 console.log(\\n--- [\ + label + \] ---\);
 const res = await fetch(config.HR_API_BASE + \/api/am/emp_ot\, {
 method: \POST\,
 headers: { \Content-Type\: \application/json\, \Authorization\: \Bearer \ + token },
 body: JSON.stringify(body)
 });
 const text = await res.text();
 console.log(\HTTP:\, res.status);
 try {
 const data = JSON.parse(text);
 const records = data.data || [];
 console.log(\Records:\, records.length);
 if (records.length > 0) console.log(\Sample:\, JSON.stringify(records[0], null, 2));
 else console.log(\Response:\, JSON.stringify(data).substring(0, 200));
 } catch(e) { console.log(\Raw:\, text.substring(0, 300)); }
}

async function test() {
 const mainToken = await getAuthToken(config.USER_ACCOUNT, config.USER_PWD);
 console.log(\Main token:\, mainToken ? \OK\ : \FAIL\);
 let otToken = mainToken;
 if (config.OT_USER_ACCOUNT && config.OT_USER_PWD) {
 try { otToken = await getAuthToken(config.OT_USER_ACCOUNT, config.OT_USER_PWD); console.log(\OT token: OK\); } catch(e) {}
 }
 await tryOT(otToken, \OT_SDATE+OT_EDATE\, { CO_ID: config.CO_ID, OT_SDATE: \2026/07/01\, OT_EDATE: \2026/07/31\, LIMIT: 5 });
 await tryOT(otToken, \OT_DATE\, { CO_ID: config.CO_ID, OT_DATE: \2026/08/01\, LIMIT: 5 });
 await tryOT(otToken, \OT_DATE_S+OT_DATE_E\, { CO_ID: config.CO_ID, OT_DATE_S: \2026/07/01\, OT_DATE_E: \2026/07/31\, LIMIT: 5 });
 await tryOT(mainToken, \OT_SDATE+OT_EDATE  \, { CO_ID: config.CO_ID, OT_SDATE: \2026/07/01\, OT_EDATE: \2026/07/31\, LIMIT: 5 });
}
test().catch(console.error);
