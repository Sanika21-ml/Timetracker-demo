// =============================================================
//  migrate.js – Run once to set up the timetracker DB schema
//  Usage: node migrate.js
//  npm run migrate
// =============================================================

require("dotenv").config();
const mysql = require("mysql2/promise");
const fs    = require("fs");
const path  = require("path");

async function runMigration() {
  let connection;

  try {
    console.log("🔌 Connecting to MySQL...");

    // Connect WITHOUT specifying a database — the SQL file creates it
    connection = await mysql.createConnection({
      host    : process.env.DB_HOST,
      user    : process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port    : process.env.DB_PORT || 3306,
      multipleStatements: true,   // needed to run the full .sql file at once
      ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
    });

    console.log("Connected.\n");

    const sqlFile = path.join(__dirname, "timetracker_migration.sql");

    if (!fs.existsSync(sqlFile)) {
      throw new Error(`Migration file not found at: ${sqlFile}`);
    }

    const sql = fs.readFileSync(sqlFile, "utf8");

    console.log(" Running migration: timetracker_migration.sql ...");
    await connection.query(sql);

    console.log(" Migration completed successfully!");
    console.log(`   Database : ${process.env.DB_NAME}`);
    console.log(`   Host     : ${process.env.DB_HOST}`);

  } catch (err) {
    console.error("\n Migration failed:", err.message);
    process.exit(1);

  } finally {
    if (connection) await connection.end();
  }
}

runMigration();