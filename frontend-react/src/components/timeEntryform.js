import React, { useState } from "react";
import { useMsal } from "@azure/msal-react";
import { addTimeEntry } from "../api";

const TimeEntryForm = () => {
  const { instance, accounts } = useMsal();
  const [form, setForm] = useState({
    project: "",
    workstream: "",
    date: "",
    hours: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = await instance.acquireTokenSilent({
      scopes: ["User.Read"],
      account: accounts[0]
    });

    await addTimeEntry(form, token.accessToken);
    alert("Time Entry Added");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="Project" onChange={e => setForm({...form, project: e.target.value})}/>
      <input placeholder="Workstream" onChange={e => setForm({...form, workstream: e.target.value})}/>
      <input type="date" onChange={e => setForm({...form, date: e.target.value})}/>
      <input type="number" placeholder="Hours" onChange={e => setForm({...form, hours: e.target.value})}/>
      <button type="submit">Submit</button>
    </form>
  );
};

export default TimeEntryForm;
