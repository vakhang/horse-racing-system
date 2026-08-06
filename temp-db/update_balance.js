const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres:jZltapbxTrViEgpYZdBbdGIqCPhuoMIU@sakura.proxy.rlwy.net:37948/railway'
});

async function run() {
  try {
    await client.connect();
    
    const query = `
      UPDATE wallets 
      SET balance = 1000000 
      WHERE user_id IN (SELECT id FROM users WHERE role = 'SPECTATOR');
    `;
    
    console.log("Executing update query...");
    const res = await client.query(query);
    console.log(`Successfully updated ${res.rowCount} wallets to 1,000,000 VND.`);
  } catch (err) {
    console.error("Error executing query", err);
  } finally {
    await client.end();
  }
}

run();
