const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:jZltapbxTrViEgpYZdBbdGIqCPhuoMIU@sakura.proxy.rlwy.net:37948/railway'
});

async function wipeData() {
  try {
    await client.connect();
    console.log('Connected to Railway DB');
    
    await client.query(`
      DELETE FROM transaction_histories;
      DELETE FROM bets;
      DELETE FROM audit_logs;
      DELETE FROM jockey_invitations;
      DELETE FROM registrations;
      DELETE FROM races;
      DELETE FROM tournaments;
    `);
    
    console.log('Successfully wiped all tournament, race, and bet data!');
  } catch (err) {
    console.error('Error wiping data:', err);
  } finally {
    await client.end();
  }
}

wipeData();
