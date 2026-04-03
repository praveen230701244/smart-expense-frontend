import { useEffect, useMemo, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

import Card from "../components/Card";
import { apiGetExpenses } from "../services/api";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const palette = ["#60a5fa", "#34d399", "#f59e0b", "#fb7185", "#a78bfa", "#22c55e", "#38bdf8"];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await apiGetExpenses();
        if (!mounted) return;
        setSummary(data?.summary || null);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "Failed to load dashboard data.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const pieChart = useMemo(() => {
    const breakdown = summary?.categoryBreakdown || [];
    const labels = breakdown.map((x) => x.category);
    const values = breakdown.map((x) => x.total);

    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: labels.map((_, i) => palette[i % palette.length]),
        },
      ],
    };
  }, [summary]);

  const barChart = useMemo(() => {
    const trend = summary?.monthlyTrend || [];
    const labels = trend.map((x) => x.month);
    const values = trend.map((x) => x.total);

    return {
      labels,
      datasets: [
        {
          label: "Spending",
          data: values,
          backgroundColor: palette[0],
        },
      ],
    };
  }, [summary]);

  return (
    <div className="mainContentInner">
      <h1>Dashboard</h1>
      {error ? <div className="errorBox">{error}</div> : null}
      {loading ? <div className="muted">Loading...</div> : null}

      {!loading && !error && summary ? (
        <>
          <div className="grid3">
            <Card title="Total Spend">
              <div style={{ fontSize: 28, fontWeight: 900 }}>
                ${Number(summary.totalExpenses || 0).toFixed(2)}
              </div>
            </Card>

            <Card title="Top Category">
              <div style={{ fontSize: 18, fontWeight: 900 }}>
                {summary.topCategory?.category || "N/A"}
              </div>
              <div className="muted" style={{ marginTop: 6, fontWeight: 800 }}>
                ${Number(summary.topCategory?.total || 0).toFixed(2)}
              </div>
            </Card>

            <Card title="Next Month Prediction">
              {summary.prediction ? (
                <>
                  <div style={{ fontSize: 16, fontWeight: 900 }}>
                    {summary.prediction.nextMonth}
                  </div>
                  <div className="muted" style={{ marginTop: 6, fontWeight: 800 }}>
                    Predicted: ${Number(summary.prediction.predictedTotal || 0).toFixed(2)}
                  </div>
                </>
              ) : (
                <div className="muted" style={{ fontWeight: 800 }}>
                  Need at least 2 months of data.
                </div>
              )}
            </Card>
          </div>

          <div className="chartRow">
            <Card title="Category-wise Breakdown">
              <div style={{ maxWidth: 520, margin: "0 auto" }}>
                {pieChart.labels.length ? (
                  <Pie
                    data={pieChart}
                    options={{ plugins: { legend: { position: "bottom" } } }}
                  />
                ) : (
                  <div className="muted" style={{ fontWeight: 800 }}>
                    Upload data to see charts.
                  </div>
                )}
              </div>
            </Card>

            <Card title="Monthly Trend">
              <div style={{ maxWidth: 560, margin: "0 auto" }}>
                {barChart.labels.length ? (
                  <Bar
                    data={barChart}
                    options={{
                      responsive: true,
                      plugins: { legend: { display: false } },
                      scales: { x: { ticks: { maxRotation: 0 } } },
                    }}
                  />
                ) : (
                  <div className="muted" style={{ fontWeight: 800 }}>
                    Upload data to see charts.
                  </div>
                )}
              </div>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}

