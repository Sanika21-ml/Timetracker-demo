const express = require("express");
const router = express.Router();
const workstreamController = require("../controllers/workstreamController");

router.post("/add", workstreamController.createWorkstream);
router.get("/get", workstreamController.getAllWorkstreams);
router.get("/get/list", workstreamController.getWorkstreamsList);
router.get("/get/:id", workstreamController.getWorkstreamById);
router.get("/get/project/:projectId", workstreamController.getWorkstreamsByProject);
router.put("/update/:id", workstreamController.updateWorkstream);
router.delete("/delete/:id", workstreamController.deleteWorkstream);

module.exports = router;
