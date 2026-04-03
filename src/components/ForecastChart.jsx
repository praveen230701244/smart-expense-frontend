import {
  Area,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function buildChartData(summary) {
  const trend = Array.isArray(summary?.monthlyTrend) ? summary.monthlyTrend : [];
  const prediction = summary?.prediction;

  const rows = trend.map((t) => ({
    month: t.month,
    actual: Number(t.total || 0),
    forecast: Number(t.total || 0),
    lower: Number(t.total || 0),
    upper: Number(t.total || 0),
  }));

  if (prediction?.nextMonth) {
    rows.push({
      month: prediction.nextMonth,
      actual: null,
      forecast: Number(prediction.predictedTotal || 0),
      lower: Number(prediction?.confidenceInterval?.lower ?? prediction.predictedTotal ?? 0),
      upper: Number(prediction?.confidenceInterval?.upper ?? prediction.predictedTotal ?? 0),
    });
  }

  return rows;
}

export default function ForecastChart({ summary }) {
  const data = buildChartData(summary);
  return (
    <section className="rounded-2xl border border-white/40 bg-white/90 p-5 shadow-lg">
      <h3 className="text-lg font-bold text-slate-900">Forecast vs Historical Trend</h3>
      <p className="mb-4 text-sm text-slate-600">Monthly spending with prediction confidence interval</p>

      <div className="h-80 w-full">
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 12 }} />
            <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="upper"
              stroke="transparent"
              fill="#c7d2fe"
              fillOpacity={0.4}
              name="Upper CI"
            />
            <Area
              type="monotone"
              dataKey="lower"
              stroke="transparent"
              fill="#ffffff"
              fillOpacity={1}
              name="Lower CI"
            />
            <Line type="monotone" dataKey="actual" stroke="#0ea5e9" strokeWidth={3} dot={false} name="Historical" />
            <Line type="monotone" dataKey="forecast" stroke="#6366f1" strokeWidth={3} strokeDasharray="5 5" name="Forecast" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

