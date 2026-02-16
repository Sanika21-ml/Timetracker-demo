const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const controller = require("../controllers/timeController");

router.post("/", controller.addTimeEntry);
router.get("/", controller.addTimeEntry);

module.exports = router;
