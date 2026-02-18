const pool = require("../config/db");

exports.createProject = async (req, res) => {
  const {
    project_name,
    projectType_id,
    client_name,
    estimated_hours,
    start_date,
    end_date,
    project_description
  } = req.body;

  try {
    await pool.query(
      `INSERT INTO projects
       (project_name, projectType_id, client_name, estimated_hours, start_date, end_date, project_description)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        project_name,
        projectType_id,
        client_name,
        estimated_hours,
        start_date,
        end_date,
        project_description
      ]
    );

    const [rows] = await pool.query(
      `SELECT * FROM projects 
       WHERE project_name = ?
       ORDER BY created_at DESC 
       LIMIT 1`,
      [project_name]
    );

    res.status(201).json({
      message: "Project created successfully",
      project: rows[0]
    });

  } catch (err) {
    res.status(500).json(err.message);
  }
};



exports.getProjects = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM projects");
    res.json(rows);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

exports.updateProject = async (req, res) => {
  const { id } = req.params;

  const {
    project_name,
    projectType_id,
    client_name,
    estimated_hours,
    start_date,
    end_date,
    project_description
  } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE projects
       SET project_name = ?,
           projectType_id = ?,
           client_name = ?,
           estimated_hours = ?,
           start_date = ?,
           end_date = ?,
           project_description = ?
       WHERE project_id = ?`,
      [
        project_name,
        projectType_id,
        client_name,
        estimated_hours,
        start_date,
        end_date,
        project_description,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ message: "Project updated successfully" });

  } catch (err) {
    res.status(500).json(err.message);
  }
};

exports.deleteProject = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      "DELETE FROM projects WHERE project_id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ message: "Project deleted successfully" });

  } catch (err) {
    res.status(500).json(err.message);
  }
};