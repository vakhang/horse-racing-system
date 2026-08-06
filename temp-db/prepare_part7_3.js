const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:jZltapbxTrViEgpYZdBbdGIqCPhuoMIU@sakura.proxy.rlwy.net:37948/railway'
});

async function run() {
  await client.connect();
  console.log("Connected to DB");

  try {
    // 1. Tạo Tournament
    const tRes = await client.query(`
      INSERT INTO tournaments (name, start_date, end_date, status) 
      VALUES ('Tournament 7.3 Non-Starter', NOW(), NOW() + INTERVAL '1 day', 'UPCOMING') RETURNING id
    `);
    const tId = tRes.rows[0].id;

    // 2. Setup 7.3 (Kẹt lồng xuất phát - NON-STARTER)
    const r1Res = await client.query(`
      INSERT INTO races (tournament_id, name, status, total_pool) 
      VALUES ($1, 'Race 42 - 7.3 Test', 'BETTING', 10000000) RETURNING id
    `, [tId]);
    const r1Id = r1Res.rows[0].id;

    // Lấy ngựa 1 và 2
    const h1Res = await client.query(`SELECT id FROM horses LIMIT 2`);
    const h1Id = h1Res.rows[0].id;
    const h2Id = h1Res.rows[1].id;

    const reg1Res = await client.query(`
      INSERT INTO registrations (race_id, horse_id, gate_number, status) 
      VALUES ($1, $2, 1, 'APPROVED_BY_ADMIN') RETURNING id
    `, [r1Id, h1Id]);
    const reg1Id = reg1Res.rows[0].id;

    const reg2Res = await client.query(`
      INSERT INTO registrations (race_id, horse_id, gate_number, status) 
      VALUES ($1, $2, 2, 'APPROVED_BY_ADMIN') RETURNING id
    `, [r1Id, h2Id]);
    const reg2Id = reg2Res.rows[0].id;

    // Tạo vé WIN cho ngựa 1 (Sẽ bị hoàn)
    await client.query(`
      INSERT INTO bets (race_id, spectator_id, registration_id, bet_type, amount, status)
      VALUES ($1, 32, $2, 'WIN', 1000000, 'PENDING')
    `, [r1Id, reg1Id]);

    // Tạo vé PLACE cho ngựa 1 (Sẽ bị hoàn)
    await client.query(`
      INSERT INTO bets (race_id, spectator_id, registration_id, bet_type, amount, status)
      VALUES ($1, 32, $2, 'PLACE', 500000, 'PENDING')
    `, [r1Id, reg1Id]);

    // Tạo vé EXACTA ngựa 1 và ngựa 2 (Sẽ bị hoàn)
    await client.query(`
      INSERT INTO bets (race_id, spectator_id, registration_id, registration_id_2, bet_type, amount, status)
      VALUES ($1, 32, $2, $3, 'EXACTA', 2000000, 'PENDING')
    `, [r1Id, reg1Id, reg2Id]);

    // Tạo vé WIN cho ngựa 2 (Sẽ KHÔNG bị hoàn)
    await client.query(`
      INSERT INTO bets (race_id, spectator_id, registration_id, bet_type, amount, status)
      VALUES ($1, 32, $2, 'WIN', 500000, 'PENDING')
    `, [r1Id, reg2Id]);

    console.log("=== SETUP HOÀN TẤT CHO PHẦN 7.3 ===");
    console.log(">>> 7.3. Kẹt lồng xuất phát (NON-STARTER) <<<");
    console.log("POST /api/referees/non-starter");
    console.log("Body JSON:");
    console.log(JSON.stringify({
      raceId: r1Id,
      refereeId: 4,
      registrationId: reg1Id
    }, null, 2));

  } catch (err) {
    console.error("Lỗi:", err);
  }

  await client.end();
}
run();
