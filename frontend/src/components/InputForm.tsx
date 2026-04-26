"use client";

import { Play, Loader2, AlertTriangle } from "lucide-react";
import { FormEvent } from "react";

interface InputFormProps {
  meanInterarrivalTime: string;
  meanServiceTime: string;
  interarrivalTimeStandardDeviation: string;
  serviceTimeStandardDeviation: string;
  numberOfServers: number;
  onMeanInterarrivalTimeChange: (value: string) => void;
  onMeanServiceTimeChange: (value: string) => void;
  onInterarrivalTimeStandardDeviationChange: (value: string) => void;
  onServiceTimeStandardDeviationChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  isLoading: boolean;
  selectedModel: string;
}

export default function InputForm({
  meanInterarrivalTime,
  meanServiceTime,
  interarrivalTimeStandardDeviation,
  serviceTimeStandardDeviation,
  numberOfServers,
  onMeanInterarrivalTimeChange,
  onMeanServiceTimeChange,
  onInterarrivalTimeStandardDeviationChange,
  onServiceTimeStandardDeviationChange,
  onSubmit,
  isLoading,
  selectedModel,
}: InputFormProps) {
  const needsServiceVariability =
    selectedModel === "M/G/1" || selectedModel === "G/G/1" || selectedModel === "M/G/s" || selectedModel === "G/G/s";
  const needsArrivalVariability = selectedModel === "G/G/1" || selectedModel === "G/G/s";
  const needsServerCount = selectedModel === "M/M/s" || selectedModel === "M/G/s" || selectedModel === "G/G/s";

  const isValid =
    selectedModel &&
    meanInterarrivalTime &&
    meanServiceTime &&
    parseFloat(meanInterarrivalTime) > 0 &&
    parseFloat(meanServiceTime) > 0 &&
    (!needsServerCount || numberOfServers > 0) &&
    (!needsServiceVariability ||
      (serviceTimeStandardDeviation !== "" && parseFloat(serviceTimeStandardDeviation) >= 0)) &&
    (!needsArrivalVariability ||
      (interarrivalTimeStandardDeviation !== "" && parseFloat(interarrivalTimeStandardDeviation) >= 0));

  return (
    <section className="shell-card rise-in p-5 sm:p-6">
      <h2 className="title-main text-xl sm:text-2xl">Timing Inputs</h2>
      <p className="muted mt-2 text-sm">Define queue arrival and service timing assumptions before running.</p>

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="shell-card p-4">
            <label htmlFor="mean-interarrival-time" className="block text-sm font-semibold">
              Mean Interarrival Time
            </label>
            <p className="muted mt-1 text-xs">Average time between incoming customers (1/lambda)</p>
            <input
              id="mean-interarrival-time"
              type="number"
              step="0.01"
              min="0.01"
              value={meanInterarrivalTime}
              onChange={(e) => onMeanInterarrivalTimeChange(e.target.value)}
              className="control mt-3"
              placeholder="3.00"
              disabled={!selectedModel || isLoading}
              required
            />
          </div>

          <div className="shell-card p-4">
            <label htmlFor="mean-service-time" className="block text-sm font-semibold">
              Mean Service Time
            </label>
            <p className="muted mt-1 text-xs">Average service duration for one customer (1/mu)</p>
            <input
              id="mean-service-time"
              type="number"
              step="0.01"
              min="0.01"
              value={meanServiceTime}
              onChange={(e) => onMeanServiceTimeChange(e.target.value)}
              className="control mt-3"
              placeholder="2.0"
              disabled={!selectedModel || isLoading}
              required
            />
          </div>

          {needsArrivalVariability && (
            <div className="shell-card p-4">
              <label htmlFor="interarrival-time-standard-deviation" className="block text-sm font-semibold">
                Interarrival Time Standard Deviation
              </label>
              <p className="muted mt-1 text-xs">Variation in the arrival process for G/G/1</p>
              <input
                id="interarrival-time-standard-deviation"
                type="number"
                step="0.01"
                min="0"
                value={interarrivalTimeStandardDeviation}
                onChange={(e) => onInterarrivalTimeStandardDeviationChange(e.target.value)}
                className="control mt-3"
                placeholder="1.20"
                disabled={!selectedModel || isLoading}
                required={needsArrivalVariability}
              />
            </div>
          )}

          {needsServiceVariability && (
            <div className="shell-card p-4">
              <label htmlFor="service-time-standard-deviation" className="block text-sm font-semibold">
                Service Time Standard Deviation
              </label>
              <p className="muted mt-1 text-xs">Variation in service time for M/G/1 and G/G/1</p>
              <input
                id="service-time-standard-deviation"
                type="number"
                step="0.01"
                min="0"
                value={serviceTimeStandardDeviation}
                onChange={(e) => onServiceTimeStandardDeviationChange(e.target.value)}
                className="control mt-3"
                placeholder="0.80"
                disabled={!selectedModel || isLoading}
                required={needsServiceVariability}
              />
            </div>
          )}
        </div>

        <button type="submit" disabled={!isValid || isLoading} className="btn-main inline-flex items-center justify-center gap-2">
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Analyzing queue...</span>
            </>
          ) : (
            <>
              <Play className="h-5 w-5" />
              <span>Analyze Queue</span>
            </>
          )}
        </button>

        {!selectedModel && (
          <p className="inline-flex items-center gap-2 rounded-xl border-2 border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--danger)]">
            <AlertTriangle className="h-4 w-4" /> Select a model first to unlock inputs.
          </p>
        )}
      </form>
    </section>
  );
}
