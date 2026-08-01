const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:jZltapbxTrViEgpYZdBbdGIqCPhuoMIU@sakura.proxy.rlwy.net:37948/railway' });

async function run() {
  await client.connect();
  try {
    await client.query('BEGIN');
    
    // Delete transaction_histories linked to bets in tournament 10
    await client.query(`
      DELETE FROM transaction_histories WHERE bet_id IN (
        SELECT id FROM bets WHERE race_id IN (SELECT id FROM races WHERE tournament_id = 10)
      );
    `);
    
    await client.query(`
      DELETE FROM bets WHERE race_id IN (SELECT id FROM races WHERE tournament_id = 10);
    `);
    
    await client.query(`
      DELETE FROM jockey_invitations WHERE registration_id IN (
        SELECT id FROM registrations WHERE race_id IN (SELECT id FROM races WHERE tournament_id = 10)
      );
    `);

    await client.query(`
      DELETE FROM registrations WHERE race_id IN (SELECT id FROM races WHERE tournament_id = 10);
    `);

    await client.query(`
      DELETE FROM races WHERE tournament_id = 10;
    `);

    await client.query(`
      DELETE FROM tournaments WHERE id = 10;
    `);

    await client.query('COMMIT');
    console.log('Successfully deleted Tournament 10 and all associated data.');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Error:', e);
  } finally {
    await client.end();
  }
}
run();
