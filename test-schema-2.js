const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:jZltapbxTrViEgpYZdBbdGIqCPhuoMIU@sakura.proxy.rlwy.net:37948/railway' });
async function run() {
  await client.connect();
  const res = await client.query(`
    SELECT column_name, data_type, udt_name 
    FROM information_schema.columns 
    WHERE table_name = 'races' AND column_name = 'status';
  `);
  console.log('Column info:', res.rows);
  await client.end();
}
run();
