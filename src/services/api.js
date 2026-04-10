import { auth, authDisabled } from "../firebase";

const API_BASE_URL = import.meta.env.VITE_API_URL;

async function authHeaders() {
  if (authDisabled) return {};
  if (!auth?.currentUser) return {};
  try {
    const t = await auth.currentUser.getIdToken();
    return t ? { Authorization: `Bearer ${t}` } : {};
  } catch {
    return {};
  }
}

async function parseJsonSafe(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

async function fetchWithAuth(url, options = {}) {
  const headers = {
    ...(options.headers || {}),
    ...(await authHeaders()),
  };
  return fetch(url, { ...options, headers });
}

export async function apiGetExpenses() {
  const res = await fetchWithAuth(`${API_BASE_URL}/expenses`);
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    throw new Error(data?.error || "Failed to fetch /expenses");
  }
  return data;
}

export async function apiGetInsights() {
  const res = await fetchWithAuth(`${API_BASE_URL}/insights`);
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    throw new Error(data?.error || "Failed to fetch /insights");
  }
  return data;
}

export async function apiUploadCsv(file) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetchWithAuth(`${API_BASE_URL}/upload/csv`, { method: "POST", body: form });
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    throw new Error(data?.error || "CSV upload failed");
  }
  return data;
}

export async function apiUploadPdf(file) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetchWithAuth(`${API_BASE_URL}/upload/pdf`, { method: "POST", body: form });
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    throw new Error(data?.error || "PDF upload failed");
  }
  return data;
}

export async function apiUploadImage(file) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetchWithAuth(`${API_BASE_URL}/upload/image`, { method: "POST", body: form });
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    throw new Error(data?.error || "Image upload failed");
  }
  return data;
}

export async function apiUploadManual(payload) {
  const res = await fetchWithAuth(`${API_BASE_URL}/upload/manual`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    throw new Error(data?.error || "Manual upload failed");
  }
  return data;
}

export async function apiChat(message) {
  const res = await fetchWithAuth(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    throw new Error(data?.error || "Chat request failed");
  }
  return data;
}

export async function apiReset() {
  const res = await fetchWithAuth(`${API_BASE_URL}/reset`, { method: "DELETE" });
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    throw new Error(data?.error || "Reset failed");
  }
  return data;
}

export async function apiCreateGoal(payload) {
  const res = await fetchWithAuth(`${API_BASE_URL}/goals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(data?.error || "Goal save failed");
  return data;
}

export async function apiListGoals() {
  const res = await fetchWithAuth(`${API_BASE_URL}/goals`);
  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(data?.error || "Goals load failed");
  return data;
}

export async function apiPatchExpenseCategory(expenseId, category) {
  const res = await fetchWithAuth(`${API_BASE_URL}/expenses/${expenseId}/category`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category }),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(data?.error || "Category update failed");
  return data;
}

export async function apiFeedbackCategory(vendor, category) {
  const res = await fetchWithAuth(`${API_BASE_URL}/feedback/category`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vendor, category }),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(data?.error || "Feedback failed");
  return data;
}

export async function apiWhatIf(cuts) {
  const res = await fetchWithAuth(`${API_BASE_URL}/simulate/what-if`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cuts }),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(data?.error || "Simulation failed");
  return data;
}

export async function apiBudgetSim(caps) {
  const res = await fetchWithAuth(`${API_BASE_URL}/simulate/budget`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ caps }),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(data?.error || "Budget simulation failed");
  return data;
}
