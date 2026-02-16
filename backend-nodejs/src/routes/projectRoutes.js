const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const controller = require("../controllers/projectController");

router.post("/add",controller.createProject);
router.get("/get",controller.getProjects);
router.delete("/:id", controller.deleteProject);
router.put("/:id", controller.updateProject);

module.exports = router;
