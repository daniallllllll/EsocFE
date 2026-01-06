const express = require("express");
const router = express.Router();
const db = require("../db");

/* GET all incidents (with pagination) */
router.get("/", (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  db.all(
    "SELECT * FROM incidents ORDER BY timestamp DESC LIMIT ? OFFSET ?",
    [limit, offset],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

module.exports = router;
