const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const timeController = require("../controllers/timeController");

// Save weekly timesheet
router.post("/weekly", auth, timeController.addWeeklyTimeEntry);
// Get weekly timesheet
router.get("/weekly", auth, timeController.getWeeklyTimeEntry);
// Delete entry
router.delete("/:timeEntryId", auth, timeController.deleteTimeEntry);

module.exports = router;
