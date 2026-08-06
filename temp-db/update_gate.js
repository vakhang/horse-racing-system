const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:jZltapbxTrViEgpYZdBbdGIqCPhuoMIU@sakura.proxy.rlwy.net:37948/railway'
});

async function run() {
  await client.connect();
  console.log("Connected to DB");
  try {
    await client.query(`UPDATE registrations SET gate_number = 5 WHERE id = 69;`);
    console.log("Gate number 5 assigned to registration 69");
  } catch (err) {
    console.log("Error:", err.message);
  }
  await client.end();
}
run();
