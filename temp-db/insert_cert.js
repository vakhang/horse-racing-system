const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:jZltapbxTrViEgpYZdBbdGIqCPhuoMIU@sakura.proxy.rlwy.net:37948/railway'
});

async function run() {
  await client.connect();
  console.log("Connected to DB");
  try {
    // 1. Insert Referee Cert
    await client.query(`INSERT INTO user_attachments (user_id, doc_type, file_url, created_at) VALUES (34, 'REFEREE_CERT', 'https://example.com/referee_cert.png', NOW());`);
    console.log("Certificate inserted for Referee 34");
    
    // 2. Insert Jockey Certs
    await client.query(`INSERT INTO user_attachments (user_id, doc_type, file_url, created_at) VALUES (32, 'JOCKEY_CERT', 'https://example.com/jockey_cert.png', NOW());`);
    await client.query(`INSERT INTO user_attachments (user_id, doc_type, file_url, created_at) VALUES (32, 'HEALTH_CHECK', 'https://example.com/health_check.png', NOW());`);
    console.log("Certificates inserted for Jockey 32");

    // 3. Update Jockey Weight and Height
    await client.query(`UPDATE users SET weight = 55.5, height = 1.65 WHERE id = 32;`);
    console.log("Updated weight/height for Jockey 32");
  } catch (err) {
    console.log("Error:", err.message);
  }
  await client.end();
}
run();
