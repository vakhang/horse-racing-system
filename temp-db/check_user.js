const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:jZltapbxTrViEgpYZdBbdGIqCPhuoMIU@sakura.proxy.rlwy.net:37948/railway'
});

async function run() {
  await client.connect();
  const res = await client.query("SELECT id, username, password FROM users WHERE username = 'referee1'");
  console.log(res.rows[0]);
  await client.end();
}
run();
