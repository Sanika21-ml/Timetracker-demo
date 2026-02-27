import React, { useState, useEffect, useRef } from "react";
import UserSidebar from "./UserSidebar";
import "../styles/Timesheet.css";
import {
  format,
  startOfWeek,
  addDays,
  subWeeks,
  addWeeks,
} from "date-fns";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const emptyRow = (id) => ({
  id,
  project_id: "",
  workstream: "",
  project_workstream_id: "",
  comment: "",
  hours: ["", "", "", "", "", "", ""],
});

const parseToMinutes = (value) => {
  if (!value) return 0;

  // Only digits or digit:digit allowed
  if (!/^\d{1,2}(:\d{0,2})?$/.test(value)) return 0;

  if (!value.includes(":")) {
    return Number(value) * 60;
  }

  let [h, m = "0"] = value.split(":");
  return Number(h) * 60 + Number(m.padEnd(2, "0"));
};
const hhmmToDecimal = (value) => {
  if (!value) return 0;

  if (!value.includes(":")) {
    return Number(value);
  }

  const [h, m = "0"] = value.split(":");
  return Number(h) + Number(m) / 60;
};
const minutesToHHMM = (mins) => {
  const h = String(Math.floor(mins / 60)).padStart(2, "0");
  const m = String(mins % 60).padStart(2, "0");
  return `${h}:${m}`;
};

const Timesheet = () => {
  const [weekStart, setWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 0 })
  );

  const [rows, setRows] = useState([
    emptyRow(1),
    emptyRow(2),
    emptyRow(3),
  ]);

  // ── Project list fetched from API ──────────────────────────────
  const [projectList, setProjectList] = useState([]);
  // 🔹 Workstreams mapped per row
  const [workstreamsByRow, setWorkstreamsByRow] = useState({});

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/api/projects/get/list",
          { credentials: "include" }
        );

        console.log("👉 Raw response:", response);

        const data = await response.json();
        console.log("✅ Project data received in React:", data);

        setProjectList(data);
      } catch (error) {
        console.error("❌ Error fetching project list:", error);
      }
    };

    fetchProjects();
  }, []);
  // ──────────────────────────────────────────────────────────────
  // 🔹 Fetch workstreams for selected project (row-specific)
  const fetchWorkstreamsByProject = async (rowId, projectId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/workstreams/get/project/${projectId}`,
        { credentials: "include" }
      );

      const data = await response.json();

      setWorkstreamsByRow((prev) => ({
        ...prev,
        [rowId]: data,
      }));
    } catch (error) {
      console.error("❌ Error fetching workstreams:", error);
    }
  };


  const [activeCommentRow, setActiveCommentRow] = useState(null);
  const popupRef = useRef(null);

  const weekDates = Array.from({ length: 7 }).map((_, i) =>
    addDays(weekStart, i)
  );

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setActiveCommentRow(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // ── Update selected project for a row ─────────────────────────
  const updateProject = (rowId, project_id) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === rowId
          ? { ...r, project_id, workstream: "", project_workstream_id: "" }
          : r
      )
    );

    if (project_id) {
      fetchWorkstreamsByProject(rowId, project_id);
    } else {
      setWorkstreamsByRow((prev) => ({ ...prev, [rowId]: [] }));
    }
  };
  // ──────────────────────────────────────────────────────────────

  const updateHours = (rowId, dayIndex, value) => {
    if (!/^\d{0,2}(:?\d{0,2})?$/.test(value)) return;

    setRows((prev) =>
      prev.map((r) =>
        r.id === rowId
          ? {
            ...r,
            hours: r.hours.map((h, i) =>
              i === dayIndex ? value : h
            ),
          }
          : r
      )
    );
  };

  const updateComment = (rowId, value) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === rowId ? { ...r, comment: value } : r
      )
    );
  };

  const rowTotal = (row) =>
    row.hours.reduce((sum, h) => sum + parseToMinutes(h), 0);

  const dayTotal = (index) =>
    rows.reduce((sum, r) => sum + parseToMinutes(r.hours[index]), 0);

  const weekTotal = () =>
    rows.reduce((sum, r) => sum + rowTotal(r), 0);

  // ── SAVE HANDLER ──────────────────────────────────────────────
  const handleSave = async () => {
    const week_start_date = format(weekDates[0], "yyyy-MM-dd");
    const week_end_date = format(weekDates[6], "yyyy-MM-dd");

    const entries = rows
      .filter((row) => row.project_workstream_id)
      .map((row) => ({
        project_workstream_id: row.project_workstream_id,
        weekEntries: DAYS.map((day, i) => ({
          day,
          date: format(weekDates[i], "yyyy-MM-dd"),
          hours: hhmmToDecimal(row.hours[i]),
          comment: row.comment || "",
        })),
      }));

    if (entries.length === 0) {
      alert("Please select a project and workstream before saving.");
      return;
    }
    // ✅ ADD THIS BLOCK (payload)
    const payload = {
      week_start_date,
      week_end_date,
      entries,
    };

    // ✅ ADD THIS LINE (debug)
    console.log("📤 Payload being sent:", payload);


    try {
      const response = await fetch("http://localhost:8080/api/timesheet/weekly", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ entries, week_start_date, week_end_date }),
      });

      const contentType = response.headers.get("content-type");

      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("❌ Non-JSON response:", text);
        throw new Error("Backend did not return JSON");
      }

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to save timesheet.");
        return;
      }

      alert(data.message || "Timesheet saved successfully!");
    } catch (error) {
      console.error("Save error:", error);
      alert("An error occurred while saving. Please try again.");
    }
  };
  // ──────────────────────────────────────────────────────────────

  return (
    <div className="user-body">
      <UserSidebar />

      <div className="user-content">
        <div className="timesheet-top">
          <h2>Time Track</h2>

          {/* WEEK SELECTOR */}
          <div className="week-controls">
            <button
              className="week-arrow"
              onClick={() => setWeekStart(subWeeks(weekStart, 1))}
              aria-label="Previous week"
            >
              ‹
            </button>

            <span className="week-range">
              {format(weekDates[0], "dd MMM")} –{" "}
              {format(weekDates[6], "dd MMM yyyy")}
            </span>

            <button
              className="week-arrow"
              onClick={() => setWeekStart(addWeeks(weekStart, 1))}
              aria-label="Next week"
            >
              ›
            </button>
          </div>
        </div>

        <div className="timesheet-body">
          <div className="timesheet-table-wrapper">
            <table className="timesheet-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Workstream</th>
                  <th>Comment</th>

                  {weekDates.map((d, i) => (
                    <th key={i} className={i === 0 || i === 6 ? "weekend" : ""}>
                      <div>{DAYS[i]}</div>
                      <small>{format(d, "MMM dd")}</small>
                    </th>
                  ))}

                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>

                    {/* ── Project Dropdown (wired to API) ── */}
                    <td>
                      <select
                        value={row.project_id}
                        onChange={(e) => updateProject(row.id, e.target.value)}
                      >
                        <option value="">Select Project</option>
                        {projectList.map((p) => (
                          <option key={p.project_id} value={p.project_id}>
                            {p.project_name}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td>
                      <select
                        value={row.project_workstream_id}
                        onChange={(e) =>
                          setRows((prev) =>
                            prev.map((r) =>
                              r.id === row.id
                                ? { ...r, project_workstream_id: e.target.value }
                                : r
                            )
                          )
                        }
                        disabled={!row.project_id}
                      >
                        <option value="">Select Workstream</option>
                        {(workstreamsByRow[row.id] || []).map((ws) => (
                          <option
                            key={ws.project_workstream_id}
                            value={ws.project_workstream_id}
                          >
                            {ws.workstream_name}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="comment-cell">
                      <span
                        className="comment-icon"
                        onClick={() =>
                          setActiveCommentRow(
                            activeCommentRow === row.id ? null : row.id
                          )
                        }
                      >
                        💬
                      </span>

                      {activeCommentRow === row.id && (
                        <div className="comment-popup" ref={popupRef}>
                          <textarea
                            placeholder="Add comment..."
                            value={row.comment}
                            onChange={(e) =>
                              updateComment(row.id, e.target.value)
                            }
                          />
                          <button
                            className="comment-save-btn"
                            onClick={() => setActiveCommentRow(null)}
                          >
                            Save
                          </button>
                        </div>
                      )}
                    </td>

                    {row.hours.map((h, i) => (
                      <td key={i} className={i === 0 || i === 6 ? "weekend" : ""}>
                        <input
                          type="text"
                          placeholder="00:00"
                          value={h}
                          onChange={(e) =>
                            updateHours(row.id, i, e.target.value)
                          }
                        />
                      </td>
                    ))}

                    <td className="total-cell">
                      {minutesToHHMM(rowTotal(row))}
                    </td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr>
                  <td>
                    <button
                      className="add-entry-btn"
                      onClick={() =>
                        setRows((prev) => [...prev, emptyRow(prev.length + 1)])
                      }
                    >
                      + Add Row
                    </button>
                  </td>

                  <td colSpan={2}>Total</td>

                  {DAYS.map((_, i) => (
                    <td key={i} className="day-total">
                      {minutesToHHMM(dayTotal(i))}
                    </td>
                  ))}

                  <td className="week-total">
                    {minutesToHHMM(weekTotal())}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="timesheet-actions">
          <button className="save-btn" onClick={handleSave}>Save</button>
          <button
            className="reset-btn"
            onClick={() =>
              setRows([emptyRow(1), emptyRow(2), emptyRow(3)])
            }
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};
export default Timesheet;