import { useState } from "react";
import "../styles/Workstreams.css";
import { FiEdit2, FiTrash2, FiSearch } from "react-icons/fi";

const Workstreams = () => {
  const [workstreams, setWorkstreams] = useState([
    { id: 1, name: "Requirement", hours: "80h" },
    { id: 2, name: "Documentation", hours: "60h" },
    { id: 3, name: "Design", hours: "100h" },
    { id: 4, name: "Code", hours: "250h" },
    { id: 5, name: "Test", hours: "80h" },
    { id: 6, name: "Deployment", hours: "30h" },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({ name: "", hours: "" });

  const filteredWorkstreams = workstreams.filter((ws) =>
    ws.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: "", hours: "" });
    setShowFormModal(true);
  };

  const openEditModal = (ws) => {
    setEditingId(ws.id);
    setFormData({ name: ws.name, hours: ws.hours });
    setShowFormModal(true);
  };

  const saveWorkstream = () => {
    if (!formData.name.trim()) return;

    if (editingId) {
      setWorkstreams((prev) =>
        prev.map((ws) =>
          ws.id === editingId ? { ...ws, ...formData } : ws
        )
      );
    } else {
      setWorkstreams((prev) => [
        ...prev,
        { id: Date.now(), ...formData },
      ]);
    }

    setShowFormModal(false);
  };

  const confirmDelete = () => {
    setWorkstreams((prev) => prev.filter((ws) => ws.id !== deletingId));
    setShowDeleteModal(false);
  };

  return (
    <div className="workstreams-page">
      {/* HEADER */}
      <div className="workstreams-header">
        <div>
          <h2>Workstreams</h2>
          <p>View and manage workstreams</p>
        </div>

        <div className="workstreams-actions">
         <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              className="search-input"
              placeholder="Search workstream"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button className="add-workstream-btn" onClick={openAddModal}>
            + Add Workstream
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="workstreams-card">
        <table className="workstreams-table">
          <thead>
            <tr>
              <th>Workstream Name</th>
              <th>Est. Hours</th>
              <th className="actions-col">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredWorkstreams.map((ws) => (
              <tr key={ws.id}>
                <td className="ws-name">{ws.name}</td>
                <td>{ws.hours}</td>

                {/* ✅ UPDATED ACTION ICONS */}
                <td className="actions">
                  <FiEdit2
                    className="action-icon edit"
                    onClick={() => openEditModal(ws)}
                  />
                  <FiTrash2
                    className="action-icon delete"
                    onClick={() => {
                      setDeletingId(ws.id);
                      setShowDeleteModal(true);
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD / EDIT MODAL */}
      {showFormModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingId ? "Edit Workstream" : "Add New Workstream"}</h3>
              <span className="close" onClick={() => setShowFormModal(false)}>
                ×
              </span>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Workstream Name *</label>
                <input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Estimated Hours</label>
                <input
                  value={formData.hours}
                  onChange={(e) =>
                    setFormData({ ...formData, hours: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setShowFormModal(false)}
              >
                Cancel
              </button>
              <button className="confirm-btn" onClick={saveWorkstream}>
                {editingId ? "Update" : "+ Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <h3>Delete Workstream?</h3>
            <p>This action cannot be undone.</p>

            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button className="delete-confirm-btn" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workstreams;
