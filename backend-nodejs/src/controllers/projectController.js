const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");

// ─────────────────────────────────────────────
// CREATE PROJECT
// ─────────────────────────────────────────────
exports.createProject = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const {
      project_name,
      project_manager_id,
      projectType_id,
      projectStatus_id,         
      client_name,
      start_date,
      end_date,
      project_description,
      workstreams,        // [{ workstream_id, start_date, end_date, estimated_hours }]
      users               // [userId, userId, ...]
    } = req.body;

    // ── Validation ──────────────────────────────
    if (!project_name || !projectType_id || !workstreams?.length) {
      return res.status(400).json({ message: "Missing required fields: project_name, projectType_id, workstreams" });
    }

    // Validate each workstream has required fields
    for (const ws of workstreams) {
      if (!ws.workstream_id) {
        return res.status(400).json({ message: "Each workstream must have a workstream_id" });
      }
    }

    await connection.beginTransaction();

    const projectId = uuidv4();

    // Sum estimated hours from all workstreams
    const totalEstimatedHours = workstreams.reduce(
      (sum, ws) => sum + Number(ws.estimated_hours || 0),
      0
    );

    // ── Insert Project ───────────────────────────
    await connection.query(
      `INSERT INTO projects
        (project_id, project_name, project_manager_id, projectType_id,
         client_name, estimated_hours, start_date, end_date, project_description, projectStatus_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        projectId,
        project_name,
        project_manager_id || null,
        projectType_id,
        projectStatus_id,
        client_name || null,
        totalEstimatedHours,
        start_date || null,
        end_date || null,
        project_description || null
      ]
    );

    // ── Insert Workstreams ───────────────────────
    for (const ws of workstreams) {
      await connection.query(
        `INSERT INTO ProjectWorkStreamAssign
          (ProjectWorkStream_id, project_id, workstream_id, start_date, end_date, estimated_hours)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          projectId,
          ws.workstream_id,
          ws.start_date || null,
          ws.end_date || null,
          ws.estimated_hours || 0
        ]
      );
    }

    // ── Insert User Assignments ──────────────────
    if (users?.length) {
      for (const userId of users) {
        await connection.query(
          `INSERT INTO userProjectAssign
            (userProject_id, user_id, project_id)
           VALUES (?, ?, ?)`,
          [uuidv4(), userId, projectId]
        );
      }
    }

    await connection.commit();

    res.status(201).json({
      message: "Project created successfully",
      project_id: projectId,
      total_estimated_hours: totalEstimatedHours
    });

  } catch (err) {
    await connection.rollback();
    res.status(500).json({ message: err.message });
  } finally {
    connection.release();
  }
};

exports.assignWorkstreamsToProject = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { project_id, workstreams } = req.body;

    // Validation
    if (!project_id || !Array.isArray(workstreams) || workstreams.length === 0) {
      return res.status(400).json({
        message: "project_id and workstreams array are required"
      });
    }

    await connection.beginTransaction();

    // ✅ Check project exists
    const [project] = await connection.query(
      "SELECT project_id FROM projects WHERE project_id = ?",
      [project_id]
    );

    if (project.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Project not found" });
    }

    for (const ws of workstreams) {

      if (!ws.workstream_id) {
        await connection.rollback();
        return res.status(400).json({
          message: "Each workstream must have workstream_id"
        });
      }

      // ✅ Check workstream exists
      const [existingWs] = await connection.query(
        "SELECT workstream_id FROM workstreams WHERE workstream_id = ?",
        [ws.workstream_id]
      );

      if (existingWs.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          message: `Workstream not found: ${ws.workstream_id}`
        });
      }

      // ✅ Prevent duplicate assignment
      const [duplicate] = await connection.query(
        `SELECT 1 FROM ProjectWorkStreamAssign
         WHERE project_id = ? AND workstream_id = ?`,
        [project_id, ws.workstream_id]
      );

      if (duplicate.length > 0) {
        continue; // Skip duplicate instead of failing
      }

      await connection.query(
        `INSERT INTO ProjectWorkStreamAssign
         (ProjectWorkStream_id, project_id, workstream_id)
         VALUES (?, ?, ?)`,
        [
          uuidv4(),
          project_id,
          ws.workstream_id
        ]
      );
    }

    await connection.commit();

    res.status(201).json({
      message: "Workstreams assigned successfully"
    });

  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
};

// ─────────────────────────────────────────────
// GET ALL PROJECTS
// ─────────────────────────────────────────────
exports.getProjects = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        p.*,
        pt.TypeValue       AS project_type,
       
        u.name             AS project_manager_name
      FROM projects p
      LEFT JOIN projecttype pt      ON p.projectType_id = pt.projectType_id
    
      LEFT JOIN users u             ON p.project_manager_id = u.user_id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProjectsList = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        project_id,
        project_name
      FROM projects
      ORDER BY project_name ASC
    `);

    res.status(200).json(rows);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// ─────────────────────────────────────────────
// GET SINGLE PROJECT (with workstreams & users)
// ─────────────────────────────────────────────
exports.getProjectById = async (req, res) => {
  const { id } = req.params;

  try {
    // Project details
    const [[project]] = await pool.query(`
      SELECT
        p.*,
        pt.TypeValue       AS project_type,
        ps.StatusValue     AS project_status,
        u.name             AS project_manager_name
      FROM projects p
      LEFT JOIN projecttype pt      ON p.projectType_id = pt.projectType_id
      LEFT JOIN projectstatus ps    ON p.status_id      = ps.projectStatus_id
      LEFT JOIN users u             ON p.project_manager_id = u.user_id
      WHERE p.project_id = ?
    `, [id]);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Assigned workstreams
    const [workstreams] = await pool.query(`
      SELECT
        pwa.*,
        ws.workstream_name
      FROM ProjectWorkStreamAssign pwa
      LEFT JOIN workstreams ws ON pwa.workstream_id = ws.workstream_id
      WHERE pwa.project_id = ?
    `, [id]);

    // Assigned users
    const [users] = await pool.query(`
      SELECT
        upa.userProject_id,
        u.user_id,
        u.name,
        u.email
      FROM userProjectAssign upa
      LEFT JOIN users u ON upa.user_id = u.user_id
      WHERE upa.project_id = ?
    `, [id]);

    res.json({ ...project, workstreams, users });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// UPDATE PROJECT
// ─────────────────────────────────────────────
exports.updateProject = async (req, res) => {
  const { id } = req.params;
  const connection = await pool.getConnection();

  try {
    const {
      project_name,
      project_manager_id,
      projectType_id,
      projectStatus_id,         
      client_name,
      start_date,
      end_date,
      project_description,
      workstreams,
      users
    } = req.body;

    await connection.beginTransaction();

    // ── Check project exists ─────────────────────
    const [existing] = await connection.query(
      "SELECT project_id FROM projects WHERE project_id = ?",
      [id]
    );

    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Project not found" });
    }

    // ── Calculate total hours ────────────────────
    const totalEstimatedHours = workstreams?.reduce(   // ✅ safe optional chaining
      (sum, ws) => sum + Number(ws.estimated_hours || 0),
      0
    ) ?? 0;

    // ── Update project ───────────────────────────
    await connection.query(
      `UPDATE projects
       SET project_name       = ?,
           project_manager_id = ?,
           projectType_id     = ?,
           projectStatus_id   = ?,    
           client_name        = ?,
           estimated_hours    = ?,
           start_date         = ?,
           end_date           = ?,
           project_description = ?
       WHERE project_id = ?`,
      [
        project_name,
        project_manager_id || null,
        projectType_id,
        projectStatus_id || null,        
        client_name || null,
        totalEstimatedHours,
        start_date || null,
        end_date || null,
        project_description || null,
        id
      ]
    );

    // ── Refresh workstreams (delete + re-insert) ─
    await connection.query(
      "DELETE FROM ProjectWorkStreamAssign WHERE project_id = ?",
      [id]
    );

    if (workstreams?.length) {
      for (const ws of workstreams) {
        await connection.query(
          `INSERT INTO ProjectWorkStreamAssign
            (ProjectWorkStream_id, project_id, workstream_id, start_date, end_date, estimated_hours)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            uuidv4(),
            id,
            ws.workstream_id,
            ws.start_date || null,
            ws.end_date || null,
            ws.estimated_hours || 0
          ]
        );
      }
    }

    // ── Refresh user assignments ─────────────────
    await connection.query(
      "DELETE FROM userProjectAssign WHERE project_id = ?",
      [id]
    );

    if (users?.length) {
      for (const userId of users) {
        await connection.query(
          `INSERT INTO userProjectAssign
            (userProject_id, user_id, project_id)
           VALUES (?, ?, ?)`,
          [uuidv4(), userId, id]
        );
      }
    }

    await connection.commit();

    res.json({
      message: "Project updated successfully",
      total_estimated_hours: totalEstimatedHours
    });

  } catch (err) {
    await connection.rollback();
    res.status(500).json({ message: err.message });
  } finally {
    connection.release();
  }
};

// ─────────────────────────────────────────────
// DELETE PROJECT
// ─────────────────────────────────────────────
exports.deleteProject = async (req, res) => {
  const { id } = req.params;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [existing] = await connection.query(
      "SELECT project_id FROM projects WHERE project_id = ?",
      [id]
    );

    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Project not found" });
    }

    // CASCADE on FK handles ProjectWorkStreamAssign & userProjectAssign automatically
    await connection.query(
      "DELETE FROM projects WHERE project_id = ?",
      [id]
    );

    await connection.commit();

    res.json({ message: "Project deleted successfully" });

  } catch (err) {
    await connection.rollback();
    res.status(500).json({ message: err.message });
  } finally {
    connection.release();
  }
};