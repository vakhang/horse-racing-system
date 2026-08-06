const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:jZltapbxTrViEgpYZdBbdGIqCPhuoMIU@sakura.proxy.rlwy.net:37948/railway'
});

async function run() {
  await client.connect();
  console.log("Connected to DB");

  try {
    // 1. Tạo Tournament mới
    const tRes = await client.query(`
      INSERT INTO tournaments (name, status) 
      VALUES ('Test Tournament 6.2', 'ONGOING') RETURNING id
    `);
    const tId = tRes.rows[0].id;

    // 2. Tạo Race 38 cho kịch bản 1 (PIT TAX & 15.00 ODDS)
    const r1Res = await client.query(`
      INSERT INTO races (tournament_id, name, status, total_pool, prize1) 
      VALUES ($1, 'Race 38 - PIT Tax Test', 'RESULT_CONFIRMED', 23076923.08, 0) RETURNING id
    `, [tId]);
    const r1Id = r1Res.rows[0].id;

    // Tạo Registration cho Race 100
    const reg1Res = await client.query(`
      INSERT INTO registrations (race_id, horse_id, gate_number, rank)
      VALUES ($1, 15, 1, 1) RETURNING id
    `, [r1Id]); // Hạng 1
    const reg1Id = reg1Res.rows[0].id;
    
    // Khán giả 32 cược 1 củ vào ngựa hạng 1
    await client.query(`
      INSERT INTO bets (race_id, spectator_id, registration_id, bet_type, amount, status)
      VALUES ($1, 32, $2, 'WIN', 1000000, 'PENDING')
    `, [r1Id, reg1Id]);

    // 3. Tạo Race 39 cho kịch bản 2 (Zero Winner Auto-Refund)
    const r2Res = await client.query(`
      INSERT INTO races (tournament_id, name, status, total_pool) 
      VALUES ($1, 'Race 39 - Zero Winner Test', 'RESULT_CONFIRMED', 2000000) RETURNING id
    `, [tId]);
    const r2Id = r2Res.rows[0].id;

    // Tạo ngựa số 3 cho test Zero Winner
    const h3Res = await client.query(`INSERT INTO horses (name, status) VALUES ('Dummy Horse', 'ACTIVE') RETURNING id`);
    const h3Id = h3Res.rows[0].id;

    const reg2_1 = await client.query(`INSERT INTO registrations (race_id, horse_id, gate_number, rank) VALUES ($1, 15, 1, 3) RETURNING id`, [r2Id]); // Hạng 3 (Người chơi cược)
    const reg2_2 = await client.query(`INSERT INTO registrations (race_id, horse_id, gate_number, rank) VALUES ($1, 16, 2, 4) RETURNING id`, [r2Id]); // Hạng 4 (Người chơi cược)
    const reg2_3 = await client.query(`INSERT INTO registrations (race_id, horse_id, gate_number, rank) VALUES ($1, $2, 3, 1) RETURNING id`, [r2Id, h3Id]); // Hạng 1 (Khong ai cược)

    // Khán giả 32 cược ngựa 69 (hạng 3 - Thua)
    await client.query(`
      INSERT INTO bets (race_id, spectator_id, registration_id, bet_type, amount, status)
      VALUES ($1, 32, $2, 'WIN', 500000, 'PENDING')
    `, [r2Id, reg2_1.rows[0].id]);
    
    // Khán giả cược ngựa 70 (hạng 4 - Thua)
    await client.query(`
      INSERT INTO bets (race_id, spectator_id, registration_id, bet_type, amount, status)
      VALUES ($1, 32, $2, 'WIN', 500000, 'PENDING')
    `, [r2Id, reg2_2.rows[0].id]);

    // 4. Ensure RISK_RESERVE has money for Minus Pool just in case
    await client.query(`DELETE FROM system_funds WHERE fund_type = 'RISK_RESERVE'`);
    await client.query(`
      INSERT INTO system_funds (fund_type, balance)
      VALUES ('RISK_RESERVE', 100000000)
    `);

    console.log("=== SETUP HOÀN TẤT LẦN 2 ===");
    console.log("Test Case 1 (Thuế PIT & Lợi nhuận > 10 củ): POST /races/" + r1Id + "/payout");
    console.log("Test Case 2 (Lỗi chia cho 0 -> Auto Refund): POST /races/" + r2Id + "/payout");

  } catch (e) {
    console.error(e);
  }

  await client.end();
}
run();
