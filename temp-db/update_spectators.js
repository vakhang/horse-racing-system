const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres:jZltapbxTrViEgpYZdBbdGIqCPhuoMIU@sakura.proxy.rlwy.net:37948/railway'
});

async function run() {
  try {
    await client.connect();
    
    const query = `
      UPDATE wallets 
      SET balance = 100000000 
      WHERE user_id IN (
        SELECT id FROM users 
        WHERE email IN ('spectator1@gmail.com', 'spectator2@gmail.com', 'spectator3@gmail.com')
      );
    `;
    
    console.log("Executing update query...");
    const res = await client.query(query);
    console.log(`Successfully updated ${res.rowCount} wallets to 100,000,000 VND.`);
  } catch (err) {
    console.error("Error executing query", err);
  } finally {
    await client.end();
  }
}

run();
