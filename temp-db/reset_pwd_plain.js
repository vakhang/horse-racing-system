const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:jZltapbxTrViEgpYZdBbdGIqCPhuoMIU@sakura.proxy.rlwy.net:37948/railway'
});

async function run() {
  await client.connect();
  console.log("Connected to DB");
  try {
    await client.query(`UPDATE users SET password = '123456' WHERE username = 'referee1'`);
    console.log("Password updated back to plain text 123456 for referee1!");
  } catch (err) {
    console.log("Error:", err.message);
  }
  await client.end();
}
run();
