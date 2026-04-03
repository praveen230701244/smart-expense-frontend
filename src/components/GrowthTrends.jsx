export default function GrowthTrends({ growthTrends }) {
  const rows = Array.isArray(growthTrends)
    ? growthTrends
    : growthTrends?.fastestGrowingCategory
      ? [growthTrends.fastestGrowingCategory]
      : [];
  const mom = Number(growthTrends?.monthOverMonthGrowthPct || 0);

  return (
    <section className="rounded-2xl border border-white/40 bg-white/90 p-5 shadow-lg">
      <h3 className="text-lg font-bold text-slate-900">Growth Trends</h3>
      <p className="mb-4 text-sm text-slate-600">Fastest increasing categories and MoM changes</p>

      <div className="mb-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
        Month-over-month growth: <span className="font-bold">{mom.toFixed(2)}%</span>
      </div>

      {rows.length ? (
        <div className="space-y-2">
          {rows.slice(0, 4).map((r, idx) => (
            <div key={`${r.category || idx}`} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
              <span className="font-medium text-slate-800">{r.category || "Unknown"}</span>
              <span className="font-bold text-emerald-600">↑ {Number(r.growthPct || 0).toFixed(2)}%</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-slate-500">No growth trend data available yet.</div>
      )}
    </section>
  );
}

