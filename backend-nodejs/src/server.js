require("dotenv").config();
require("./config/appInsights");
require("./config/db.js");

const express = require("express");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? "https://your-frontend-domain.com"
        : "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

const projectRoutes = require("./routes/projectRoutes");
const timeRoutes = require("./routes/timeRoutes");
const workstreamRoutes = require("./routes/workstreamRoutes");
const authRoutes = require("./routes/authRoutes.js");
const reportsRoutes = require("./routes/reportsRoutes.js");

app.use("/api/login", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/timesheet", timeRoutes);
app.use("/api/workstreams", workstreamRoutes);
app.use("/api/reports", reportsRoutes);

app.get("/health", (req, res) => res.send("Backend running"));

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log(`Server running on ${PORT}`));