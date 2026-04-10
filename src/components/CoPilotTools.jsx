import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import {
  apiBudgetSim,
  apiCreateGoal,
  apiListGoals,
  apiPatchExpenseCategory,
  apiWhatIf,
} from "../services/api";

const CATEGORY_OPTIONS = [
  "Food",
  "Shopping",
  "Transport",
  "Utilities",
  "Subscriptions",
  "Health",
  "Travel",
  "Electronics",
  "Others",
];

function formatINR(n) {
  const x = Number(n || 0);
  return `₹${x.toFixed(0)}`;
}

export default function CoPilotTools({ summary, expenses, onDataChanged }) {
  const [goals, setGoals] = useState([]);
  const [goalTitle, setGoalTitle] = useState("Emergency fund");
  const [goalAmt, setGoalAmt] = useState("5000");
  const [whatIfCat, setWhatIfCat] = useState("");
  const [whatIfPct, setWhatIfPct] = useState("15");
  const [whatIfResult, setWhatIfResult] = useState(null);
  const [budgetCat, setBudgetCat] = useState("");
  const [budgetCap, setBudgetCap] = useState("");
  const [budgetResult, setBudgetResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const behavior = summary?.spendingBehavior || {};
  const engine = summary?.insightsEngine || {};
  const weekendData = useMemo(() => {
    const w = engine.weekendVsWeekday || {};
    return [
      { name: "Weekend", pct: Number(w.weekendSpendPct || 0) },
      { name: "Weekday", pct: Number(w.weekdaySpendPct || 0) },
    ];
  }, [engine]);

  const categoryChoices = useMemo(() => {
    const rows = summary?.categoryBreakdown || [];
    const names = rows.map((r) => r.category).filter(Boolean);
    const set = new Set([...names, ...CATEGORY_OPTIONS]);
    return Array.from(set);
  }, [summary]);

  useEffect(() => {
    let on = true;
    (async () => {
      try {
        const g = await apiListGoals();
        if (on) setGoals(g?.goals || []);
      } catch {
        if (on) setGoals([]);
      }
    })();
    return () => {
      on = false;
    };
  }, []);

  const subs = behavior.subscriptionCandidates || engine.subscriptionCandidates || [];

  return (
    <div className="coPilotTools">
      {err ? <div className="errorBox" style={{ marginBottom: 10 }}>{err}</div> : null}

      <div className="coPilotGrid">
        <div className="card coPilotCard">
          <div className="dashSectionTitle" style={{ marginTop: 0 }}>
            Financial goal
          </div>
          <p className="muted" style={{ marginTop: 0, fontSize: 13 }}>
            Example: save ₹5,000/month — stored for the AI advisor context.
          </p>
          <div className="formRow">
            <label>
              Title
              <input value={goalTitle} onChange={(e) => setGoalTitle(e.target.value)} />
            </label>
            <label>
              Monthly save (₹)
              <input value={goalAmt} onChange={(e) => setGoalAmt(e.target.value)} type="number" min="1" />
            </label>
          </div>
          <button
            type="button"
            className="btn"
            disabled={busy}
            onClick={async () => {
              setErr("");
              setBusy(true);
              try {
                const v = Number(goalAmt);
                if (!v || v <= 0) throw new Error("Enter a positive amount.");
                await apiCreateGoal({ title: goalTitle, targetMonthlySave: v });
                const g = await apiListGoals();
                setGoals(g?.goals || []);
              } catch (e) {
                setErr(e?.message || "Goal failed");
              } finally {
                setBusy(false);
              }
            }}
          >
            Save goal
          </button>
          {goals.length ? (
            <ul className="goalList">
              {goals.slice(0, 4).map((g) => (
                <li key={g.id}>
                  <b>{g.title || "Goal"}</b> · {formatINR(g.target_monthly_save || g.targetMonthlySave)}/mo
                </li>
              ))}
            </ul>
          ) : (
            <div className="muted" style={{ marginTop: 10, fontSize: 13 }}>
              No active goals yet.
            </div>
          )}
        </div>

        <div className="card coPilotCard">
          <div className="dashSectionTitle" style={{ marginTop: 0 }}>
            What-if cuts
          </div>
          <p className="muted" style={{ marginTop: 0, fontSize: 13 }}>
            Reduce a category by % → estimated monthly savings.
          </p>
          <div className="formRow">
            <label>
              Category
              <select value={whatIfCat} onChange={(e) => setWhatIfCat(e.target.value)}>
                <option value="">Select…</option>
                {categoryChoices.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Cut %
              <input type="number" min="1" max="90" value={whatIfPct} onChange={(e) => setWhatIfPct(e.target.value)} />
            </label>
          </div>
          <button
            type="button"
            className="btnSecondary"
            disabled={busy || !whatIfCat}
            onClick={async () => {
              setErr("");
              setBusy(true);
              try {
                const p = Number(whatIfPct);
                const r = await apiWhatIf({ [whatIfCat]: p });
                setWhatIfResult(r);
              } catch (e) {
                setErr(e?.message || "What-if failed");
              } finally {
                setBusy(false);
              }
            }}
          >
            Run simulation
          </button>
          {whatIfResult?.estimatedMonthlySavings != null ? (
            <div style={{ marginTop: 12, fontWeight: 800 }}>
              ≈ {formatINR(whatIfResult.estimatedMonthlySavings)}/mo potential savings
            </div>
          ) : null}
        </div>

        <div className="card coPilotCard">
          <div className="dashSectionTitle" style={{ marginTop: 0 }}>
            Budget simulator
          </div>
          <p className="muted" style={{ marginTop: 0, fontSize: 13 }}>
            Cap monthly spend per category vs your historical average.
          </p>
          <div className="formRow">
            <label>
              Category
              <select value={budgetCat} onChange={(e) => setBudgetCat(e.target.value)}>
                <option value="">Select…</option>
                {categoryChoices.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Monthly cap (₹)
              <input type="number" min="0" value={budgetCap} onChange={(e) => setBudgetCap(e.target.value)} />
            </label>
          </div>
          <button
            type="button"
            className="btnSecondary"
            disabled={busy || !budgetCat || budgetCap === ""}
            onClick={async () => {
              setErr("");
              setBusy(true);
              try {
                const c = Number(budgetCap);
                const r = await apiBudgetSim({ [budgetCat]: c });
                setBudgetResult(r);
              } catch (e) {
                setErr(e?.message || "Budget sim failed");
              } finally {
                setBusy(false);
              }
            }}
          >
            Compare to average
          </button>
          {budgetResult?.totalMonthlyOverspend != null ? (
            <div style={{ marginTop: 12, fontWeight: 800 }}>
              Overspend vs cap: {formatINR(budgetResult.totalMonthlyOverspend)}/mo
            </div>
          ) : null}
        </div>
      </div>

      <div className="coPilotGrid" style={{ marginTop: 14 }}>
        <div className="card coPilotCard">
          <div className="dashSectionTitle" style={{ marginTop: 0 }}>
            Weekend vs weekday
          </div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekendData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "rgba(229,231,235,0.85)", fontSize: 12 }} />
                <YAxis tick={{ fill: "rgba(229,231,235,0.85)", fontSize: 11 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 12,
                    color: "#e5e7eb",
                  }}
                  formatter={(v) => [`${Number(v).toFixed(1)}%`, "Share"]}
                />
                <Bar dataKey="pct" fill="rgba(96,165,250,0.85)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card coPilotCard">
          <div className="dashSectionTitle" style={{ marginTop: 0 }}>
            Subscription signals
          </div>
          {subs.length ? (
            <ul className="subList">
              {subs.slice(0, 6).map((s, i) => (
                <li key={i}>
                  <b>{s.vendor}</b> · ~{formatINR(s.avgAmount)} · {s.occurrences}× · ~{s.avgGapDays}d gap
                </li>
              ))}
            </ul>
          ) : (
            <div className="muted" style={{ fontSize: 13 }}>
              No strong recurring patterns detected yet (needs a few similar monthly charges).
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="dashSectionTitle" style={{ marginTop: 0 }}>
          Teach the model (recent rows)
        </div>
        <p className="muted" style={{ marginTop: 0, fontSize: 13 }}>
          Correct a category — we save vendor → category for your next import.
        </p>
        <div className="expenseFixTableWrap">
          <table className="expenseFixTable">
            <thead>
              <tr>
                <th>Date</th>
                <th>Vendor</th>
                <th>Amount</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              {(expenses || []).slice(0, 12).map((e) => (
                <tr key={`${e.id}-${e.category}`}>
                  <td>{e.date}</td>
                  <td>{e.vendor}</td>
                  <td>{formatINR(e.amount)}</td>
                  <td>
                    <select
                      className="catSelect"
                      defaultValue={e.category || "Others"}
                      onChange={async (ev) => {
                        const cat = ev.target.value;
                        setErr("");
                        try {
                          await apiPatchExpenseCategory(e.id, cat);
                          onDataChanged?.();
                        } catch (ex) {
                          setErr(ex?.message || "Update failed");
                        }
                      }}
                    >
                      {categoryChoices.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
