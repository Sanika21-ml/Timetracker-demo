const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const controller = require("../controllers/timeController");

router.post("/add", controller.addTimeEntry);
router.get("/get", controller.addTimeEntry);
module.exports = router;
