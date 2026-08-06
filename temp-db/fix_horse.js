const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:jZltapbxTrViEgpYZdBbdGIqCPhuoMIU@sakura.proxy.rlwy.net:37948/railway'
});

async function run() {
  await client.connect();
  await client.query("UPDATE horses SET status = 'APPROVED' WHERE status = 'ACTIVE'");
  console.log('Updated Dummy Horse status to APPROVED');
  await client.end();
}
run();
