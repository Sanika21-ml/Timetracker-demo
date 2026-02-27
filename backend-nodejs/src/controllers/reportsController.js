const ExcelJS = require("exceljs");
const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");


exports.getMonthlyTimesheetReport = async (req, res) => {
  try {
    const { month, year, project_id, employee_id } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        message: "Month and year are required"
      });
    }

    const monthFormatted = month.padStart(2, "0");
    const startDate = `${year}-${monthFormatted}-01`;
    const endDate = `${year}-${monthFormatted}-31`;

    let query = `
      SELECT 
        u.user_id,
        u.name AS employee_name,
        p.project_id,
        p.project_name,
        pws.ProjectWorkStream_id,
        w.workstream_id,
        w.workstream_name,
        jt.work_date,
        jt.hours
      FROM time_entries t

      INNER JOIN users u 
        ON u.user_id = t.user_id

      INNER JOIN ProjectWorkStreamAssign pws 
        ON pws.ProjectWorkStream_id = t.project_workstream_id

      INNER JOIN projects p 
        ON p.project_id = pws.project_id

      INNER JOIN workstreams w 
        ON w.workstream_id = pws.workstream_id

      CROSS JOIN JSON_TABLE(
        t.week_entries,
        '$[*]' COLUMNS (
          work_date DATE PATH '$.date',
          hours DECIMAL(5,2) PATH '$.hours'
        )
      ) AS jt

      WHERE jt.work_date BETWEEN ? AND ?
    `;

    const params = [startDate, endDate];

    if (project_id) {
      query += ` AND p.project_id = ?`;
      params.push(project_id);
    }

    if (employee_id) {
      query += ` AND u.user_id = ?`;
      params.push(employee_id);
    }

    query += ` ORDER BY u.name, p.project_name, jt.work_date`;

    const [rows] = await pool.query(query, params);

    return res.status(200).json(rows);

  } catch (error) {
    console.error("REPORT ERROR:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

exports.downloadMonthlyTimesheetExcel = async (req, res) => {
  try {
    const { month, year, project_id, employee_id } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        message: "Month and year are required"
      });
    }

    let query = `
      SELECT 
        u.name AS employee_name,
        p.project_name,
        w.workstream_name,
        jt.work_date,
        jt.hours
      FROM time_entries t

      JOIN users u 
        ON u.user_id = t.user_id

      JOIN ProjectWorkStreamAssign pws 
        ON pws.ProjectWorkStream_id = t.project_workstream_id

      JOIN projects p 
        ON p.project_id = pws.project_id

      JOIN workstreams w 
        ON w.workstream_id = pws.workstream_id

      JOIN JSON_TABLE(
        t.week_entries,
        '$[*]' COLUMNS (
          work_date DATE PATH '$.date',
          hours DECIMAL(5,2) PATH '$.hours'
        )
      ) AS jt

      WHERE MONTH(jt.work_date) = ?
      AND YEAR(jt.work_date) = ?
    `;

    const params = [month, year];

    if (project_id) {
      query += ` AND p.project_id = ?`;
      params.push(project_id);
    }

    if (employee_id) {
      query += ` AND u.user_id = ?`;
      params.push(employee_id);
    }

    query += ` ORDER BY u.name, p.project_name, jt.work_date`;

    const [rows] = await pool.query(query, params);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Monthly Report");

    worksheet.columns = [
      { header: "Employee Name", key: "employee_name", width: 25 },
      { header: "Project", key: "project_name", width: 25 },
      { header: "Workstream", key: "workstream_name", width: 20 },
      { header: "Date", key: "work_date", width: 18 },
      { header: "Hours", key: "hours", width: 12 },
    ];

    rows.forEach(row => worksheet.addRow(row));

    const total = rows.reduce(
      (sum, r) => sum + parseFloat(r.hours || 0),
      0
    );

    worksheet.addRow([]);
    worksheet.addRow({
      employee_name: "Grand Total",
      hours: total
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Timesheet_Report_${month}_${year}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("EXCEL ERROR:", error);
    return res.status(500).json({
      message: "Excel generation failed",
      error: error.message
    });
  }
};