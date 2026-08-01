const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:jZltapbxTrViEgpYZdBbdGIqCPhuoMIU@sakura.proxy.rlwy.net:37948/railway' });
async function run() {
  await client.connect();
  const res = await client.query(`SELECT id, name, status FROM races ORDER BY id ASC;`);
  console.log(res.rows);
  await client.end();
}
run();
