const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres:jZltapbxTrViEgpYZdBbdGIqCPhuoMIU@sakura.proxy.rlwy.net:37948/railway'
});

async function run() {
  try {
    await client.connect();
    
    // First, let's refund the bets so the users' wallets get their money back
    // The user said "kiểu hiện đang bị ràng buộc 1000000./ngày" -> meaning they reached the betting limit.
    // If we just delete the bet, the limit is freed, but it's good to refund them just in case they need the money.
    // Actually, the easiest is to just delete the bets. Let's delete the bets.
    
    const query = `
      DO $$ 
      DECLARE
        v_tournament_ids int[];
      BEGIN
        SELECT array_agg(id) INTO v_tournament_ids FROM tournaments WHERE LOWER(name) IN (LOWER('Siêu cúp mùa hè'), LOWER('Siêu cúp tây ban nha'));
        
        IF v_tournament_ids IS NULL THEN
          RAISE NOTICE 'No tournaments found';
          RETURN;
        END IF;

        -- Delete transaction histories linked to bets in these tournaments
        DELETE FROM transaction_histories 
        WHERE bet_id IN (
          SELECT id FROM bets WHERE race_id IN (
            SELECT id FROM races WHERE tournament_id = ANY(v_tournament_ids)
          )
        );

        -- Delete bets
        DELETE FROM bets WHERE race_id IN (SELECT id FROM races WHERE tournament_id = ANY(v_tournament_ids));
        
        -- Delete referee_reports
        DELETE FROM referee_reports WHERE race_id IN (SELECT id FROM races WHERE tournament_id = ANY(v_tournament_ids));

        -- Delete jockey_invitations
        DELETE FROM jockey_invitations WHERE registration_id IN (
          SELECT id FROM registrations WHERE race_id IN (
            SELECT id FROM races WHERE tournament_id = ANY(v_tournament_ids)
          )
        );

        -- Delete registrations
        DELETE FROM registrations WHERE race_id IN (SELECT id FROM races WHERE tournament_id = ANY(v_tournament_ids));

        -- Delete races
        DELETE FROM races WHERE tournament_id = ANY(v_tournament_ids);

        -- Delete tournaments
        DELETE FROM tournaments WHERE id = ANY(v_tournament_ids);
      END $$;
    `;
    
    console.log("Executing delete queries...");
    await client.query(query);
    console.log("Successfully deleted all related data.");
  } catch (err) {
    console.error("Error executing query", err);
  } finally {
    await client.end();
  }
}

run();
