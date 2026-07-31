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
        
        const t1010 = emps.find(x => x.EMP_NO === "T1010");
        console.log("T1010:", JSON.stringify(t1010, null, 2));

        console.log("Employees with QUIT_DATE:", emps.filter(e => e.QUIT_DATE).map(e => e.EMP_NAME));
        console.log("Employees with LEAVE_DATE:", emps.filter(e => e.LEAVE_DATE).map(e => e.EMP_NAME));

    } catch (e) {
        console.error(e);
    }
}
test();
