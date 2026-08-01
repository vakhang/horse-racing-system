const { Client } = require('pg');

const client = new Client({ connectionString: 'postgresql://postgres:jZltapbxTrViEgpYZdBbdGIqCPhuoMIU@sakura.proxy.rlwy.net:37948/railway' });

async function run() {
  await client.connect();
  try {
      const refereeRes = await client.query("SELECT id FROM users WHERE username = 'TRỌNG TÀI 1'");
      if (refereeRes.rowCount === 0) {
          console.log("Not found referee");
          return;
      }
      const refereeId = refereeRes.rows[0].id;

      const races = await client.query("SELECT id, name, status, race_time, tournament_id FROM races WHERE referee_id = $1 ORDER BY race_time", [refereeId]);
      console.log("Races assigned to referee 1:");
      console.table(races.rows);
      
  } catch(e) {
      console.error(e);
  } finally {
      await client.end();
  }
}
run();
