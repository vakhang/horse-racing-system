const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:jZltapbxTrViEgpYZdBbdGIqCPhuoMIU@sakura.proxy.rlwy.net:37948/railway' });
async function run() {
  await client.connect();
  const res = await client.query(`
    SELECT is_nullable, column_default 
    FROM information_schema.columns 
    WHERE table_name = 'races' AND column_name = 'status';
  `);
  console.log(res.rows);
  await client.end();
}
run();
