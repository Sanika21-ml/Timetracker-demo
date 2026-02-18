require("dotenv").config();
require("./config/appInsights");
require("./config/db.js");

const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

const projectRoutes = require("./routes/projectRoutes");
const timeRoutes = require("./routes/timeRoutes");
const workstreamRoutes = require("./routes/workstreamRoutes");



app.use("/api/projects", projectRoutes);
app.use("/api/timesheet", timeRoutes);
app.use("/api/workstreams", workstreamRoutes);
app.get("/health", (req, res) => res.send("Backend running"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
