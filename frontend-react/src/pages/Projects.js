import React, { useState, useEffect } from "react";
import "../styles/Projects.css";
const EMPTY_PROJECT = {
  id: null,
  name: "",
  type: "",
  status: "",
  hours: "",
  startDate: "",
};
const WORKSTREAM_OPTIONS = [
  "Requirement",
  "Documentation",
  "Design",
  "Code",
  "Test",
  "Deployment",
  "Planning",
  "Delivery",
];
const EMPLOYEE_OPTIONS = [
  "Krushna Lavhare",
  "Rohit Nandan",
  "Wasim Baraskar",
  "Smita Ghune",
];
function Project() {
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(EMPTY_PROJECT);
  const [selectedWorkstreams, setSelectedWorkstreams] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [workstreamSearch, setWorkstreamSearch] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [newWorkstream, setNewWorkstream] = useState("");
  const [workstreamList, setWorkstreamList] = useState(WORKSTREAM_OPTIONS);

    /* ================= FETCH PROJECTS FROM API ================= */
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/api/projects/get",
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();

        // Map backend response to existing UI structure (NO UI CHANGE)
        const mappedProjects = data.map((p) => ({
          id: p.project_id,
          name: p.project_name,
          type: p.project_type,
          status: p.projectStatus_id || "",
          hours: p.estimated_hours,
          startDate: new Date(p.start_date).toLocaleDateString(),
        }));

        setProjects(mappedProjects);
      } catch (error) {
        console.error("❌ Failed to fetch projects:", error);
      }
    };

    fetchProjects();
  }, []);


  /* ================= FORM LOGIC ================= */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const toggleWorkstream = (item) => {
    if (selectedWorkstreams.includes(item)) {
      setSelectedWorkstreams(selectedWorkstreams.filter((w) => w !== item));
    } else {
      setSelectedWorkstreams([...selectedWorkstreams, item]);
    }
  };
  const toggleEmployee = (item) => {
    if (selectedEmployees.includes(item)) {
      setSelectedEmployees(selectedEmployees.filter((e) => e !== item));
    } else {
      setSelectedEmployees([...selectedEmployees, item]);
    }
  };
  const addNewWorkstream = () => {
    if (newWorkstream.trim() !== "") {
      setWorkstreamList([...workstreamList, newWorkstream]);
      setNewWorkstream("");
    }
  };
  const handleSaveProject = () => {
    if (!formData.name || !formData.type) {
      alert("Project Name and Type are required!");
      return;
    }
    const newProject = {
      ...formData,
      id: Date.now(),
      workstreams: selectedWorkstreams,
      employees: selectedEmployees,
    };
    setProjects([...projects, newProject]);
    // Reset everything
    setFormData(EMPTY_PROJECT);
    setSelectedWorkstreams([]);
    setSelectedEmployees([]);
    setShowForm(false);
  };
  const handleCancel = () => {
    setShowForm(false);
  };
  const filteredWorkstreams = workstreamList.filter((w) =>
    w.toLowerCase().includes(workstreamSearch.toLowerCase()),
  );
  const filteredEmployees = EMPLOYEE_OPTIONS.filter((e) =>
    e.toLowerCase().includes(employeeSearch.toLowerCase()),
  );
  /* ================= UI ================= */
  return (
    <div className="projects-page">
      {/* ================= PROJECT LIST PAGE ================= */}
      {!showForm && (
        <>
          <div className="projects-header">
            <div>
              <h2>Projects</h2>
              <p>View and manage projects</p>
            </div>
            <button className="add-btn" onClick={() => setShowForm(true)}>
              + Add Project
            </button>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Est. Hours</th>
                  <th>Start Date</th>
                </tr>
              </thead>
              <tbody>
                {projects.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center" }}>
                      No Projects Added
                    </td>
                  </tr>
                ) : (
                  projects.map((project) => (
                    <tr key={project.id}>
                      <td>{project.name}</td>
                      <td>{project.type}</td>
                      <td>{project.status}</td>
                      <td>{project.hours}Hr</td>
                      <td>{project.startDate}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
      {/* ================= ADD PROJECT FORM ================= */}
      {showForm && (
        <div className="project-form-wrapper">
          <div className="project-form-container">
            <h1 className="form-title">Add New Project</h1>
            <div className="form-grid-4">
              <div className="form-group">
                <label>Project Name *</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter Project Name"
                />
              </div>
              <div className="form-group">
                <label>Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="">Select Type</option>
                  <option value="Client Project">Client Project</option>
                  <option value="Internal Project">Internal Project</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  placeholder="Select Status"
                >
                  <option>In Progress</option>
                  <option>Hold</option>
                  <option>Completed</option>
                </select>
              </div>
              <div className="form-group">
                <label>Client Name</label>
                <input
                  type="text"
                  placeholder="Enter Client Name"
                />
              </div>
              <div className="form-group">
                <label>Estimated Hours</label>
                <input
                  type="number"
                  name="hours"
                  value={formData.hours}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          {/* WORKSTREAM */}
          <div className="assignment-section">
            <div className="assign-card">
              <h3>Assigned Workstreams</h3>
              <div className="assign-box">
                {selectedWorkstreams.map((item, index) => (
                  <span key={index} className="selected-tag">
                    {item}
                  </span>
                ))}
              </div>
              <input
                className="search-input"
                placeholder="Search workstreams..."
                value={workstreamSearch}
                onChange={(e) => setWorkstreamSearch(e.target.value)}
              />
              <div className="tag-container">
                {filteredWorkstreams.map((item, index) => (
                  <span
                    key={index}
                    className="tag"
                    onClick={() => toggleWorkstream(item)}
                  >
                    + {item}
                  </span>
                ))}
              </div>
              <div className="add-new-row">
                <input
                  placeholder="New Workstream"
                  value={newWorkstream}
                  onChange={(e) => setNewWorkstream(e.target.value)}
                />
                <button onClick={addNewWorkstream}>Add</button>
              </div>
            </div>
            {/* EMPLOYEES */}
            <div className="assign-card">
              <h3>Assigned Employees</h3>
              <div className="assign-box">
                {selectedEmployees.map((item, index) => (
                  <span key={index} className="selected-tag">
                    {item}
                  </span>
                ))}
              </div>
              <input
                className="search-input"
                placeholder="Search employees..."
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
              />
              <div className="tag-container">
                {filteredEmployees.map((item, index) => (
                  <span
                    key={index}
                    className="tag"
                    onClick={() => toggleEmployee(item)}
                  >
                    + {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="form-actions">
            <button className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
            <button className="save-btn" onClick={handleSaveProject}>
              Save Project
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
export default Project;