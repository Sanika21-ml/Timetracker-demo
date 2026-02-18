const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");


// ➤ Create Workstream
exports.createWorkstream = async (req, res) => {
  const { workstream_name, description, projectStatus_id } = req.body;

  try {
    const workstreamId = uuidv4();

    await pool.query(
      `INSERT INTO workstreams
       (workstream_id, workstream_name, description, projectStatus_id) 
       VALUES (?, ?, ?, ?)`,
      [workstreamId, workstream_name, description, projectStatus_id]
    );

    res.status(201).json({
      message: "Workstream created successfully",
      workstream_id: workstreamId
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// ➤ Get All Workstreams
exports.getAllWorkstreams = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM workstreams");
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ➤ Get Workstream By ID
exports.getWorkstreamById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM workstreams WHERE workstream_id = ?",
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Workstream not found" });
    }

    res.status(200).json(rows[0]);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ➤ Get specific Workstream according to projects
exports.getWorkstreamsByProject = async (req, res) => {
  const { projectId } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT w.workstream_id, w.workstream_name
       FROM ProjectWorkStreamAssign pwa
       JOIN workstreams w ON pwa.workstream_id = w.workstream_id
       WHERE pwa.project_id = ?`,
      [projectId]
    );

    res.status(200).json(rows);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




// ➤ Update Workstream
exports.updateWorkstream = async (req, res) => {
  const { workstream_name, description } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE workstreams
       SET workstream_name = ?, description = ? 
       WHERE workstream_id = ?`,
      [workstream_name, description, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Workstream not found" });
    }

    res.status(200).json({ message: "Workstream updated successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ➤ Delete Workstream
exports.deleteWorkstream = async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM workstreams WHERE workstream_id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Workstream not found" });
    }

    res.status(200).json({ message: "Workstream deleted successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
