import axios from "axios";

const api = axios.create({
  baseURL: "/api/v1/users", // backend ke routes
  withCredentials: true, // cookies allow
});

export default api;
