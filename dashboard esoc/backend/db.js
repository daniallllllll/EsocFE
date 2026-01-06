const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const db = new sqlite3.Database(
  path.join(__dirname, "incidents.db"),
  (err) => {
    if (err) {
      console.error("❌ DB connection error", err.message);
    } else {
      console.log("✅ Connected to SQLite database");
    }
  }
);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS incidents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      incident_id TEXT,
      incident_name TEXT,
      description TEXT,
      severity TEXT,
      status TEXT,
      platform TEXT,
      source TEXT,
      customer_name TEXT,
      timestamp TEXT
    )
  `);
});

module.exports = db;
