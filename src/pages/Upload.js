import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiUploadCsv, apiUploadManual, apiUploadPdf } from "../services/api";

export default function Upload() {
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [manual, setManual] = useState({
    amount: "",
    category: "",
    date: "",
    vendor: "",
  });

  const uploadFile = async (file) => {
    if (!file) return;
    setError("");
    setMessage("");
    setBusy(true);
    try {
      const name = file.name.toLowerCase();
      if (name.endsWith(".csv")) {
        await apiUploadCsv(file);
      } else if (name.endsWith(".pdf")) {
        await apiUploadPdf(file);
      } else {
        throw new Error("Unsupported file type. Upload CSV or PDF.");
      }

      setMessage("Upload successful. Redirecting to dashboard...");
      setTimeout(() => navigate("/dashboard"), 600);
    } catch (e) {
      setError(e?.message || "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    uploadFile(file);
  };

  const onSubmitManual = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    try {
      const payload = {
        amount: Number(manual.amount),
        category: manual.category?.trim() || undefined,
        date: manual.date,
        vendor: manual.vendor?.trim() || undefined,
      };

      if (!payload.amount || payload.amount <= 0) throw new Error("Amount must be a positive number.");
      if (!payload.date) throw new Error("Date is required.");

      await apiUploadManual(payload);
      setMessage("Saved manual expense. Redirecting to dashboard...");
      setTimeout(() => navigate("/dashboard"), 600);
    } catch (e) {
      setError(e?.message || "Manual entry failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mainContentInner">
      <h1>Upload</h1>
      <div className="grid2">
        <div>
          <div
            className="dropZone"
            style={{ outline: dragActive ? "2px solid rgba(96,165,250,0.9)" : "none" }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={onDrop}
          >
            <div style={{ fontWeight: 900, fontSize: 16 }}>Drag & drop CSV or PDF</div>
            <div className="muted">
              Or click to select a file. We’ll extract expenses and add them to your dashboard.
            </div>

            <input
              type="file"
              accept=".csv,.pdf"
              disabled={busy}
              onChange={(e) => uploadFile(e.target.files?.[0])}
              style={{ marginTop: 6 }}
            />

            {busy ? <div className="muted">Processing...</div> : null}
          </div>

          {error ? <div className="errorBox" style={{ marginTop: 12 }}>{error}</div> : null}
          {message ? <div className="muted" style={{ marginTop: 10, fontWeight: 800 }}>{message}</div> : null}
        </div>

        <div>
          <div className="card" style={{ padding: 18 }}>
            <div className="cardTitle" style={{ marginBottom: 14 }}>Manual Entry</div>
            <form onSubmit={onSubmitManual}>
              <div className="formRow">
                <label>
                  Amount
                  <input
                    type="number"
                    value={manual.amount}
                    step="0.01"
                    onChange={(e) => setManual((m) => ({ ...m, amount: e.target.value }))}
                  />
                </label>
                <label>
                  Date
                  <input
                    type="date"
                    value={manual.date}
                    onChange={(e) => setManual((m) => ({ ...m, date: e.target.value }))}
                  />
                </label>
              </div>

              <div style={{ height: 10 }} />

              <div className="formRow">
                <label>
                  Category (optional)
                  <input
                    type="text"
                    value={manual.category}
                    onChange={(e) => setManual((m) => ({ ...m, category: e.target.value }))}
                    placeholder="e.g., Food & Drinks"
                  />
                </label>
                <label>
                  Vendor (optional)
                  <input
                    type="text"
                    value={manual.vendor}
                    onChange={(e) => setManual((m) => ({ ...m, vendor: e.target.value }))}
                    placeholder="e.g., Starbucks"
                  />
                </label>
              </div>

              <div style={{ height: 14 }} />
              <button className="btn" type="submit" disabled={busy}>
                {busy ? "Saving..." : "Save Expense"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

