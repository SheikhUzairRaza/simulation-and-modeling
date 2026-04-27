"use client";
import React, { useState, useMemo } from "react";
import { Play, Table, BarChart3, Zap } from "lucide-react";

interface SimulationRow {
  customer: number;
  interArrivalTime: number;
  arrivalTime: number;
  serviceTime: number;
  startTime: number;
  endTime: number;
  turnAroundTime: number;
  waitTime: number;
}

export default function MM1Simulator() {
  const [lambda, setLambda] = useState(2.65);
  const [mu, setMu] = useState(7.45);
  const [numCustomers, setNumCustomers] = useState(10);
  const [results, setResults] = useState<SimulationRow[]>([]);

  const runSimulation = () => {
    let currentTime = 0;
    let lastEndTime = 0;
    const newResults: SimulationRow[] = [];

    for (let i = 1; i <= numCustomers; i++) {
      const r1 = Math.random();
      const interArrival = i === 1 ? 0 : Math.round((-1 / lambda) * Math.log(1 - r1) * 100) / 10;
      currentTime += interArrival;

      const r2 = Math.random();
      const service = Math.round((-1 / mu) * Math.log(1 - r2) * 100) / 10;

      const start = Math.max(currentTime, lastEndTime);
      const end = start + service;
      const wait = start - currentTime;
      const turnAround = end - currentTime;
      
      newResults.push({
        customer: i,
        interArrivalTime: interArrival,
        arrivalTime: currentTime,
        serviceTime: service,
        startTime: start,
        endTime: end,
        turnAroundTime: turnAround,
        waitTime: wait,
      });
      lastEndTime = end;
    }
    setResults(newResults);
  };

  const stats = useMemo(() => {
    if (results.length === 0) return null;
    const totalWait = results.reduce((a, b) => a + b.waitTime, 0);
    const totalService = results.reduce((a, b) => a + b.serviceTime, 0);
    const maxEnd = results[results.length - 1].endTime;
    return {
      avgWait: totalWait / results.length,
      avgTurnAround: results.reduce((a, b) => a + b.turnAroundTime, 0) / results.length,
      utilization: (totalService / maxEnd) * 100,
    };
  }, [results]);

  return (
    <div className="space-y-6 rise-in">
      <section className="shell-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <Zap className="text-[var(--accent)]" />
          <h2 className="title-main text-2xl">M/M/1 ATM Simulation</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase muted">Arrival Rate (λ)</label>
            <input type="number" value={lambda} onChange={(e) => setLambda(parseFloat(e.target.value))} className="w-full bg-[var(--panel)] border border-[var(--line)] rounded-xl p-3 focus:outline-none focus:border-[var(--accent)]" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase muted">Service Rate (μ)</label>
            <input type="number" value={mu} onChange={(e) => setMu(parseFloat(e.target.value))} className="w-full bg-[var(--panel)] border border-[var(--line)] rounded-xl p-3 focus:outline-none focus:border-[var(--accent)]" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase muted">Customers</label>
            <input type="number" value={numCustomers} onChange={(e) => setNumCustomers(parseInt(e.target.value))} className="w-full bg-[var(--panel)] border border-[var(--line)] rounded-xl p-3 focus:outline-none focus:border-[var(--accent)]" />
          </div>
        </div>
        <button onClick={runSimulation} className="btn-main mt-6 flex items-center gap-2">
          <Play size={18} /> Run Simulation
        </button>
      </section>

      {results.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="metric-tile"><p className="kicker muted">Avg Wait</p><p className="metric-value text-[var(--accent-alt)]">{stats?.avgWait.toFixed(2)}m</p></div>
            <div className="metric-tile"><p className="kicker muted">Utilization</p><p className="metric-value text-[var(--success)]">{stats?.utilization.toFixed(1)}%</p></div>
            <div className="metric-tile"><p className="kicker muted">Avg Turnaround</p><p className="metric-value text-[var(--accent)]">{stats?.avgTurnAround.toFixed(2)}m</p></div>
          </div>

          <section className="shell-card p-6 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead><tr className="border-b border-[var(--line)] muted"><th className="p-3">Cust</th><th className="p-3">Arrival</th><th className="p-3">Service</th><th className="p-3">Start</th><th className="p-3">End</th><th className="p-3">Wait</th></tr></thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.customer} className="border-b border-[var(--line)] hover:bg-[var(--panel)]">
                    <td className="p-3 font-bold text-[var(--accent)]">C{r.customer}</td>
                    <td className="p-3">{r.arrivalTime.toFixed(2)}</td><td className="p-3">{r.serviceTime.toFixed(2)}</td>
                    <td className="p-3">{r.startTime.toFixed(2)}</td><td className="p-3">{r.endTime.toFixed(2)}</td>
                    <td className="p-3 text-[var(--danger)]">{r.waitTime.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="shell-card p-6">
            <div className="flex items-center gap-2 mb-6"><BarChart3 size={20} className="text-[var(--accent-alt)]" /><h3 className="font-bold">Server Gantt Chart</h3></div>
            <div className="relative h-20 bg-[var(--panel)] border border-[var(--line)] rounded-xl mt-8 mb-4">
              {results.map((r) => (
                <div key={r.customer} className="absolute h-full flex items-center justify-center text-[10px] text-white group transition-all hover:brightness-125"
                  style={{ left: `${(r.startTime / results[results.length-1].endTime) * 100}%`, width: `${(r.serviceTime / results[results.length-1].endTime) * 100}%`, backgroundColor: `hsl(${(r.customer * 137) % 360}, 60%, 45%)` }}>
                  <span className="hidden group-hover:block">C{r.customer}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] muted"><span>0.0</span><span>{results[results.length-1].endTime.toFixed(1)} mins</span></div>
          </section>
        </>
      )}
    </div>
  );
}
