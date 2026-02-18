const pool = require("../config/db");

exports.addTimeEntry = async (req, res) => {
  const { projectId, workstreamId, userId, date, hours } = req.body;

  try {
    await pool.query(
      `INSERT INTO TimeEntries
       (time_entry_id, project_id, workstream_id, user_id, date, hours,comment)
       VALUES (UUID(), ?, ?, ?, ?, ?)`,
      [projectId, workstreamId, userId, date, hours, comment]
    );

    res.status(201).json({ message: "Time entry added successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
