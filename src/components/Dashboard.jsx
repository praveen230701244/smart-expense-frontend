import { useEffect, useMemo, useState } from "react";
import { apiGetExpenses } from "../services/api";
import SummaryCards from "./SummaryCards.jsx";
import ForecastChart from "./ForecastChart.jsx";
import Anomalies from "./Anomalies.jsx";
import RiskScore from "./RiskScore.jsx";
import GrowthTrends from "./GrowthTrends.jsx";
import Suggestions from "./Suggestions.jsx";

function SkeletonCards() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-28 animate-pulse rounded-2xl bg-white/70 shadow-lg" />
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState(null);
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await apiGetExpenses();
        if (!active) return;
        setSummary(data?.summary || null);
        setExpenses(Array.isArray(data?.expenses) ? data.expenses : []);
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

  const hasData = useMemo(
    () => expenses.length > 0 && Number(summary?.totalExpenses || 0) > 0,
    [expenses, summary]
  );

  return (
    <div className="space-y-5">
      <section className="rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 p-6 text-white shadow-2xl">
        <h1 className="text-2xl font-extrabold md:text-3xl">AI Expense Intelligence Dashboard</h1>
        <p className="mt-1 text-indigo-100">
          Real-time financial insights powered by ML, anomaly detection, and AI forecasting.
        </p>
      </section>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
      ) : null}

      {loading ? (
        <div className="space-y-4">
          <SkeletonCards />
          <div className="h-72 animate-pulse rounded-2xl bg-white/70 shadow-lg" />
        </div>
      ) : null}

      {!loading && !error && !hasData ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-8 text-center text-slate-600 shadow-lg">
          <div className="text-lg font-semibold text-slate-800">Upload expenses to see insights</div>
          <div className="mt-1">Your AI dashboard will light up with forecasts, risks, anomalies, and savings tips.</div>
        </div>
      ) : null}

      {!loading && !error && hasData ? (
        <div className="animate-[fadein_0.4s_ease-in] space-y-5">
          <SummaryCards summary={summary} />

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <ForecastChart summary={summary} />
            </div>
            <RiskScore score={summary?.riskScore} />
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <GrowthTrends growthTrends={summary?.growthTrends} />
            <Anomalies anomalies={summary?.anomalies} />
          </div>

          <Suggestions suggestions={summary?.savingsSuggestions} />
        </div>
      ) : null}
    </div>
  );
}

