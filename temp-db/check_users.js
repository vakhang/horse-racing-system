const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres:jZltapbxTrViEgpYZdBbdGIqCPhuoMIU@sakura.proxy.rlwy.net:37948/railway'
});

async function run() {
  await client.connect();
  const res = await client.query('SELECT id, email, role, status FROM users');
  console.log("Users left in DB:");
  console.table(res.rows);
  
  const spectatorCount = await client.query("SELECT COUNT(*) FROM users WHERE email='spectator1@gmail.com'");
  console.log("Spectator count:", spectatorCount.rows[0].count);
  
  await client.end();
}

run();
