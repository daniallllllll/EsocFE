const express = require("express");
const cors = require("cors");

const incidentRoutes = require("./routes/incidents");

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

app.use("/api/incidents", incidentRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});
