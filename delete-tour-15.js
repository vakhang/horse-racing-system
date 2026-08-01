const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:jZltapbxTrViEgpYZdBbdGIqCPhuoMIU@sakura.proxy.rlwy.net:37948/railway' });

async function run() {
  await client.connect();
  try {
      const tourId = 15; // Giải đấu 3 (ID 15)
      
      // Delete jockey_invitations
      await client.query(`
        DELETE FROM jockey_invitations 
        WHERE registration_id IN (
          SELECT id FROM registrations WHERE race_id IN (
            SELECT id FROM races WHERE tournament_id = $1
          )
        )
      `, [tourId]);
      console.log('Deleted jockey_invitations');

      // Delete transaction_histories related to bets in these races
      await client.query(`
        DELETE FROM transaction_histories 
        WHERE bet_id IN (
          SELECT id FROM bets WHERE race_id IN (
            SELECT id FROM races WHERE tournament_id = $1
          )
        )
      `, [tourId]);
      console.log('Deleted transaction_histories');

      // Delete bets
      await client.query(`
        DELETE FROM bets 
        WHERE race_id IN (
          SELECT id FROM races WHERE tournament_id = $1
        )
      `, [tourId]);
      console.log('Deleted bets');

      // Delete registrations
      await client.query(`
        DELETE FROM registrations 
        WHERE race_id IN (
          SELECT id FROM races WHERE tournament_id = $1
        )
      `, [tourId]);
      console.log('Deleted registrations');

      // Delete referee_reports
      await client.query(`
        DELETE FROM referee_reports 
        WHERE race_id IN (
          SELECT id FROM races WHERE tournament_id = $1
        )
      `, [tourId]);
      console.log('Deleted referee_reports');

      // Delete races
      await client.query(`DELETE FROM races WHERE tournament_id = $1`, [tourId]);
      console.log('Deleted races');

      // Delete tournament
      const res = await client.query(`DELETE FROM tournaments WHERE id = $1`, [tourId]);
      console.log(`Deleted tournament ${tourId}, rows affected: ${res.rowCount}`);
      
  } catch(e) {
      console.error(e);
  } finally {
      await client.end();
  }
}
run();
