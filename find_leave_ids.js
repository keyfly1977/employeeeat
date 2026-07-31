const fs = require('fs');

async function main() {
  const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
  const todayObj = new Date();
  const yyyy = todayObj.getFullYear();
  const mm = String(todayObj.getMonth() + 1).padStart(2, '0');
  const dd = String(todayObj.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}/${mm}/${dd}`;

  try {
    const signInRes = await fetch(`${config.HR_API_BASE}/api/auth/signIn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        account: config.USER_ACCOUNT, 
        password: config.USER_PWD,
        USER_ACCOUNT: config.USER_ACCOUNT,
        USER_PWD: config.USER_PWD
      })
    });
    const signInData = await signInRes.json();
    const token = signInData.accessToken || (signInData.data && (signInData.data.ACCESS_TOKEN || signInData.data.accessToken));
    
    // Fetch employees to find IDs
    const empRes = await fetch(`${config.HR_API_BASE}/api/ed/emp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ CO_ID: config.CO_ID, LIMIT: 1000 })
    });
    const empResult = await empRes.json();
    const employees = empResult.data || [];
    
    const targets = employees.filter(e => e.EMP_NAME.includes('蔡振峰') || e.EMP_NAME.includes('黃小琪') || e.EMP_NAME.includes('阮氏幸') || e.EMP_NO.includes('T4010') || e.EMP_NO.includes('T4024') || e.EMP_NO.includes('T7033'));
    console.log("Targets found in employees:");
    targets.forEach(t => {
      console.log(`EMP_ID: ${t.EMP_ID}, EMP_NO: ${t.EMP_NO}, Name: ${t.EMP_NAME}`);
    });
    
    // Fetch leaves
    const leaveRes = await fetch(`${config.HR_API_BASE}/api/am/emp_leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ CO_ID: config.CO_ID, LEAVE_START: todayStr, LEAVE_END: todayStr, LIMIT: 1000 })
    });
    const leaveResult = await leaveRes.json();
    const leaves = leaveResult.data || [];
    console.log("\nTarget leaves in database:");
    targets.forEach(t => {
      const matchLeaves = leaves.filter(l => l.EMP_ID === t.EMP_ID);
      console.log(`Employee: ${t.EMP_NAME} (EMP_ID: ${t.EMP_ID}) has ${matchLeaves.length} leaves:`);
      matchLeaves.forEach(l => {
        console.log(`  EMP_LEAVE_ID: ${l.EMP_LEAVE_ID}, LEAVEITEM_ID: ${l.LEAVEITEM_ID}, Start: ${l.LEAVE_START}, End: ${l.LEAVE_END}, Reason: "${l.REASON}"`);
      });
    });

  } catch (err) {
    console.error("Error:", err);
  }
}

main();
