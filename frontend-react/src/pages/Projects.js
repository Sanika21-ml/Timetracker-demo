import { useState } from "react";
import "../styles/Projects.css";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiSearch,
} from "react-icons/fi";

const EMPTY_PROJECT = {
  id: null,
  name: "",
  type: "",
  status: "In Progress",
  hours: "",
  startDate: "",
  endDate: "",
  client: "",
};

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState(EMPTY_PROJECT);
  const [deleteId, setDeleteId] = useState(null);

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  /* ---------- MODAL ACTIONS ---------- */
  const openAddModal = () => {
    setIsEdit(false);
    setForm(EMPTY_PROJECT);
    setShowModal(true);
  };

  const openEditModal = (project) => {
    setIsEdit(true);
    setForm(project);
    setShowModal(true);
  };

  const saveProject = () => {
    setProjects([...projects, { ...form, id: Date.now() }]);
    setShowModal(false);
  };

  const updateProject = () => {
    setProjects(projects.map(p => (p.id === form.id ? form : p)));
    setShowModal(false);
  };

  const confirmDelete = () => {
    setProjects(projects.filter(p => p.id !== deleteId));
    setDeleteId(null);
  };

  /* ---------- UI ---------- */
  return (
    <div className="projects-page">

      {/* HEADER */}
      <div className="projects-header">
        <div>
          <h1>Projects</h1>
          <p>View and manage projects</p>
        </div>

        <div className="header-actions">
          <div className="search-box">
            <FiSearch />
            <input
              placeholder="Search project..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button className="add-project-btn" onClick={openAddModal}>
            <FiPlus /> Add Project
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="projects-table-wrapper">
        <table className="projects-table">
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Type</th>
              <th>Status</th>
              <th>Est. Hours</th>
              <th>Start Date</th>
              <th className="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map(p => (
              <tr key={p.id}>
                <td className="project-name">{p.name}</td>
                <td>
                  <span className={`badge ${p.type === "Client" ? "badge-client" : "badge-internal"}`}>
                    {p.type || "-"}
                  </span>
                </td>
                <td><span className="badge badge-status">{p.status}</span></td>
                <td>{p.hours || "-"}</td>
                <td>{p.startDate || "-"}</td>
                <td className="actions">
                  <FiEdit2 onClick={() => openEditModal(p)} />
                  <FiTrash2 className="delete" onClick={() => setDeleteId(p.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div className="modal-backdrop">
            <div className="modal-header">
              <h2>{isEdit ? "Edit Project" : "Add New Project"}</h2>
              <FiX onClick={() => setShowModal(false)} />
            </div>

            <div className="modal-grid">
              <div>
                <label>Project Name *</label>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter project name"
                />
              </div>

              <div>
                <label>Type *</label>
                <select
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                >
                  <option value="">Select Type</option>
                  <option value="Client">Client Project</option>
                  <option value="Internal">Internal Project</option>
                </select>
              </div>

              <div>
                <label>Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                >
                  <option>In Progress</option>
                  <option>Completed</option>
                  <option>On Hold</option>
                </select>
              </div>

              <div>
                <label>Estimated Hours</label>
                <input
                  type="number"
                  value={form.hours}
                  onChange={e => setForm({ ...form, hours: e.target.value })}
                />
              </div>

              <div>
                <label>Start Date</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={e => setForm({ ...form, startDate: e.target.value })}
                />
              </div>

              <div>
                <label>End Date</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={e => setForm({ ...form, endDate: e.target.value })}
                />
              </div>

              <div className="full">
                <label>Client Name</label>
                <input
                  value={form.client}
                  onChange={e => setForm({ ...form, client: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-footer">
              {isEdit ? (
                <>
                  <button className="btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button className="btn-primary" onClick={updateProject}>
                    Update
                  </button>
                </>
              ) : (
                <button className="btn-primary" onClick={saveProject}>
                  Save
                </button>
              )}
            </div>
          </div>
      )}

      {/* DELETE CONFIRMATION */}
      {deleteId && (
        <div className="modal-backdrop">
          <div className="confirm-modal">
            <h3>Delete Project?</h3>
            <p>This action cannot be undone.</p>
            <div className="confirm-actions">
              <button onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
