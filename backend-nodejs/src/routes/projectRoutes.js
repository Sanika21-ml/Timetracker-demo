const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const controller = require("../controllers/projectController");

router.post("/add",controller.createProject);
router.post("/add/workstreams",controller.assignWorkstreamsToProject);
router.get("/get",controller.getProjects);
router.get("/get/list",controller.getProjectsList);
router.get("/get/:id",controller.getProjectById);
router.put("/update/:id", controller.updateProject);
router.delete("/delete/:id", controller.deleteProject);

module.exports = router;
