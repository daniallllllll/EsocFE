const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./incidents.db", (err) => {
  if (err) console.error(err.message);
  else console.log("Connected to SQLite database ✅");
});

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

module.exports = db;
