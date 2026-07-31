async function main() {
  const apiBase = "http://192.168.8.11:3001";
  const account = "getsignin";
  const password = "0p;/9ol.";

  try {
    const signInRes = await fetch(`${apiBase}/api/auth/signIn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        account, 
        password,
        USER_ACCOUNT: account,
        USER_PWD: password
      })
    });

    const signInData = await signInRes.json();
    console.log("Full Sign In Data:", JSON.stringify(signInData, null, 2));

  } catch (error) {
    console.error("Error:", error.message);
  }
}

main();
