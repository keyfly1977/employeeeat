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
        console.log("Total employees without filter:", emps.length);

        const empRes2 = await fetch(`${config.HR_API_BASE}/api/ed/emp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ CO_ID: config.CO_ID, LIMIT: 1000, STATUS: "1" })
        });
        const empResult2 = await empRes2.json();
        console.log("Total employees with STATUS 1:", (empResult2.data || []).length);

        const empRes3 = await fetch(`${config.HR_API_BASE}/api/ed/emp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ CO_ID: config.CO_ID, LIMIT: 1000, STATUS: "0" })
        });
        const empResult3 = await empRes3.json();
        console.log("Total employees with STATUS 0:", (empResult3.data || []).length);

        const empRes4 = await fetch(`${config.HR_API_BASE}/api/ed/emp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ CO_ID: config.CO_ID, LIMIT: 1000, IS_ACTIVE: true })
        });
        const empResult4 = await empRes4.json();
        console.log("Total employees with IS_ACTIVE true:", (empResult4.data || []).length);
        
        const depts=new Set(emps.map(e=>e.DEPT1_NAME)); console.log([...depts]);
    } catch (e) {
        console.error(e);
    }
}
test();
