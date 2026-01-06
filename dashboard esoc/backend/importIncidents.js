const fs = require("fs");
const csv = require("csv-parser");
const db = require("./db");

const filePath = "./incidents.csv";

let count = 0;

fs.createReadStream(filePath)
  .pipe(csv())
  .on("data", (row) => {
    const {
      incident_id,
      incident_name,
      description,
      severity,
      status,
      platform,
      source,
      customer_name,
      timestamp,
    } = row;

    db.run(
      `
      INSERT INTO incidents (
        incident_id,
        incident_name,
        description,
        severity,
        status,
        platform,
        source,
        customer_name,
        timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        incident_id,
        incident_name,
        description,
        severity,
        status,
        platform,
        source,
        customer_name,
        timestamp,
      ],
      (err) => {
        if (err) {
          console.error("❌ Insert error:", err.message);
        }
      }
    );

    count++;
  })
  .on("end", () => {
    console.log(`✅ Import completed. ${count} records inserted.`);
  });
