const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:jZltapbxTrViEgpYZdBbdGIqCPhuoMIU@sakura.proxy.rlwy.net:37948/railway'
});

async function run() {
  await client.connect();
  console.log("Connected to DB");

  try {
    // 1. Tạo Tournament dùng chung
    const tRes = await client.query(`
      INSERT INTO tournaments (name, start_date, end_date, status) 
      VALUES ('Tournament Part 7', NOW(), NOW() + INTERVAL '1 day', 'UPCOMING') RETURNING id
    `);
    const tId = tRes.rows[0].id;

    // 2. Setup 7.1 (Trọng tài Truất quyền)
    const r1Res = await client.query(`
      INSERT INTO races (tournament_id, name, status, total_pool) 
      VALUES ($1, 'Race 40 - 7.1 Test', 'BETTING', 5000000) RETURNING id
    `, [tId]);
    const r1Id = r1Res.rows[0].id;

    // Lấy con ngựa số 1
    const h1Res = await client.query(`SELECT id FROM horses LIMIT 1`);
    const h1Id = h1Res.rows[0].id;

    const reg1Res = await client.query(`
      INSERT INTO registrations (race_id, horse_id, gate_number, status) 
      VALUES ($1, $2, 1, 'APPROVED_BY_ADMIN') RETURNING id
    `, [r1Id, h1Id]);
    const reg1Id = reg1Res.rows[0].id;

    // Tạo 1 vé cược PENDING vào con ngựa này
    await client.query(`
      INSERT INTO bets (race_id, spectator_id, registration_id, bet_type, amount, status)
      VALUES ($1, 32, $2, 'WIN', 1000000, 'PENDING')
    `, [r1Id, reg1Id]);


    // 3. Setup 7.2 (Admin Hủy Giải Đấu Khẩn Cấp)
    const t2Res = await client.query(`
      INSERT INTO tournaments (name, start_date, end_date, status) 
      VALUES ('Tournament 7.2 Cancel Test', NOW(), NOW() + INTERVAL '1 day', 'UPCOMING') RETURNING id
    `);
    const t2Id = t2Res.rows[0].id;

    const r2Res = await client.query(`
      INSERT INTO races (tournament_id, name, status, total_pool) 
      VALUES ($1, 'Race 41 - 7.2 Test', 'BETTING', 2000000) RETURNING id
    `, [t2Id]);
    const r2Id = r2Res.rows[0].id;

    const reg2Res = await client.query(`
      INSERT INTO registrations (race_id, horse_id, gate_number, status) 
      VALUES ($1, $2, 1, 'APPROVED_BY_ADMIN') RETURNING id
    `, [r2Id, h1Id]);
    const reg2Id = reg2Res.rows[0].id;

    // Tạo 1 vé cược PENDING
    await client.query(`
      INSERT INTO bets (race_id, spectator_id, registration_id, bet_type, amount, status)
      VALUES ($1, 32, $2, 'WIN', 500000, 'PENDING')
    `, [r2Id, reg2Id]);

    console.log("=== SETUP HOÀN TẤT CHO PHẦN 7.1 & 7.2 ===");
    console.log(">>> 7.1. Trọng tài Truất quyền Ngựa đua <<<");
    console.log("POST /referees/reports");
    console.log("Body JSON:");
    console.log(JSON.stringify({
      raceId: r1Id,
      refereeId: 4,
      registrationId: reg1Id,
      violationDetails: "Sử dụng chất kích thích Doping"
    }, null, 2));

    console.log("\n>>> 7.2. Admin Hủy Giải Đấu Hoàn tiền Khẩn cấp <<<");
    console.log("PUT /tournaments/" + t2Id + "/cancel");

  } catch (err) {
    console.error("Lỗi:", err);
  }

  await client.end();
}
run();
