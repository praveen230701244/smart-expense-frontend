export default function Suggestions({ suggestions }) {
  const rows = Array.isArray(suggestions) ? suggestions : [];

  return (
    <section className="rounded-2xl border border-white/40 bg-white/90 p-5 shadow-lg">
      <h3 className="text-lg font-bold text-slate-900">Savings Suggestions</h3>
      <p className="mb-4 text-sm text-slate-600">Actionable budget reductions generated from trends</p>

      {rows.length ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {rows.map((s, idx) => {
            const current = Number(s.currentMonthlyAvg || 0);
            const target = Number(s.suggestedMonthlyBudget || 0);
            const saveAmount = Math.max(0, current - target);
            return (
              <div
                key={`${s.category || idx}`}
                className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-4 transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div className="text-sm font-semibold text-indigo-700">💡 {s.category}</div>
                <div className="mt-1 text-sm text-slate-700">
                  Reduce by <span className="font-bold">{Number(s.recommendedCutPct || 0).toFixed(1)}%</span>
                </div>
                <div className="mt-1 text-sm text-slate-700">
                  Save approx <span className="font-bold">₹{saveAmount.toFixed(2)}</span>
                </div>
                <div className="mt-1 text-xs text-slate-500">Target monthly budget: ₹{target.toFixed(2)}</div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-sm text-slate-500">No suggestions available yet. Upload more data for smarter advice.</div>
      )}
    </section>
  );
}

