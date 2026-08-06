const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres:jZltapbxTrViEgpYZdBbdGIqCPhuoMIU@sakura.proxy.rlwy.net:37948/railway'
});

async function run() {
  try {
    await client.connect();
    
    // Begin Transaction
    await client.query('BEGIN');
    
    console.log("Starting Migration...");

    // 1. users
    console.log("Updating users table...");
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS is_busy BOOLEAN DEFAULT false;
    `);

    // 2. horses
    console.log("Updating horses table...");
    await client.query(`
      ALTER TABLE horses 
      ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 40,
      ADD COLUMN IF NOT EXISTS class_level INTEGER DEFAULT 4;
    `);

    // 3. tournaments
    console.log("Updating tournaments table...");
    await client.query(`
      ALTER TABLE tournaments 
      ADD COLUMN IF NOT EXISTS required_class INTEGER;
    `);

    // 4. races
    console.log("Updating races table...");
    await client.query(`
      ALTER TABLE races 
      ADD COLUMN IF NOT EXISTS minus_pool_deficit NUMERIC(15,2) DEFAULT 0.0;
    `);

    // 5. registrations
    console.log("Updating registrations table...");
    await client.query(`
      ALTER TABLE registrations 
      ADD COLUMN IF NOT EXISTS assigned_weight DOUBLE PRECISION,
      ADD COLUMN IF NOT EXISTS actual_weight DOUBLE PRECISION,
      ADD COLUMN IF NOT EXISTS lead_weight DOUBLE PRECISION,
      ADD COLUMN IF NOT EXISTS is_weighed_in BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS gate_number INTEGER;
    `);
    
    // Try to add UNIQUE constraint on race_id and gate_number
    try {
      await client.query(`
        ALTER TABLE registrations
        ADD CONSTRAINT uq_race_gate UNIQUE (race_id, gate_number);
      `);
    } catch (e) {
      console.log("Constraint uq_race_gate might already exist or data conflicts:", e.message);
    }

    // 6. bets
    console.log("Updating bets table...");
    await client.query(`
      ALTER TABLE bets 
      ADD COLUMN IF NOT EXISTS bet_type VARCHAR(255) DEFAULT 'WIN' NOT NULL,
      ADD COLUMN IF NOT EXISTS registration_id_2 INTEGER,
      ADD COLUMN IF NOT EXISTS gross_payout NUMERIC(15,2),
      ADD COLUMN IF NOT EXISTS net_payout NUMERIC(15,2);
    `);

    // Add foreign key for registration_id_2
    try {
      await client.query(`
        ALTER TABLE bets
        ADD CONSTRAINT fk_bets_registration_id_2 FOREIGN KEY (registration_id_2) REFERENCES registrations(id);
      `);
    } catch (e) {
      console.log("Foreign key constraint might already exist:", e.message);
    }

    // 7. system_funds
    console.log("Creating system_funds table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS system_funds (
        id SERIAL PRIMARY KEY,
        fund_type VARCHAR(255) NOT NULL,
        class_level INTEGER,
        balance NUMERIC(15,2) DEFAULT 0.0,
        updated_at TIMESTAMP WITHOUT TIME ZONE
      );
    `);

    await client.query('COMMIT');
    console.log("Migration completed successfully.");

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Migration failed, rolled back.", err);
  } finally {
    await client.end();
  }
}

run();
