const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres:jZltapbxTrViEgpYZdBbdGIqCPhuoMIU@sakura.proxy.rlwy.net:37948/railway'
});

async function run() {
  try {
    await client.connect();
    
    console.log("Starting DB Cleanup...");
    
    console.log("Starting DB Cleanup...");

    const tablesToDelete = [
      'audit_logs',
      'transaction_histories',
      'bets',
      'jockey_invitations',
      'referee_reports',
      'registrations',
      'races',
      'tournaments',
      'horse_attachments',
      'horses',
      'system_funds',
      'user_attachments',
      'user_kyc_files'
    ];

    for (let table of tablesToDelete) {
      try {
        await client.query(`DELETE FROM ${table}`);
        console.log(`Cleared ${table}`);
      } catch (err) {
        console.log(`Skipped ${table}: ${err.message}`);
      }
    }

    // Delete wallets for non-admin users
    try {
      await client.query(`
        DELETE FROM wallets 
        WHERE user_id IN (SELECT id FROM users WHERE role != 'ADMIN')
      `);
      console.log("Cleared wallets for non-admins");
    } catch (err) {
      console.log("Skipped wallets:", err.message);
    }

    // Delete non-admin users
    try {
      const res = await client.query(`DELETE FROM users WHERE role != 'ADMIN'`);
      console.log(`Cleared ${res.rowCount} non-admin users`);
    } catch (err) {
      console.log("Error deleting users:", err.message);
      throw err;
    }

    console.log("Cleanup completed successfully! Only ADMIN users remain.");
  } catch (err) {
    console.error('Error executing cleanup', err.stack);
  } finally {
    await client.end();
  }
}

run();
