const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:jZltapbxTrViEgpYZdBbdGIqCPhuoMIU@sakura.proxy.rlwy.net:37948/railway'
});

async function run() {
  await client.connect();
  console.log("Connected to DB");
  try {
    // 1. Get an existing owner
    const ownerRes = await client.query(`SELECT id FROM users WHERE role = 'OWNER' LIMIT 1;`);
    const ownerId = ownerRes.rows[0].id;
    
    // 2. Insert dummy horse
    const horseRes = await client.query(`
      INSERT INTO horses (name, owner_id, age, breed, color, microchip_code, status) 
      VALUES ('Bạch Long', $1, 4, 'Thoroughbred', 'Trắng', 'MC-111222', 'APPROVED') RETURNING id;
    `, [ownerId]);
    const horseId = horseRes.rows[0].id;

    // 3. Insert registration into race 29
    const regRes = await client.query(`
      INSERT INTO registrations (race_id, horse_id, owner_id, status, gate_number) 
      VALUES (29, $1, $2, 'APPROVED_BY_ADMIN', 2) RETURNING id;
    `, [horseId, ownerId]);
    
    console.log("Created Horse ID:", horseId);
    console.log("Created Registration ID:", regRes.rows[0].id);
  } catch (err) {
    console.log("Error:", err.message);
  }
  await client.end();
}
run();
