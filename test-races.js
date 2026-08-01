const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:jZltapbxTrViEgpYZdBbdGIqCPhuoMIU@sakura.proxy.rlwy.net:37948/railway' });
async function run() {
  await client.connect();
  const data = await client.query(`SELECT id, tournament_id, name, race_time, status FROM races ORDER BY id ASC;`);
  console.log('Races:', data.rows);
  await client.end();
}
run();
