const config = require('./config.json');

async function getAuthToken(account, password) {
  const signInBody = { account, password, USER_ACCOUNT: account, USER_PWD: password };
  const res = await fetch(`${config.HR_API_BASE}/api/auth/signIn`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(signInBody)
  });
  const data = await res.json();
  return data.accessToken || (data.data && (data.data.ACCESS_TOKEN || data.data.accessToken));
}

async function test() {
    try {
        const token = await getAuthToken(config.USER_ACCOUNT, config.USER_PWD);
        
        // 7/26 was a Sunday
        const otRes = await fetch(`${config.HR_API_BASE}/api/am/emp_ot`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ CO_ID: config.CO_ID, LIMIT: 5, OT_DATE: '2026/07/26' })
        });
        const otResult = await otRes.json();
        console.log("Sunday OT 7/26:", otResult.data ? otResult.data[0] : "None");
        
        // 7/31 is Friday
        const otRes2 = await fetch(`${config.HR_API_BASE}/api/am/emp_ot`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ CO_ID: config.CO_ID, LIMIT: 5, OT_DATE: '2026/07/31' })
        });
        const otResult2 = await otRes2.json();
        console.log("Friday OT 7/31:", otResult2.data ? otResult2.data[0] : "None");
    } catch (e) {
        console.error(e);
    }
}
test();
