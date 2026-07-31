const fs = require('fs');
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

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
        
        // Check past month
        const otRes = await fetch(`${config.HR_API_BASE}/api/am/emp_ot`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ CO_ID: config.CO_ID, OT_SDATE: '2026/07/01', OT_EDATE: '2026/07/31', LIMIT: 10 })
        });
        const otResult = await otRes.json();
        const data = otResult.data || [];
        
        console.log(`Found ${data.length} OT records.`);
        if (data.length > 0) {
           console.log("Sample OT record:");
           console.log(JSON.stringify(data[0], null, 2));
        }
    } catch (e) {
        console.error(e);
    }
}

test();
