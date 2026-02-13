require("dotenv").config();
require("./config/appInsights");

const express = require("express");
const cors = require("cors");

const projectRoutes = require("./routes/projectRoutes");
const timeRoutes = require("./routes/timeRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/projects", projectRoutes);
app.use("/api/time", timeRoutes);

app.get("/health", (req, res) => res.send("Backend running"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
