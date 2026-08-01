async function run() {
    try {
        const loginRes = await fetch('https://horse-racing-system-production-492c.up.railway.app/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@gmail.com', password: '123456' })
        });
        const loginData = await loginRes.json();
        
        let token = loginData.token;
        if (!token) {
            console.log('Login failed:', loginData);
            return;
        }

        console.log('Got token:', token.substring(0,10) + '...');
        
        const createRes = await fetch('https://horse-racing-system-production-492c.up.railway.app/api/races', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
                tournamentId: 13,
                name: 'Test Race Null Status',
                raceTime: '2026-08-01T23:59:00',
                refereeId: 1, // make sure to use a valid referee, but wait, referee is optional?
                prize1: 100, prize2: 50, prize3: 20
            })
        });
        
        const resText = await createRes.text();
        console.log('Create Response:', resText);
        
    } catch (e) {
        console.error(e);
    }
}
run();
