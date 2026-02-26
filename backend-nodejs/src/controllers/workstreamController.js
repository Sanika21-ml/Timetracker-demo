const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");


// ➤ Create Workstream
exports.createWorkstream = async (req, res) => {
  let { workstream_name, description, estimated_hrs } = req.body;

  if (!workstream_name?.trim()) {
    return res.status(400).json({ message: "workstream_name is required" });
  }

  workstream_name = workstream_name.trim();
  estimated_hrs = Number(estimated_hrs) || 0;

  if (estimated_hrs < 0) {
    return res.status(400).json({ message: "estimated_hrs cannot be negative" });
  }

  try {
    const [existing] = await pool.query(
      "SELECT workstream_id FROM workstreams WHERE workstream_name = ?",
      [workstream_name]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "Workstream already exists" });
    }

    const workstreamId = uuidv4();

    await pool.query(
      `INSERT INTO workstreams
       (workstream_id, workstream_name, description, estimated_hrs)
       VALUES (?, ?, ?, ?)`,
      [workstreamId, workstream_name, description || null, estimated_hrs]
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

exports.getWorkstreamsList = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT workstream_id,workstream_name FROM workstreams order by workstream_name ASC ");
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
      `SELECT 
         pwa.ProjectWorkStream_id AS project_workstream_id,
         w.workstream_name
       FROM ProjectWorkStreamAssign pwa
       JOIN workstreams w 
         ON pwa.workstream_id = w.workstream_id
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
