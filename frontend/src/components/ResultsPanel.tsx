"use client";

export interface SimulationResults {
  lambda: number;
  mu: number;
  rho: number;
  Lq: number;
  Wq: number;
  L: number;
  W: number;
  idleProbability: number;
}

interface ResultsPanelProps {
  results: SimulationResults | null;
}

export default function ResultsPanel({ results }: ResultsPanelProps) {
  if (!results) return null;

  const utilizationPercent = results.rho * 100;
  const idlePercent = results.idleProbability * 100;
  const spareCapacity = results.mu - results.lambda;
  const stable = results.lambda < results.mu;

  const outcomeMetrics = [
    {
      id: "lq",
      title: "Mean Queue Length (Lq)",
      value: results.Lq.toFixed(4),
      description: "Average customers waiting",
      valueColor: "text-[var(--accent)]",
      marker: "QL",
      dotColor: "bg-[var(--accent)]",
    },
    {
      id: "wq",
      title: "Mean Queue Wait (Wq)",
      value: results.Wq.toFixed(4),
      description: "Average waiting time in queue",
      valueColor: "text-[var(--accent-alt)]",
      marker: "QW",
      dotColor: "bg-[var(--accent-alt)]",
    },
    {
      id: "l",
      title: "Mean System Length (L)",
      value: results.L.toFixed(4),
      description: "Average customers in system",
      valueColor: "text-[var(--success)]",
      marker: "SL",
      dotColor: "bg-[var(--success)]",
    },
    {
      id: "w",
      title: "Mean System Wait (W)",
      value: results.W.toFixed(4),
      description: "Average total time in system",
      valueColor: "text-[var(--danger)]",
      marker: "SW",
      dotColor: "bg-[var(--danger)]",
    },
  ];

  return (
    <section className="shell-card rise-in p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="title-main text-xl sm:text-2xl">Simulation Output</h2>
          <p className="muted mt-2 text-sm">Ordered view: health snapshot, rates, then queue/system outcomes.</p>
        </div>
        <div className="label-chip">
          <span className="status-live blink-soft" />
          Solver updated
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-5">
        <article className="metric-tile lg:col-span-3">
          <div className="flex items-center justify-between gap-2">
            <p className="kicker muted">System Snapshot</p>
            <span className={`result-badge ${stable ? "result-badge-good" : "result-badge-bad"}`}>
              {stable ? "STABLE" : "UNSTABLE"}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="result-stat">
              <p className="kicker muted">Utilization</p>
              <p className="metric-value text-[var(--accent-alt)]">{utilizationPercent.toFixed(2)}%</p>
              <div className="meter mt-2">
                <span style={{ width: `${Math.max(0, Math.min(utilizationPercent, 100))}%` }} />
              </div>
            </div>

            <div className="result-stat">
              <p className="kicker muted">Idle Probability</p>
              <p className="metric-value text-[var(--success)]">{idlePercent.toFixed(2)}%</p>
              <div className="meter mt-2">
                <span style={{ width: `${Math.max(0, Math.min(idlePercent, 100))}%` }} />
              </div>
            </div>
          </div>
        </article>

        <article className="metric-tile lg:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <p className="kicker muted">Input Rates</p>
            <span className="kicker muted">mu - lambda</span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="result-stat">
              <p className="kicker muted">Arrival (lambda)</p>
              <p className="metric-value text-[var(--accent)]">{results.lambda.toFixed(4)}</p>
            </div>
            <div className="result-stat">
              <p className="kicker muted">Service (mu)</p>
              <p className="metric-value text-[var(--success)]">{results.mu.toFixed(4)}</p>
            </div>
          </div>

          <div className="result-stat mt-2">
            <p className="kicker muted">Spare Capacity</p>
            <p className={`metric-value ${spareCapacity >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
              {spareCapacity.toFixed(4)}
            </p>
          </div>
        </article>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {outcomeMetrics.map((metric) => (
          <article key={metric.id} className="metric-tile">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="kicker muted">{metric.title}</p>
              <div
                className={`relative inline-flex h-8 min-w-12 items-center justify-center rounded-md border-2 border-[var(--line)] bg-[var(--panel)] px-2 font-mono text-[11px] font-semibold ${metric.valueColor}`}
              >
                <span>{metric.marker}</span>
                <span
                  className={`absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-[var(--panel)] ${metric.dotColor}`}
                />
              </div>
            </div>
            <p className={`metric-value ${metric.valueColor}`}>{metric.value}</p>
            <p className="muted mt-2 text-xs">{metric.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
