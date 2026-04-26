"use client";

import { CheckCircle2, Server } from "lucide-react";

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  numberOfServers: number;
  onServersChange: (servers: number) => void;
}

export default function ModelSelector({
  selectedModel,
  onModelChange,
  numberOfServers,
  onServersChange,
}: ModelSelectorProps) {
  const models = [
    { id: "M/M/1", headline: "Classical single-server Markov queue", available: true },
    { id: "M/G/1", headline: "Poisson arrivals with general service", available: true },
    { id: "G/G/1", headline: "General arrival and service process", available: true },
    { id: "M/M/s", headline: "Multi-server exponential queue system", available: true },
    { id: "M/G/s", headline: "Poisson arrivals with general service and many servers", available: true },
    { id: "G/G/s", headline: "General arrival and service process with many servers", available: true },
  ];

  return (
    <section className="shell-card rise-in p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="title-main text-xl sm:text-2xl">Choose Model Family</h2>
        <span className="label-chip">Model library</span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {models.map((model) => {
          const active = selectedModel === model.id;

          return (
            <button
              key={model.id}
              type="button"
              onClick={() => model.available && onModelChange(model.id)}
              disabled={!model.available}
              className={`nav-btn text-left ${active ? "nav-btn-active" : ""} ${
                model.available ? "" : "cursor-not-allowed opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="kicker text-[var(--accent)]">{model.id}</p>
                  <p className="mt-1 text-sm font-medium">{model.headline}</p>
                </div>
                {active && <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />}
              </div>
            </button>
          );
        })}
      </div>

      {(selectedModel === "M/M/s" || selectedModel === "M/G/s" || selectedModel === "G/G/s") && (
        <div className="mt-4 shell-card p-4">
          <label htmlFor="servers-input" className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Server className="h-4 w-4 text-[var(--accent-alt)]" /> Number of servers (s)
          </label>
          <input
            id="servers-input"
            type="number"
            min="1"
            value={numberOfServers}
            onChange={(e) => onServersChange(parseInt(e.target.value, 10) || 1)}
            className="control"
            placeholder="Enter server count"
          />
        </div>
      )}
    </section>
  );
}
