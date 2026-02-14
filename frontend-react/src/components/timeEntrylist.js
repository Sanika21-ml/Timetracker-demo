import React, { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { getTimeEntries } from "../api";

const TimeEntryList = () => {
  const { instance, accounts } = useMsal();
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = await instance.acquireTokenSilent({
        scopes: ["User.Read"],
        account: accounts[0]
      });

      const res = await getTimeEntries(token.accessToken);
      setEntries(res.data);
    };

    fetchData();
  }, []);

  return (
    <table border="1">
      <thead>
        <tr>
          <th>Project</th>
          <th>Workstream</th>
          <th>Date</th>
          <th>Hours</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((e, i) => (
          <tr key={i}>
            <td>{e.project}</td>
            <td>{e.workstream}</td>
            <td>{e.date}</td>
            <td>{e.hours}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TimeEntryList;
