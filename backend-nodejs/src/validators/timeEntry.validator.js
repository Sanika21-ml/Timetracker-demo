const { body, query, param, validationResult } = require("express-validator");

// ─── Validation Rules ───────────────────────────────────────────────────────

exports.addWeeklyTimeEntryValidator = [
  body("week_start_date")
    .notEmpty().withMessage("week_start_date is required")
    .isDate().withMessage("week_start_date must be a valid date (YYYY-MM-DD)"),

  body("week_end_date")
    .notEmpty().withMessage("week_end_date is required")
    .isDate().withMessage("week_end_date must be a valid date (YYYY-MM-DD)"),

  body("entries")
    .isArray({ min: 1 }).withMessage("entries must be a non-empty array"),

  body("entries.*.project_workstream_id")
    .notEmpty().withMessage("Each entry must have a project_workstream_id")
    .isUUID().withMessage("project_workstream_id must be a valid UUID"),

  body("entries.*.weekEntries")
    .isArray({ min: 1 }).withMessage("weekEntries must be a non-empty array"),

  body("entries.*.weekEntries.*.date")
    .notEmpty().withMessage("Each weekEntry must have a date")
    .isDate().withMessage("date must be a valid date (YYYY-MM-DD)"),

  body("entries.*.weekEntries.*.hours")
    .notEmpty().withMessage("Each weekEntry must have hours")
    .isFloat({ min: 0, max: 24 }).withMessage("hours must be a number between 0 and 24"),

  body("entries.*.weekEntries.*.comment")
    .optional()
    .isString().withMessage("comment must be a string")
    .isLength({ max: 255 }).withMessage("comment must not exceed 255 characters"),
];

exports.getWeeklyTimeEntryValidator = [
  query("week_start_date")
    .notEmpty().withMessage("week_start_date is required")
    .isDate().withMessage("week_start_date must be a valid date (YYYY-MM-DD)"),
];

exports.deleteTimeEntryValidator = [
  param("timeEntryId")
    .notEmpty().withMessage("timeEntryId is required")
    .isUUID().withMessage("timeEntryId must be a valid UUID"),
];

// ─── Validation Middleware ───────────────────────────────────────────────────

exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};