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
        
        const cardMatchRes = await fetch(`${config.HR_API_BASE}/api/am/emp_cardmatch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ CO_ID: config.CO_ID, DATE_START: "2026/07/29", DATE_END: "2026/07/29", LIMIT: 1000 })
        });
        const cardResult = await cardMatchRes.json();
        const cards = cardResult.data || [];
        console.log("Total scheduled/cardmatch:", cards.length);
        
        const t1010 = cards.find(x => x.EMP_NO === "T1010");
        console.log(t1010 ? "Found T1010 in cardmatch" : "T1010 NOT in cardmatch");

    } catch (e) {
        console.error(e);
    }
}
test();
