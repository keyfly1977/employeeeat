const config = require('./config.json');

async function checkQiu() {
    try {
        console.log("登入...");
        const signInBody = {
            account: config.USER_ACCOUNT,
            password: config.USER_PWD,
            USER_ACCOUNT: config.USER_ACCOUNT,
            USER_PWD: config.USER_PWD
        };
        const loginRes = await fetch(`${config.HR_API_BASE}/api/auth/signIn`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(signInBody)
        });
        const loginData = await loginRes.json();
        const token = loginData.accessToken || (loginData.data && (loginData.data.ACCESS_TOKEN || loginData.data.accessToken));
        
        const targetDate = new Date().toISOString().split('T')[0].replace(/-/g, '/');
        console.log(`查詢日期: ${targetDate}`);

        // 1. 找員工
        const empRes = await fetch(`${config.HR_API_BASE}/api/ed/emp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ CO_ID: config.CO_ID, LIMIT: 5000 })
        });
        const empData = await empRes.json();
        const targetEmp = empData.data.find(e => e.EMP_NAME && e.EMP_NAME.includes('邱秋蘭'));
        
        if (!targetEmp) {
            console.log("找不到名字包含邱秋蘭的員工");
            return;
        }
        
        console.log(`找到員工: ${targetEmp.EMP_NO} ${targetEmp.EMP_NAME}, ID: ${targetEmp.EMP_ID}`);

        // 2. 找打卡 (emp_cardmatch)
        const cardRes = await fetch(`${config.HR_API_BASE}/api/am/emp_cardmatch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ CO_ID: config.CO_ID, WORK_SDATE: targetDate, WORK_EDATE: targetDate, LIMIT: 5000 })
        });
        const cardData = await cardRes.json();
        const myCard = cardData.data.find(c => c.EMP_ID === targetEmp.EMP_ID);
        
        if (myCard) {
            console.log(`\n=== 打卡記錄 ===`);
            console.log(myCard);
        } else {
            console.log(`\n=== 打卡記錄 ===\n(沒有找到紀錄)`);
        }

        // 3. 找請假 (emp_leave)
        const leaveRes = await fetch(`${config.HR_API_BASE}/api/am/emp_leave`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ CO_ID: config.CO_ID, LEAVE_START: targetDate, LEAVE_END: targetDate, LIMIT: 5000 })
        });
        const leaveData = await leaveRes.json();
        const myLeave = leaveData.data.filter(l => l.EMP_ID === targetEmp.EMP_ID);
        
        if (myLeave.length > 0) {
            console.log(`\n=== 請假記錄 ===`);
            console.log(myLeave);
        } else {
            console.log(`\n=== 請假記錄 ===\n(沒有找到紀錄)`);
        }

    } catch (e) {
        console.error(e);
    }
}

checkQiu();
