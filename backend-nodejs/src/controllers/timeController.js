const pool = require("../config/db");

// SAVE WEEKLY TIMESHEET
exports.addWeeklyTimeEntry = async (req, res) => {
  const { entries } = req.body;

  try {
    const userId = req.user.user_id;

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    for (const row of entries) {
      const { project_workstream_id, weekEntries } = row;

      for (const day of weekEntries) {
        if (!day.hours || parseFloat(day.hours) === 0) continue;

        await connection.query(
          `INSERT INTO time_entries
          (timeentry_id, user_id, project_workstream_id, entry_date, hours, comment)
          VALUES (UUID(), ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            hours = VALUES(hours),
            comment = VALUES(comment)`,
          [
            userId,
            project_workstream_id,
            day.date,
            day.hours,
            day.comment || null
          ]
        );
      }
    }

    await connection.commit();
    connection.release();

    res.status(201).json({
      message: "Weekly timesheet saved successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};


// GET WEEKLY TIMESHEET
exports.getWeeklyTimeEntry = async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const userId = req.user.user_id;

    const [rows] = await pool.query(
      `SELECT 
          t.project_workstream_id,
          t.entry_date,
          t.hours,
          t.comment,
          p.project_name,
          w.workstream_name
       FROM time_entries t
       JOIN project_workstream_assign pws 
            ON t.project_workstream_id = pws.project_workstream_id
       JOIN projects p 
            ON pws.project_id = p.project_id
       JOIN workstreams w 
            ON pws.workstream_id = w.workstream_id
       WHERE t.user_id = ?
       AND t.entry_date BETWEEN ? AND ?
       ORDER BY p.project_name, w.workstream_name, t.entry_date`,
      [userId, startDate, endDate]
    );

    const grouped = {};

    rows.forEach(row => {
      if (!grouped[row.project_workstream_id]) {
        grouped[row.project_workstream_id] = {
          project_workstream_id: row.project_workstream_id,
          project_name: row.project_name,
          workstream_name: row.workstream_name,
          weekEntries: []
        };
      }

      grouped[row.project_workstream_id].weekEntries.push({
        date: row.entry_date,
        hours: row.hours,
        comment: row.comment
      });
    });

    res.json(Object.values(grouped));

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// DELETE SINGLE ENTRY
exports.deleteTimeEntry = async (req, res) => {
  const { timeEntryId } = req.params;

  try {
    await pool.query(
      "DELETE FROM time_entries WHERE timeentry_id = ?",
      [timeEntryId]
    );

    res.json({ message: "Time entry deleted successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
