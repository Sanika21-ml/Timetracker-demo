const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportsController");

router.get("/monthly", reportController.getMonthlyTimesheetReport);
router.get("/monthly/excel", reportController.downloadMonthlyTimesheetExcel);

module.exports = router;