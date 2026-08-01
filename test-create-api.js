const crypto = require('crypto');
function base64url(str) { return Buffer.from(str).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_'); }
const header = { alg: 'HS256', typ: 'JWT' };
const payload = { sub: '1', role: 'ADMIN', iat: Math.floor(Date.now()/1000), exp: Math.floor(Date.now()/1000) + 86400 };
const encodedHeader = base64url(JSON.stringify(header));
const encodedPayload = base64url(JSON.stringify(payload));
const signature = crypto.createHmac('sha256', 'HorseRacingVnSuperSecretKey2026-HorseRacingVnSuperSecretKey2026!').update(encodedHeader + '.' + encodedPayload).digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
const token = encodedHeader + '.' + encodedPayload + '.' + signature;

async function run() {
    try {
        const createRes = await fetch('https://horse-racing-system-production-492c.up.railway.app/api/races', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify({
                tournamentId: 13, name: 'Test API Race No Status', raceTime: '2026-08-01T23:59:00',
                prize1: 100, prize2: 50, prize3: 20
                // status intentionally omitted
            })
        });
        const resText = await createRes.text();
        console.log('Create Response:', resText);
        
        const { Client } = require('pg');
        const client = new Client({ connectionString: 'postgresql://postgres:jZltapbxTrViEgpYZdBbdGIqCPhuoMIU@sakura.proxy.rlwy.net:37948/railway' });
        await client.connect();
        const dbRes = await client.query(`SELECT id, name, status FROM races ORDER BY id DESC LIMIT 1;`);
        console.log('DB Data:', dbRes.rows);
        await client.end();
    } catch (e) {
        console.error(e);
    }
}
run();
