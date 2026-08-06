const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres:jZltapbxTrViEgpYZdBbdGIqCPhuoMIU@sakura.proxy.rlwy.net:37948/railway'
});

async function run() {
  try {
    await client.connect();
    
    console.log("--- USER ATTACHMENTS ---");
    const userRes = await client.query('SELECT doc_type, file_url FROM user_attachments LIMIT 5;');
    if (userRes.rows.length === 0) {
      console.log("No user attachments found.");
    } else {
      userRes.rows.forEach(row => {
        let snippet = row.file_url;
        if (snippet && snippet.length > 100) snippet = snippet.substring(0, 100) + '...';
        console.log(`DocType: ${row.doc_type} | FileUrl: ${snippet}`);
      });
    }

    console.log("\n--- HORSE ATTACHMENTS ---");
    const horseRes = await client.query('SELECT doc_type, file_url FROM horse_attachments LIMIT 5;');
    if (horseRes.rows.length === 0) {
      console.log("No horse attachments found.");
    } else {
      horseRes.rows.forEach(row => {
        let snippet = row.file_url;
        if (snippet && snippet.length > 100) snippet = snippet.substring(0, 100) + '...';
        console.log(`DocType: ${row.doc_type} | FileUrl: ${snippet}`);
      });
    }

  } catch (err) {
    console.error("Error executing query", err);
  } finally {
    await client.end();
  }
}

run();
