const cardBase =
  "rounded-2xl bg-white/90 p-5 shadow-lg backdrop-blur-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-xl";

function InfoCard({ title, value, helper, accent }) {
  return (
    <div className={`${cardBase} border ${accent}`}>
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </div>
      <div className="mt-2 text-2xl font-extrabold text-slate-900">{value}</div>
      {helper ? <div className="mt-1 text-sm text-slate-600">{helper}</div> : null}
    </div>
  );
}

export default function SummaryCards({ summary }) {
  const total = Number(summary?.totalExpenses || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
  const topCategory = summary?.topCategory?.category || "N/A";
  const topAmount = Number(summary?.topCategory?.total || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
  const predicted = summary?.prediction
    ? Number(summary.prediction.predictedTotal || 0).toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      })
    : "Insufficient data";
  const risk = Number(summary?.riskScore || 0);

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <InfoCard title="Total Expenses" value={total} helper="Across all tracked months" accent="border-sky-100" />
      <InfoCard title="Top Category" value={topCategory} helper={topAmount} accent="border-violet-100" />
      <InfoCard title="Predicted Next Month" value={predicted} helper={summary?.prediction?.nextMonth || ""} accent="border-indigo-100" />
      <InfoCard title="Risk Score" value={`${risk}/100`} helper="Dynamic overspending risk" accent="border-rose-100" />
    </section>
  );
}

