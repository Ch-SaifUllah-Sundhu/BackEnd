const API_URL = "http://localhost:5000/api/v1";

// Helper function for requests
export async function apiRequest(endpoint, method = "GET", body, token) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // ✅ cookies ke liye
  };
  if (body) options.body = JSON.stringify(body);
  if (token) options.headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${endpoint}`, options);
  return res.json();
}
