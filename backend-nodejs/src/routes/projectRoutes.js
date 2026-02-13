const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const controller = require("../controllers/projectController");

router.post("/", auth, controller.createProject);
router.get("/", auth, controller.getProjects);

module.exports = router;
