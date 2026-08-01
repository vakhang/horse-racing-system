const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:jZltapbxTrViEgpYZdBbdGIqCPhuoMIU@sakura.proxy.rlwy.net:37948/railway' });

async function run() {
  await client.connect();
  try {
      console.log('Setting all balances to 0...');
      await client.query(`UPDATE wallets SET balance = 0`);
      
      console.log('Setting audience balance to 100,000,000...');
      await client.query(`
        UPDATE wallets 
        SET balance = 100000000 
        FROM users 
        WHERE wallets.user_id = users.id AND users.role = 'AUDIENCE';
      `);
      
      console.log('Setting owner, jockey, referee balance to 500,000...');
      await client.query(`
        UPDATE wallets 
        SET balance = 500000 
        FROM users 
        WHERE wallets.user_id = users.id AND users.role IN ('OWNER', 'JOCKEY', 'REFEREE');
      `);
      
      console.log('Successfully updated balances for all users');
  } catch(e) {
      console.error(e);
  } finally {
      await client.end();
  }
}
run();
