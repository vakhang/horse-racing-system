async function test() {
  try {
    const res = await fetch('https://horse-racing-system-production-492c.up.railway.app/api/races', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tournamentId: 10,
        name: 'TEST RACE',
        raceTime: '2026-08-01T20:00:00',
        prize1: 1000,
        prize2: 500,
        prize3: 200,
        rakePercentage: 35
      })
    });
    console.log('API Response:', await res.json());
    
    // Check DB
    const { Client } = require('pg');
    const client = new Client({ connectionString: 'postgresql://postgres:jZltapbxTrViEgpYZdBbdGIqCPhuoMIU@sakura.proxy.rlwy.net:37948/railway' });
    await client.connect();
    const dbRes = await client.query("SELECT id, name, status FROM races WHERE name = 'TEST RACE'");
    console.log('DB Result:', dbRes.rows);
    await client.end();
  } catch (e) {
    console.error(e.message);
  }
}
test();
