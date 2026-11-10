import axios from "axios";

// For same-origin Pages API endpoints; Supabase requests use its own SDK.
export const httpClient = axios.create({
  baseURL: "/api",
  timeout: 15_000,
  headers: { Accept: "application/json" },
});
