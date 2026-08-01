const { Client } = require('pg');

const client = new Client({ connectionString: 'postgresql://postgres:jZltapbxTrViEgpYZdBbdGIqCPhuoMIU@sakura.proxy.rlwy.net:37948/railway' });

async function run() {
  await client.connect();
  try {
      const email = 'admin@gmail.com';
      const plainPass = 'Testpass123*';
      
      const res = await client.query('UPDATE users SET password = $1 WHERE email = $2', [plainPass, email]);
      
      if (res.rowCount > 0) {
          console.log(`Successfully updated password for ${email}`);
      } else {
          console.log(`User ${email} not found.`);
      }
  } catch(e) {
      console.error(e);
  } finally {
      await client.end();
  }
}
run();
