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
  project: "",
  workstream: "",
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

  return (
    <div className="user-body">
      <UserSidebar />

      <div className="user-content">
        <div className="timesheet-top">
          <h2>Track Time</h2>

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
                    <td>
                      <select>
                        <option>Select Project</option>
                      </select>
                    </td>

                    <td>
                      <select>
                        <option>Select Workstream</option>
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
          <button className="save-btn">Save</button>
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
