"use client";

import { Activity, CircleDot, Clock, TrendingUp, Users } from "lucide-react";

type TimeUnit = "seconds" | "minutes" | "hours";

const timeUnitLabel: Record<TimeUnit, string> = {
  seconds: "sec",
  minutes: "min",
  hours: "hr",
};

export interface SimulationResults {
  model: string;
  rho: number;
  Lq: number;
  Wq: number;
  L: number;
  W: number;
  P0?: number | null;
  timeUnit?: TimeUnit;
}

interface ResultsPanelProps {
  results: SimulationResults | null;
}

export default function ResultsPanel({ results }: ResultsPanelProps) {
  if (!results) return null;

  const selectedTimeUnit = results.timeUnit ?? "minutes";

  const metrics = [
    {
      id: "rho",
      title: "Utilization",
      value: `${(results.rho * 100).toFixed(2)}%`,
      detail: "Busy fraction",
      icon: TrendingUp,
    },
    {
      id: "lq",
      title: "Queue length",
      value: results.Lq.toFixed(4),
      detail: "Average waiting count",
      icon: Users,
    },
    {
      id: "wq",
      title: "Queue wait",
      value: `${results.Wq.toFixed(4)} ${timeUnitLabel[selectedTimeUnit]}`,
      detail: "Average time in queue",
      icon: Clock,
    },
    {
      id: "l",
      title: "System length",
      value: results.L.toFixed(4),
      detail: "Average number in system",
      icon: Activity,
    },
    {
      id: "w",
      title: "System time",
      value: `${results.W.toFixed(4)} ${timeUnitLabel[selectedTimeUnit]}`,
      detail: "Average total residence time",
      icon: Clock,
    },
  ];

  if (typeof results.P0 === "number") {
    metrics.push({
      id: "p0",
      title: "Idle chance",
      value: `${(results.P0 * 100).toFixed(2)}%`,
      detail: "Probability of zero customers",
      icon: CircleDot,
    });
  }

  return (
    <div className="section-shell">
      <div className="section-header">
        <div>
          <p className="eyebrow">Output deck</p>
          <h2 className="section-title">Computed metrics</h2>
        </div>
        <span className="badge-soft">Model {results.model}</span>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={metric.id} className="metric-card" style={{ animationDelay: `${index * 0.06}s` }}>
              <div className="metric-card-top">
                <span className="metric-card-title">{metric.title}</span>
                <Icon className="h-5 w-5 text-[var(--accent)]" />
              </div>
              <div className="metric-card-value">{metric.value}</div>
              <p className="metric-card-note">{metric.detail}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
