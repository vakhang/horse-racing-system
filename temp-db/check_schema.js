const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres:jZltapbxTrViEgpYZdBbdGIqCPhuoMIU@sakura.proxy.rlwy.net:37948/railway'
});

async function run() {
  try {
    await client.connect();

    // 1. Get Enums
    const enumQuery = `
      SELECT t.typname, e.enumlabel
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      ORDER BY t.typname, e.enumsortorder;
    `;
    const enumRes = await client.query(enumQuery);
    const enums = {};
    enumRes.rows.forEach(row => {
      if (!enums[row.typname]) enums[row.typname] = [];
      enums[row.typname].push(row.enumlabel);
    });

    console.log("=== ENUMS ===");
    console.log(JSON.stringify(enums, null, 2));

    // 2. Get Tables and Columns
    const tableQuery = `
      SELECT table_name, column_name, data_type, character_maximum_length, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position;
    `;
    const tableRes = await client.query(tableQuery);
    const tables = {};
    tableRes.rows.forEach(row => {
      if (!tables[row.table_name]) tables[row.table_name] = [];
      tables[row.table_name].push({
        col: row.column_name,
        type: row.data_type === 'USER-DEFINED' ? 'enum' : row.data_type,
        max_len: row.character_maximum_length,
        nullable: row.is_nullable,
        def: row.column_default
      });
    });

    console.log("\n=== TABLES ===");
    for (const [tableName, columns] of Object.entries(tables)) {
      console.log(`Table: ${tableName}`);
      columns.forEach(c => {
        let typeInfo = c.type;
        if (c.max_len) typeInfo += `(${c.max_len})`;
        console.log(`  ${c.col} | ${typeInfo} | Nullable: ${c.nullable} | Def: ${c.def}`);
      });
    }

  } catch (err) {
    console.error("Error", err);
  } finally {
    await client.end();
  }
}

run();
