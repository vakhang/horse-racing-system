const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:jZltapbxTrViEgpYZdBbdGIqCPhuoMIU@sakura.proxy.rlwy.net:37948/railway'
});

async function run() {
  await client.connect();
  console.log("Connected to DB");
  try {
    await client.query(`UPDATE registrations SET gate_number = NULL WHERE id = 69;`);
    console.log("Cleared gate_number for registration 69");
  } catch (err) {
    console.log("Error:", err.message);
  }
  await client.end();
}
run();
