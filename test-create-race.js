fetch('https://horse-racing-system-production-492c.up.railway.app/api/races', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        tournamentId: 12,
        name: 'Test Race Null Status',
        raceTime: '2026-08-01T23:55:00',
        refereeId: 10,
        prize1: 100, prize2: 50, prize3: 20
    })
})
.then(res => res.json().catch(()=>res.text()))
.then(d => console.log(d));
