const express = require("express");
const cors = require("cors");
const db = require("./db"); // ← your SQLite connection

const app = express();
const PORT = 8080;
console.log("SERVER.JS LOADED");

app.use(cors());
app.use(express.json());

/* ===============================
   INCIDENTS API (PUT IT HERE)
================================ */
app.get("/incidents", (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 10);
  const offset = (page - 1) * limit;

  db.all(
    "SELECT * FROM incidents LIMIT ? OFFSET ?",
    [limit, offset],
    (err, rows) => {
      if (err) return res.status(500).json(err);

      db.get("SELECT COUNT(*) as total FROM incidents", (err, count) => {
        res.json({
          data: rows,
          total: count.total,
          page,
          limit,
        });
      });
    }
  );
});

/* ===============================
   SERVER START
================================ */
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
