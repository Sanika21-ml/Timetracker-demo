import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL
});

export const getTimeEntries = (token) =>
  API.get("/timeentries", {
    headers: { Authorization: `Bearer ${token}` }
  });

export const addTimeEntry = (data, token) =>
  API.post("/timeentries", data, {
    headers: { Authorization: `Bearer ${token}` }
  });
