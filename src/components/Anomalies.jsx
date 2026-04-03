function severityMeta(severity) {
  const val = Number(severity || 0);
  if (val >= 0.2) return { label: "High", cls: "bg-red-100 text-red-700 border-red-200" };
  if (val >= 0.08) return { label: "Medium", cls: "bg-amber-100 text-amber-700 border-amber-200" };
  return { label: "Low", cls: "bg-sky-100 text-sky-700 border-sky-200" };
}

export default function Anomalies({ anomalies }) {
  const rows = Array.isArray(anomalies) ? anomalies : [];
  return (
    <section className="rounded-2xl border border-white/40 bg-white/90 p-5 shadow-lg">
      <h3 className="text-lg font-bold text-slate-900">Anomalies Detected</h3>
      <p className="mb-4 text-sm text-slate-600">Potentially unusual spending patterns</p>

      {!rows.length ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
          No unusual spending detected 🎉
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((a, idx) => {
            const meta = severityMeta(a.severity);
            return (
              <div
                key={`${a.expenseId || idx}`}
                className="rounded-xl border border-red-100 bg-red-50/40 p-3 transition-all hover:shadow-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-semibold text-slate-900">{a.vendor}</div>
                  <span className={`rounded-full border px-2 py-1 text-xs font-bold ${meta.cls}`}>
                    {meta.label}
                  </span>
                </div>
                <div className="mt-1 text-sm text-slate-700">
                  ₹{Number(a.amount || 0).toFixed(2)} · {a.date} · {a.category}
                </div>
                <div className="mt-1 text-xs text-slate-500">Severity score: {Number(a.severity || 0).toFixed(3)}</div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

