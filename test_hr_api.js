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
        
        console.log("Checking for '離職' or other keywords...");
        emps.forEach(e => {
            if (e.EMP_NAME.includes("離職") || e.EMP_NO.includes("離") || e.DEPT1_NAME.includes("離")) {
                console.log(e.EMP_NO, e.EMP_NAME, e.DEPT1_NAME);
            }
        });
        console.log("Done checking.");
        
        console.log("Printing all EMP_NOs that look unusual:");
        emps.forEach(e => {
            if (e.EMP_NO.startsWith("Z") || e.EMP_NO.startsWith("Q")) {
                console.log(e.EMP_NO, e.EMP_NAME);
            }
        });
    } catch (e) {
        console.error(e);
    }
}
test();
