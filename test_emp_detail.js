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
        
        // Try fetching EMP_ID 9 specifically
        const empRes = await fetch(`${config.HR_API_BASE}/api/ed/emp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ CO_ID: config.CO_ID, LIMIT: 1000, EMP_ID: 9 })
        });
        const empResult = await empRes.json();
        console.log("With EMP_ID: 9");
        console.log(JSON.stringify(empResult.data[0], null, 2));

        // Also let's check /api/pb/emp_basic
        const pbRes = await fetch(`${config.HR_API_BASE}/api/pb/emp_basic`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ CO_ID: config.CO_ID, LIMIT: 1000, EMP_ID: 9 })
        });
        if (pbRes.ok) {
            const pbResult = await pbRes.json();
            console.log("\nWith /api/pb/emp_basic");
            console.log(JSON.stringify(pbResult.data ? pbResult.data[0] : null, null, 2));
        }
    } catch (e) {
        console.error(e);
    }
}
test();
