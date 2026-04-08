import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { apiGetExpenses, apiGetInsights, apiReset } from "../services/api";
import ChatPanel from "./ChatPanel.jsx";

function riskColor(score) {
  const s = Number(score || 0);
  if (s >= 70) return { fill: "#ef4444", label: "High" };
  if (s >= 40) return { fill: "#f59e0b", label: "Medium" };
  return { fill: "#22c55e", label: "Low" };
}

function focusEmoji(risk) {
  const s = Number(risk || 0);
  if (s >= 70) return "⚠️";
  if (s >= 40) return "🟡";
  return "✅";
}

function formatINR(n) {
  const x = Number(n || 0);
  return `₹${x.toFixed(2)}`;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState(null);
  const [topInsights, setTopInsights] = useState([]);
  const [resetting, setResetting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [exp, ins] = await Promise.all([apiGetExpenses(), apiGetInsights()]);
      setSummary(exp?.summary || null);
      setTopInsights(Array.isArray(ins?.topInsights) ? ins.topInsights : []);
    } catch (e) {
      setError(e?.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [exp, ins] = await Promise.all([apiGetExpenses(), apiGetInsights()]);
        if (!active) return;
        setSummary(exp?.summary || null);
        setTopInsights(Array.isArray(ins?.topInsights) ? ins.topInsights : []);
      } catch (e) {
        if (!active) return;
        setError(e?.message || "Failed to load dashboard.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const total = Number(summary?.totalExpenses || 0);
  const topCategory = summary?.topCategory?.category || "N/A";
  const topCategoryAmt = Number(summary?.topCategory?.total || 0);
  const risk = Number(summary?.riskScore || 0);
  const riskMeta = riskColor(risk);
  const topPct = total > 0 ? Math.round((topCategoryAmt / total) * 100) : 0;

  const chartData = useMemo(() => {
    const rows = summary?.categoryBreakdown || [];
    return rows.map((r) => ({ category: r.category, amount: Number(r.total || 0) }));
  }, [summary]);

  const pieData = chartData;
  const pieColors = ["#60a5fa", "#34d399", "#f59e0b", "#fb7185", "#a78bfa", "#22c55e", "#38bdf8"];

  const hasData = total > 0 && chartData.length > 0;

  return (
    <div className="mainContentInner">
      <div className="dashHeader">
        <div>
          <div className="dashTitle">Your Financial Dashboard</div>
          <div className="dashSubtitle">Clean insights, personalized advice, no clutter.</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="btn btnSecondary"
            disabled={resetting}
            onClick={async () => {
              setResetting(true);
              setError("");
              try {
                await apiReset();
                setSummary(null);
                setTopInsights([]);
                await load();
              } catch (e) {
                setError(e?.message || "Reset failed.");
              } finally {
                setResetting(false);
              }
            }}
          >
            {resetting ? "Resetting…" : "Reset Data"}
          </button>
        </div>
      </div>

      {error ? <div className="errorBox">{error}</div> : null}
      {loading ? (
        <div className="dashSkeleton">
          <div className="skeletonLine" />
          <div className="skeletonGrid">
            <div className="skeletonCard" />
            <div className="skeletonCard" />
          </div>
          <div className="skeletonCard" style={{ height: 220 }} />
        </div>
      ) : null}

      {!loading && !error && !hasData ? (
        <div className="emptyState">
          <div className="emptyStateTitle">Upload expenses to get insights</div>
          <div className="muted">Add a CSV/PDF or a manual entry to see your overview and AI insights.</div>
        </div>
      ) : null}

      {!loading && !error && hasData ? (
        <div className="dashGrid">
          {/* 1) Focus Insight */}
          <div className="focusInsight card">
            <div className="focusInsightText">
              <span style={{ marginRight: 8 }}>{focusEmoji(risk)}</span>
              You spent <b>{formatINR(topCategoryAmt)}</b> on <b>{topCategory}</b> ({topPct}% of your expenses)
            </div>
            <div className="focusInsightMeta">
              Risk: <b style={{ color: riskMeta.fill }}>{riskMeta.label}</b> ({risk}/100)
            </div>
          </div>

          {/* 2) Charts (bar + pie) */}
          <div className="dashSection">
            <div className="dashCharts">
              <div className="card">
                <div className="dashSectionTitle" style={{ marginTop: 0 }}>📈 Category Spend (Bar)</div>
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                      <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                      <XAxis dataKey="category" tick={{ fill: "rgba(229,231,235,0.85)", fontSize: 12 }} />
                      <YAxis tick={{ fill: "rgba(229,231,235,0.85)", fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          background: "#0f172a",
                          border: "1px solid rgba(255,255,255,0.12)",
                          borderRadius: 12,
                          color: "#e5e7eb",
                        }}
                        labelStyle={{ color: "#e5e7eb" }}
                        formatter={(v) => [formatINR(v), "Amount"]}
                      />
                      <Bar dataKey="amount" radius={[10, 10, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.category === topCategory ? "rgba(245,158,11,0.92)" : "rgba(96,165,250,0.85)"}
                          />
                        ))}
                        <LabelList
                          dataKey="amount"
                          position="top"
                          formatter={(v) => `₹${Number(v).toFixed(0)}`}
                          fill="rgba(229,231,235,0.92)"
                          fontSize={12}
                          fontWeight={900}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card">
                <div className="dashSectionTitle" style={{ marginTop: 0 }}>🧩 Distribution (Pie)</div>
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip
                        contentStyle={{
                          background: "#0f172a",
                          border: "1px solid rgba(255,255,255,0.12)",
                          borderRadius: 12,
                          color: "#e5e7eb",
                        }}
                        formatter={(v, _n, p) => {
                          const pct = Math.round(((Number(v) || 0) / Math.max(1, total)) * 100);
                          return [`${formatINR(v)} (${pct}%)`, p?.payload?.category || "Amount"];
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        wrapperStyle={{ color: "rgba(229,231,235,0.85)", fontWeight: 800, fontSize: 12 }}
                      />
                      <Pie
                        data={pieData}
                        dataKey="amount"
                        nameKey="category"
                        innerRadius={58}
                        outerRadius={95}
                        paddingAngle={2}
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={`p-${index}`}
                            fill={entry.category === topCategory ? "rgba(245,158,11,0.92)" : pieColors[index % pieColors.length]}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* 3) Chatbot */}
          <div className="dashSection">
            <div className="dashSectionTitle">🤖 Chat</div>
            <ChatPanel compact />
          </div>
        </div>
      ) : null}
    </div>
  );
}