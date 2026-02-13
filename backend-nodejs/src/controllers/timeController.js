const pool = require("../config/db");

exports.addTimeEntry = async (req, res) => {
  const { projectId, workstreamId, date, hours } = req.body;

  try {
    await pool.connect();
    await pool.request()
      .input("projectId", projectId)
      .input("workstreamId", workstreamId)
      .input("date", date)
      .input("hours", hours)
      .input("userEmail", req.user.email)
      .query(`
        INSERT INTO TimeEntries 
        (ProjectId, WorkstreamId, Date, Hours, UserEmail)
        VALUES (@projectId, @workstreamId, @date, @hours, @userEmail)
      `);

    res.status(201).json({ message: "Time entry added" });
  } catch (err) {
    res.status(500).json(err.message);
  }
};
