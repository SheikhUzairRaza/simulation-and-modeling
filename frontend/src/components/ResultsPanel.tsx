"use client";

import { TrendingUp, Users, Clock, CircleDot, Activity } from "lucide-react";

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
      title: "Utilization (ρ)",
      value: `${(results.rho * 100).toFixed(2)}%`,
      description: "How busy the system is",
      icon: TrendingUp,
      color: "violet",
    },
    {
      id: "lq",
      title: "Mean Number in Queue (Lq)",
      value: results.Lq.toFixed(4),
      description: "Average customers waiting",
      icon: Users,
      color: "amber",
    },
    {
      id: "wq",
      title: "Mean Wait in Queue (Wq)",
      value: `${results.Wq.toFixed(4)} ${timeUnitLabel[selectedTimeUnit]}`,
      description: "Average delay before service",
      icon: Clock,
      color: "cyan",
    },
    {
      id: "l",
      title: "Mean Number in System (L)",
      value: results.L.toFixed(4),
      description: "Average customers in system",
      icon: Users,
      color: "violet",
    },
    {
      id: "w",
      title: "Mean Wait in System (W)",
      value: `${results.W.toFixed(4)} ${timeUnitLabel[selectedTimeUnit]}`,
      description: "Average time spent in system",
      icon: Clock,
      color: "cyan",
    },
  ];

  if (typeof results.P0 === "number") {
    metrics.push({
      id: "p0",
      title: "Idle Probability (P0)",
      value: `${(results.P0 * 100).toFixed(2)}%`,
      description: "Chance the system is empty",
      icon: CircleDot,
      color: "rose",
    });
  }

  const colorClasses = {
    cyan: "bg-cyan-50/60 dark:bg-cyan-900/10 text-cyan-700 dark:text-cyan-300 border-cyan-200/50 dark:border-cyan-800/30 ring-1 ring-cyan-500/5 shadow-[0_0_20px_rgba(34,211,238,0.05)]",
    violet: "bg-violet-50/60 dark:bg-violet-900/10 text-violet-700 dark:text-violet-300 border-violet-200/50 dark:border-violet-800/30 ring-1 ring-violet-500/5 shadow-[0_0_20px_rgba(139,92,246,0.05)]",
    amber: "bg-amber-50/60 dark:bg-amber-900/10 text-amber-700 dark:text-amber-300 border-amber-200/50 dark:border-amber-800/30 ring-1 ring-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.05)]",
    rose: "bg-rose-50/60 dark:bg-rose-900/10 text-rose-700 dark:text-rose-300 border-rose-200/50 dark:border-rose-800/30 ring-1 ring-rose-500/5 shadow-[0_0_20px_rgba(244,63,94,0.05)]",
  };

  return (
    <div
      className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_8px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.3)] p-6 sm:p-10 border border-white/60 dark:border-slate-800/60 animate-slideUp"
      style={{ animationDelay: "0.1s" }}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Simulation Results
            </h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Live metrics and queue behavior
            </p>
          </div>
        </div>

        <div className="px-5 py-2.5 rounded-full border border-violet-200 dark:border-violet-800/50 bg-violet-50 dark:bg-violet-900/20 text-sm font-bold text-violet-600 dark:text-violet-300 tracking-widest shadow-sm">
          MODEL: {results.model}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.id}
              className={`group relative overflow-hidden backdrop-blur-md p-6 rounded-[2rem] border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:scale-[1.02] ${colorClasses[metric.color as keyof typeof colorClasses]}`}
              style={{ animationDelay: `${0.1 * (idx + 1)}s` }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-current/5 to-transparent rounded-bl-full -z-10 transition-transform duration-500 group-hover:scale-150" />

              <div className="flex items-start justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 tracking-wide">
                  {metric.title}
                </h3>
                <div className="h-8 w-8 rounded-full bg-current/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 opacity-90 transform group-hover:rotate-12 transition-transform duration-300" />
                </div>
              </div>

              <p className="text-3xl sm:text-4xl font-extrabold mb-3 tracking-tight">{metric.value}</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
                {metric.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
