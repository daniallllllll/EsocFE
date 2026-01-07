const fs = require("fs");
const csv = require("csv-parser");
const db = require("./db");

fs.createReadStream("cortex_incident_202512221706.csv")
  .pipe(csv())
  .on("data", (row) => {
    db.run(
      `
      INSERT INTO incidents (
        incident_id, incident_name, description,
        severity, status, platform, source, customer_name, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        row.incident_id,
        row.incident_name,
        row.description,
        row.severity,
        row.status,
        row.platform,
        row.source,
        row.customer_name,
        row.timestamp,
      ]
    );
  })
  .on("end", () => {
    console.log("CSV imported successfully ✅");
  });
