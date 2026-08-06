const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const client = new Client({
  connectionString: 'postgresql://postgres:jZltapbxTrViEgpYZdBbdGIqCPhuoMIU@sakura.proxy.rlwy.net:37948/railway'
});

async function run() {
  await client.connect();
  console.log("Connected to DB");
  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync("123456", salt);
    await client.query(`UPDATE users SET password = $1 WHERE username = 'referee1'`, [hash]);
    console.log("Password updated successfully for referee1!");
  } catch (err) {
    console.log("Error:", err.message);
  }
  await client.end();
}
run();
