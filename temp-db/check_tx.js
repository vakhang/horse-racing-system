const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:jZltapbxTrViEgpYZdBbdGIqCPhuoMIU@sakura.proxy.rlwy.net:37948/railway'
});

async function run() {
  await client.connect();
  const res = await client.query("SELECT id, transaction_code, amount, tax_amount FROM transaction_histories WHERE transaction_code LIKE 'RW-%' OR transaction_code LIKE 'TAX-%'");
  console.log(res.rows);
  await client.end();
}
run();
