const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:jZltapbxTrViEgpYZdBbdGIqCPhuoMIU@sakura.proxy.rlwy.net:37948/railway' });

async function run() {
  await client.connect();
  try {
      await client.query(`ALTER TABLE races ALTER COLUMN status TYPE varchar(50) USING status::varchar;`);
      await client.query(`ALTER TABLE bets ALTER COLUMN status TYPE varchar(50) USING status::varchar;`);
      await client.query(`ALTER TABLE jockey_invitations ALTER COLUMN status TYPE varchar(50) USING status::varchar;`);
      await client.query(`ALTER TABLE registrations ALTER COLUMN status TYPE varchar(50) USING status::varchar;`);
      await client.query(`ALTER TABLE transaction_histories ALTER COLUMN direction TYPE varchar(50) USING direction::varchar;`);
      await client.query(`ALTER TABLE transaction_histories ALTER COLUMN status TYPE varchar(50) USING status::varchar;`);
      await client.query(`ALTER TABLE transaction_histories ALTER COLUMN type TYPE varchar(50) USING type::varchar;`);
      
      console.log('Successfully changed all ENUM columns to varchar(50)');

      await client.query(`DROP TYPE IF EXISTS RaceStatus CASCADE;`);
      await client.query(`DROP TYPE IF EXISTS BetStatus CASCADE;`);
      await client.query(`DROP TYPE IF EXISTS InvitationStatus CASCADE;`);
      await client.query(`DROP TYPE IF EXISTS RegistrationStatus CASCADE;`);
      await client.query(`DROP TYPE IF EXISTS TransactionDirection CASCADE;`);
      await client.query(`DROP TYPE IF EXISTS TransactionStatus CASCADE;`);
      await client.query(`DROP TYPE IF EXISTS TransactionType CASCADE;`);
      
      console.log('Successfully dropped ENUM types');
  } catch(e) {
      console.error(e);
  } finally {
      await client.end();
  }
}
run();
