
import React from "react";
import TimeEntryForm from "./timeEntryform";
import TimeEntryList from "./timeEntrylist";

const Dashboard = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h2>Dashboard</h2>
      <TimeEntryForm />
      <TimeEntryList />
    </div>
  );
};

export default Dashboard;
