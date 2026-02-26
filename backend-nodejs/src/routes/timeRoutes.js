const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const timeController = require("../controllers/timeController");
const {
  addWeeklyTimeEntryValidator,
  getWeeklyTimeEntryValidator,
  deleteTimeEntryValidator,
  validate,
} = require("../validators/timeEntry.validator");

router.post("/weekly", auth, addWeeklyTimeEntryValidator, validate, timeController.addWeeklyTimeEntry);
router.get("/weekly", auth, getWeeklyTimeEntryValidator, validate, timeController.getWeeklyTimeEntry);
router.delete("/weekly/:timeEntryId", auth, deleteTimeEntryValidator, validate, timeController.deleteTimeEntry);

module.exports = router;
