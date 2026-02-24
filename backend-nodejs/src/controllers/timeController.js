const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");

exports.addWeeklyTimeEntry = async (req, res) => {
  const { entries, week_start_date, week_end_date } = req.body;
  const userId = req.user?.user_id;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!entries || !Array.isArray(entries) || entries.length === 0) {
    return res.status(400).json({ error: "entries array is required" });
  }

  if (!week_start_date || !week_end_date) {
    return res.status(400).json({ error: "week_start_date and week_end_date required" });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    for (const row of entries) {
      const { project_workstream_id, weekEntries } = row;

      if (!project_workstream_id || !weekEntries) continue;

      const timeentry_id = uuidv4();

      await connection.query(
        `INSERT INTO time_entries
         (timeentry_id, user_id, project_workstream_id, week_start_date, week_end_date, week_entries)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
            week_entries = VALUES(week_entries),
            updated_at = CURRENT_TIMESTAMP`,
        [
          timeentry_id,
          userId,
          project_workstream_id,
          week_start_date,
          week_end_date,
          JSON.stringify(weekEntries)
        ]
      );
    }

    await connection.commit();

    res.status(201).json({
      message: "Weekly timesheet saved successfully"
    });

  } catch (error) {
    await connection.rollback();
    console.error("addOrUpdateWeeklyTimeEntry ERROR:", error);
    res.status(500).json({ error: "Failed to save weekly timesheet" });
  } finally {
    connection.release();
  }
};

exports.getWeeklyTimeEntry = async (req, res) => {
  const { week_start_date } = req.query;
  const userId = req.user?.user_id;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!week_start_date) {
    return res.status(400).json({ error: "week_start_date is required" });
  }

  try {
    const [rows] = await pool.query(
      `SELECT 
          t.timeentry_id,
          t.project_workstream_id,
          t.week_start_date,
          t.week_end_date,
          t.week_entries,
          p.project_name,
          w.workstream_name
       FROM time_entries t
       JOIN ProjectWorkStreamAssign pws 
            ON t.project_workstream_id = pws.ProjectWorkStream_id
       JOIN projects p 
            ON pws.project_id = p.project_id
       JOIN workstreams w 
            ON pws.workstream_id = w.workstream_id
       WHERE t.user_id = ?
       AND t.week_start_date = ?
       ORDER BY p.project_name, w.workstream_name`,
      [userId, week_start_date]
    );

    const formatted = rows.map(row => ({
      timeentry_id: row.timeentry_id,
      project_workstream_id: row.project_workstream_id,
      project_name: row.project_name,
      workstream_name: row.workstream_name,
      week_start_date: row.week_start_date,
      week_end_date: row.week_end_date,
      weekEntries:
        typeof row.week_entries === "string"
          ? JSON.parse(row.week_entries)
          : row.week_entries
    }));

    res.status(200).json(formatted);

  } catch (error) {
    console.error("getWeeklyTimeEntry ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTimeEntry = async (req, res) => {
  const { timeEntryId } = req.params;  
  const userId = req.user?.user_id;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!timeEntryId) {
    return res.status(400).json({ error: "timeEntryId is required" });
  }

  try {
    const [result] = await pool.query(
      `DELETE FROM time_entries
       WHERE timeentry_id = ? AND user_id = ?`,
      [timeEntryId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Weekly entry not found"
      });
    }

    res.status(200).json({
      message: "Weekly timesheet deleted successfully"
    });

  } catch (error) {
    console.error("deleteTimeEntry ERROR:", error);
    res.status(500).json({ error: "Failed to delete weekly timesheet" });
  }
};