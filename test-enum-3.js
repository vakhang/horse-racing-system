const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:jZltapbxTrViEgpYZdBbdGIqCPhuoMIU@sakura.proxy.rlwy.net:37948/railway' });
async function run() {
  await client.connect();
  const res = await client.query(`
    SELECT enumlabel 
    FROM pg_enum 
    WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'racestatus');
  `);
  console.log(res.rows);
  await client.end();
}
run();
