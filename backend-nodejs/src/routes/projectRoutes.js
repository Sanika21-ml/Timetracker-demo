const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const controller = require("../controllers/projectController");

router.post("/add",controller.createProject);
router.get("/get",controller.getProjects);
router.put("/update/:id", controller.updateProject);
router.delete("/delete/:id", controller.deleteProject);

module.exports = router;
