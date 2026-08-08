const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const fs = require('fs');

const client = new Client({
  connectionString: 'postgresql://postgres:jZltapbxTrViEgpYZdBbdGIqCPhuoMIU@sakura.proxy.rlwy.net:37948/railway'
});

async function run() {
  await client.connect();
  console.log("Connected to DB");
  try {
    const plainPassword = "Testpass123*";
    
    // Reset all passwords
    await client.query(`UPDATE users SET password = $1`, [plainPassword]);
    console.log("All passwords reset to 'Testpass123*' (PLAIN TEXT)");
    
    // Fetch all users
    const res = await client.query("SELECT id, username, email, role, status FROM users ORDER BY role, id");
    
    let csvData = "ID,Username,Email,Role,Status,Password\n";
    for (let row of res.rows) {
        csvData += `${row.id},${row.username},${row.email},${row.role},${row.status},Testpass123*\n`;
    }
    
    fs.writeFileSync('users_export.csv', csvData);
    console.log("Exported users to users_export.csv");
    
  } catch (err) {
    console.log("Error:", err.message);
  }
  await client.end();
}
run();
