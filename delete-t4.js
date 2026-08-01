const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:jZltapbxTrViEgpYZdBbdGIqCPhuoMIU@sakura.proxy.rlwy.net:37948/railway' });

async function run() {
  await client.connect();
  try {
      await client.query('BEGIN');
      
      console.log('Deleting jockey_invitations...');
      await client.query(`
          DELETE FROM jockey_invitations WHERE registration_id IN (
              SELECT id FROM registrations WHERE race_id IN (
                  SELECT id FROM races WHERE tournament_id = 11
              )
          );
      `);
      
      console.log('Deleting registrations...');
      await client.query(`
          DELETE FROM registrations WHERE race_id IN (
              SELECT id FROM races WHERE tournament_id = 11
          );
      `);
      
      console.log('Deleting races...');
      await client.query(`
          DELETE FROM races WHERE tournament_id = 11;
      `);
      
      console.log('Deleting tournament...');
      await client.query(`
          DELETE FROM tournaments WHERE id = 11;
      `);
      
      await client.query('COMMIT');
      console.log('Successfully deleted tournament 11 (Giải đấu 4)');
  } catch (e) {
      await client.query('ROLLBACK');
      console.error('Error during deletion:', e);
  } finally {
      await client.end();
  }
}
run();
