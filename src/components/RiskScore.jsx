function riskMeta(score) {
  if (score <= 40) return { color: "bg-emerald-500", label: "Low Risk", text: "text-emerald-700" };
  if (score <= 70) return { color: "bg-amber-500", label: "Moderate Risk", text: "text-amber-700" };
  return { color: "bg-red-500", label: "High Risk", text: "text-red-700" };
}

export default function RiskScore({ score }) {
  const safe = Math.max(0, Math.min(100, Number(score || 0)));
  const meta = riskMeta(safe);

  return (
    <section className="rounded-2xl border border-white/40 bg-white/90 p-5 shadow-lg">
      <h3 className="text-lg font-bold text-slate-900">Risk Score</h3>
      <p className="mb-4 text-sm text-slate-600">AI-driven overspending risk indicator</p>
      <div className="text-3xl font-extrabold text-slate-900">{safe}/100</div>
      <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full ${meta.color} transition-all duration-500`} style={{ width: `${safe}%` }} />
      </div>
      <div className={`mt-2 text-sm font-semibold ${meta.text}`}>{meta.label}</div>
    </section>
  );
}

