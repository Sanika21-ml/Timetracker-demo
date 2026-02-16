const pool = require("../config/db");

exports.createProject = async (req, res) => {

  const {
    project_id,
    project_name,
    project_type,
    client_name,
    Esti_hours,
    start_date,
    end_date,
    project_desc
  } = req.body;

  try {

    await pool.query(
      `INSERT INTO project
      (project_id, project_name, project_type, client_name, Esti_hours, start_date, end_date, project_desc)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        project_id,
        project_name,
        project_type,
        client_name,
        Esti_hours,
        start_date,
        end_date,
        project_desc
      ]
    );

    res.status(201).json({ message: "Project created" });

  } catch (err) {
    res.status(500).json(err.message);
  }
};



exports.getProjects = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM project");
    res.json(rows);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

exports.deleteProject = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(
      "DELETE FROM project WHERE project_id = ?",
      [id]
    );
    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json(err.message);
  }
};

exports.updateProject = async (req, res) => {
  const { id } = req.params; // project_id from URL
  const {
    project_name,
    project_type,
    client_name,
    Esti_hours,
    start_date,
    end_date,
    project_desc
  } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE project
       SET project_name = ?, 
           project_type = ?, 
           client_name = ?, 
           Esti_hours = ?, 
           start_date = ?, 
           end_date = ?, 
           project_desc = ?
       WHERE project_id = ?`,
      [project_name, project_type, client_name, Esti_hours, start_date, end_date, project_desc, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ message: "Project updated successfully" });
  } catch (err) {
    res.status(500).json(err.message);
  }
};

