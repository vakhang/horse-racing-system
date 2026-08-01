const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:jZltapbxTrViEgpYZdBbdGIqCPhuoMIU@sakura.proxy.rlwy.net:37948/railway' });

async function run() {
  await client.connect();
  try {
      await client.query("UPDATE races SET status = 'REGISTRATION' WHERE status IS NULL;");
      await client.query("ALTER TABLE races ALTER COLUMN status SET DEFAULT 'REGISTRATION';");
      await client.query("ALTER TABLE races ALTER COLUMN status SET NOT NULL;");
      console.log('Successfully set NOT NULL and DEFAULT on status.');
  } catch(e) {
      console.error(e);
  } finally {
      await client.end();
  }
}
run();
