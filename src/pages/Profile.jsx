import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiGetProfile, apiSaveProfile } from "../services/api.js";

const defaultForm = {
  monthly_income: "",
  fixed_expenses: "",
  savings_goal: "",
  risk_level: "medium",
  financial_goal: "",
  goals: "",
  lifestyle: "",
  currency: "INR",
};

export default function Profile() {
  const navigate = useNavigate();
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await apiGetProfile();
        if (!mounted) return;
        const profile = res?.profile || {};
        setForm({
          monthly_income: String(profile.monthly_income ?? profile.income ?? ""),
          fixed_expenses: String(profile.fixed_expenses ?? ""),
          savings_goal: String(profile.savings_goal ?? ""),
          risk_level: profile.risk_level || "medium",
          financial_goal: profile.financial_goal || "",
          goals: profile.goals || profile.financial_goal || "",
          lifestyle: profile.lifestyle || "",
          currency: profile.currency || "INR",
        });
      } catch (e) {
        if (mounted) setError(e?.message || "Failed to load profile");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  function validate(payload) {
    if (Number(payload.monthly_income) <= 0) return "Monthly income must be greater than 0";
    if (Number(payload.fixed_expenses) < 0) return "Fixed expenses cannot be negative";
    if (Number(payload.savings_goal) < 0) return "Savings goal cannot be negative";
    return "";
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const goalsText = (form.goals || form.financial_goal || "").trim();
    const payload = {
      monthly_income: Number(form.monthly_income),
      fixed_expenses: Number(form.fixed_expenses),
      savings_goal: Number(form.savings_goal),
      risk_level: form.risk_level,
      financial_goal: goalsText,
      goals: goalsText,
      lifestyle: (form.lifestyle || "").trim(),
      currency: form.currency || "INR",
    };
    const validationError = validate(payload);
    if (validationError) {
      setError(validationError);
      return;
    }
    setSaving(true);
    try {
      await apiSaveProfile(payload);
      setSuccess("Profile saved successfully");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mainContentInner">
        <div className="muted">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="mainContentInner">
      <div className="dashTitle" style={{ marginBottom: 10 }}>
        Profile setup
      </div>
      <div className="dashSubtitle" style={{ marginBottom: 16 }}>
        Tell us about your income and goals — the dashboard uses this for budget comparison and AI tips.
      </div>
      {error ? <div className="errorBox">{error}</div> : null}
      {success ? <div className="toast">{success}</div> : null}
      <form onSubmit={onSubmit} className="card" style={{ display: "grid", gap: 12 }}>
        <div className="formRow">
          <label>
            Monthly income
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.monthly_income}
              onChange={(e) => setForm((p) => ({ ...p, monthly_income: e.target.value }))}
              required
            />
          </label>
          <label>
            Fixed expenses
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.fixed_expenses}
              onChange={(e) => setForm((p) => ({ ...p, fixed_expenses: e.target.value }))}
              required
            />
          </label>
        </div>
        <div className="formRow">
          <label>
            Savings goal (monthly)
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.savings_goal}
              onChange={(e) => setForm((p) => ({ ...p, savings_goal: e.target.value }))}
              required
            />
          </label>
          <label>
            Risk level
            <select
              value={form.risk_level}
              onChange={(e) => setForm((p) => ({ ...p, risk_level: e.target.value }))}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
        </div>
        <label>
          Goals & priorities
          <input
            type="text"
            value={form.goals}
            onChange={(e) => setForm((p) => ({ ...p, goals: e.target.value }))}
            placeholder="e.g. Emergency fund, trip, debt payoff"
          />
        </label>
        <label>
          Lifestyle (optional)
          <input
            type="text"
            value={form.lifestyle}
            onChange={(e) => setForm((p) => ({ ...p, lifestyle: e.target.value }))}
            placeholder="e.g. Urban, single, remote work"
          />
        </label>
        <button type="submit" className="btn" disabled={saving}>
          {saving ? "Saving..." : "Save & go to dashboard"}
        </button>
      </form>
    </div>
  );
}
