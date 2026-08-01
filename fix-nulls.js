const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:jZltapbxTrViEgpYZdBbdGIqCPhuoMIU@sakura.proxy.rlwy.net:37948/railway' });

async function run() {
  await client.connect();
  try {
      await client.query("UPDATE registrations SET status = 'PENDING_APPROVAL' WHERE status IS NULL;");
      await client.query("UPDATE bets SET status = 'PENDING' WHERE status IS NULL;");
      await client.query("UPDATE jockey_invitations SET status = 'PENDING' WHERE status IS NULL;");
      await client.query("UPDATE transaction_histories SET status = 'COMPLETED' WHERE status IS NULL;");
      console.log('Fixed all null statuses in db');
  } catch(e) {
      console.error(e);
  } finally {
      await client.end();
  }
}
run();
