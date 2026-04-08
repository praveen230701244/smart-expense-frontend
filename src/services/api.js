const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://skill-gap-backend-goi5.onrender.com";

console.log("API BASE:", API_BASE_URL);

async function parseJsonSafe(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

export async function apiGetExpenses() {
  const res = await fetch(`${API_BASE_URL}/expenses`);
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    throw new Error(data?.error || "Failed to fetch /expenses");
  }
  return data;
}

export async function apiGetInsights() {
  const res = await fetch(`${API_BASE_URL}/insights`);
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    throw new Error(data?.error || "Failed to fetch /insights");
  }
  return data;
}

export async function apiUploadCsv(file) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE_URL}/upload/csv`, { method: "POST", body: form });
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    throw new Error(data?.error || "CSV upload failed");
  }
  return data;
}

export async function apiUploadPdf(file) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE_URL}/upload/pdf`, { method: "POST", body: form });
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    throw new Error(data?.error || "PDF upload failed");
  }
  return data;
}

export async function apiUploadManual(payload) {
  const res = await fetch(`${API_BASE_URL}/upload/manual`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    throw new Error(data?.error || "Manual upload failed");
  }
  return data;
}

export async function apiChat(message) {
  const res = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message })
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    throw new Error(data?.error || "Chat request failed");
  }
  return data;
}

export async function apiReset() {
  const res = await fetch(`${API_BASE_URL}/reset`, { method: "DELETE" });
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    throw new Error(data?.error || "Reset failed");
  }
  return data;
}

