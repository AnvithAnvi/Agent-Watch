const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function getApiKey() {
  return localStorage.getItem("aw_api_key") || import.meta.env.VITE_API_KEY || "";
}

function headers() {
  const key = getApiKey();
  return {
    "Content-Type": "application/json",
    ...(key ? { Authorization: `Bearer ${key}` } : {}),
  };
}

async function request(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: headers(),
    body: body != null ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

export function setApiKey(key) {
  localStorage.setItem("aw_api_key", key);
}

export function clearApiKey() {
  localStorage.removeItem("aw_api_key");
}

export function hasApiKey() {
  return Boolean(getApiKey());
}

// Projects
export const createProject = (name, retention_days = 90) =>
  request("POST", "/projects/", { name, retention_days });

export const getProjects = () => request("GET", "/projects/");

export const deleteProject = (id) => request("DELETE", `/projects/${id}`);

// Runs
export const getRuns = (skip = 0, limit = 50) =>
  request("GET", `/runs/?skip=${skip}&limit=${limit}`);

export const getRun = (id) => request("GET", `/runs/${id}`);

export const getRunSpans = (id) => request("GET", `/runs/${id}/spans`);

export const deleteRun = (id) => request("DELETE", `/runs/${id}`);
