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
        
        const empRes = await fetch(`${config.HR_API_BASE}/api/ed/emp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ CO_ID: config.CO_ID, LIMIT: 1000 })
        });
        const empResult = await empRes.json();
        const emps = empResult.data || [];
        
        console.log("Total employees:", emps.length);
        const withWorkStatus = emps.filter(e => e.WORK_STATUS !== undefined);
        console.log("Employees with WORK_STATUS:", withWorkStatus.length);
        const withQuitDate = emps.filter(e => e.QUIT_DATE !== undefined);
        console.log("Employees with QUIT_DATE:", withQuitDate.length);
        
        if (withWorkStatus.length > 0) {
            console.log("Sample WORK_STATUS:", withWorkStatus[0].WORK_STATUS);
        }

    } catch (e) {
        console.error(e);
    }
}
test();
