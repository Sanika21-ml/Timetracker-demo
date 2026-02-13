const pool = require("../config/db");

exports.createProject = async (req, res) => {
  const { name, description } = req.body;

  try {
    await pool.connect();
    await pool.request()
      .input("name", name)
      .input("description", description)
      .input("createdBy", req.user.email)
      .query(`
        INSERT INTO Projects (Name, Description, CreatedBy)
        VALUES (@name, @description, @createdBy)
      `);

    res.status(201).json({ message: "Project created" });
  } catch (err) {
    res.status(500).json(err.message);
  }
};

exports.getProjects = async (req, res) => {
  try {
    await pool.connect();
    const result = await pool.request().query("SELECT * FROM Projects");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json(err.message);
  }
};
