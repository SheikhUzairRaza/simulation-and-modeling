"use client";

import { useState } from "react";
import { Activity, Building2, Clock3, Play, TrendingUp, Users } from "lucide-react";

type BranchProfile = {
  id: string;
  name: string;
  location: string;
  openHour: number;
  closeHour: number;
  tellers: number;
  queueLimit: number;
  serviceMinutes: number;
  serviceDeviation: number;
  abandonmentMinutes: number;
  arrivalPattern: number[];
};

type HourlySnapshot = {
  hourLabel: string;
  arrivals: number;
  served: number;
  abandoned: number;
  avgWait: number;
  peakQueue: number;
};

type SimulationRun = {
  profile: BranchProfile;
  totalArrivals: number;
  totalServed: number;
  totalAbandoned: number;
  averageWait: number;
  peakQueue: number;
  utilization: number;
  busiestWindow: string;
  hourlySnapshots: HourlySnapshot[];
};

const branchProfiles: BranchProfile[] = [
  {
    id: "downtown",
    name: "Downtown Branch",
    location: "Commercial district",
    openHour: 9,
    closeHour: 17,
    tellers: 6,
    queueLimit: 22,
    serviceMinutes: 6.5,
    serviceDeviation: 2.1,
    abandonmentMinutes: 19,
    arrivalPattern: [16, 24, 31, 28, 34, 30, 22, 14],
  },
  {
    id: "suburban",
    name: "Suburban Branch",
    location: "Residential catchment",
    openHour: 9,
    closeHour: 17,
    tellers: 4,
    queueLimit: 16,
    serviceMinutes: 7.2,
    serviceDeviation: 1.8,
    abandonmentMinutes: 16,
    arrivalPattern: [10, 14, 18, 16, 21, 20, 15, 9],
  },
  {
    id: "payday",
    name: "Month-End Payroll Day",
    location: "High-footfall branch",
    openHour: 9,
    closeHour: 17,
    tellers: 7,
    queueLimit: 28,
    serviceMinutes: 7.8,
    serviceDeviation: 2.7,
    abandonmentMinutes: 24,
    arrivalPattern: [18, 29, 38, 36, 44, 39, 27, 16],
  },
];

function createSeededRandom(seed: number) {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;

  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function randomNormal(random: () => number, mean: number, deviation: number) {
  const u1 = Math.max(random(), 1e-9);
  const u2 = Math.max(random(), 1e-9);
  const gaussian = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return mean + deviation * gaussian;
}

function formatHour(hour: number) {
  const suffix = hour >= 12 ? "PM" : "AM";
  const normalized = hour % 12 === 0 ? 12 : hour % 12;
  return `${normalized}:00 ${suffix}`;
}

function runBankSimulation(profile: BranchProfile): SimulationRun {
  const random = createSeededRandom(profile.name.length * 97 + profile.tellers * 31);
  const totalMinutes = (profile.closeHour - profile.openHour) * 60;
  const tellerBusyUntil = Array.from({ length: profile.tellers }, () => 0);
  const hourlySnapshots = profile.arrivalPattern.map((_, index) => ({
    hourLabel: `${formatHour(profile.openHour + index)} - ${formatHour(profile.openHour + index + 1)}`,
    arrivals: 0,
    served: 0,
    abandoned: 0,
    avgWait: 0,
    peakQueue: 0,
  }));

  let totalArrivals = 0;
  let totalServed = 0;
  let totalAbandoned = 0;
  let totalWait = 0;
  let peakQueue = 0;
  let totalBusyMinutes = 0;

  const queue: number[] = [];

  for (let minute = 0; minute < totalMinutes; minute++) {
    const hourIndex = Math.min(Math.floor(minute / 60), profile.arrivalPattern.length - 1);
    const arrivalsThisHour = profile.arrivalPattern[hourIndex];
    const arrivalProbability = arrivalsThisHour / 60;
    const extraBurst = random() < 0.08 ? 1 : 0;
    const arrivalsThisMinute = (random() < arrivalProbability ? 1 : 0) + extraBurst;

    for (let i = 0; i < arrivalsThisMinute; i++) {
      totalArrivals += 1;
      hourlySnapshots[hourIndex].arrivals += 1;
      if (queue.length < profile.queueLimit) {
        queue.push(minute);
      } else {
        totalAbandoned += 1;
        hourlySnapshots[hourIndex].abandoned += 1;
      }
    }

    for (let teller = 0; teller < tellerBusyUntil.length; teller++) {
      if (tellerBusyUntil[teller] > minute) continue;

      while (queue.length > 0) {
        const arrivalMinute = queue.shift();
        if (arrivalMinute === undefined) break;

        const waitMinutes = minute - arrivalMinute;
        if (waitMinutes > profile.abandonmentMinutes) {
          totalAbandoned += 1;
          hourlySnapshots[hourIndex].abandoned += 1;
          continue;
        }

        const serviceTime = Math.max(
          2,
          randomNormal(random, profile.serviceMinutes, profile.serviceDeviation)
        );
        tellerBusyUntil[teller] = minute + serviceTime;
        totalBusyMinutes += serviceTime;
        totalServed += 1;
        totalWait += waitMinutes;
        hourlySnapshots[hourIndex].served += 1;
        hourlySnapshots[hourIndex].avgWait += waitMinutes;
        break;
      }
    }

    peakQueue = Math.max(peakQueue, queue.length);
    hourlySnapshots[hourIndex].peakQueue = Math.max(hourlySnapshots[hourIndex].peakQueue, queue.length);
  }

  const finalizedHourlySnapshots = hourlySnapshots.map((snapshot) => ({
    ...snapshot,
    avgWait: snapshot.served > 0 ? snapshot.avgWait / snapshot.served : 0,
  }));

  const busiestWindow =
    finalizedHourlySnapshots.reduce((current, next) => (next.arrivals > current.arrivals ? next : current)).hourLabel;

  return {
    profile,
    totalArrivals,
    totalServed,
    totalAbandoned,
    averageWait: totalServed > 0 ? totalWait / totalServed : 0,
    peakQueue,
    utilization: totalBusyMinutes / (profile.tellers * totalMinutes),
    busiestWindow,
    hourlySnapshots: finalizedHourlySnapshots,
  };
}

export default function BankSimulationPanel() {
  const [selectedProfileId, setSelectedProfileId] = useState(branchProfiles[0].id);
  const [run, setRun] = useState<SimulationRun>(() => runBankSimulation(branchProfiles[0]));
  const selectedProfile =
    branchProfiles.find((profile) => profile.id === selectedProfileId) ?? branchProfiles[0];

  const rerun = () => {
    setRun(runBankSimulation(selectedProfile));
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
      <section className="space-y-5">
        <div className="shell-card rise-in p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="kicker text-[var(--accent)]">Branch Setup</p>
              <h2 className="title-main mt-2 text-2xl">Bank Simulation</h2>
              <p className="muted mt-2 text-sm">
                Day-of-operations replica using realistic teller load, queue caps, and customer patience.
              </p>
            </div>
            <div className="rounded-2xl border-2 border-[var(--line)] bg-[var(--panel)] p-3">
              <Building2 className="h-6 w-6 text-[var(--accent-alt)]" />
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {branchProfiles.map((profile) => {
              const active = selectedProfileId === profile.id;
              return (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => setSelectedProfileId(profile.id)}
                  className={`nav-btn text-left ${active ? "nav-btn-active" : ""}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{profile.name}</p>
                      <p className="muted mt-1 text-sm">{profile.location}</p>
                      <p className="muted mt-2 text-xs">
                        {profile.tellers} tellers, {profile.openHour}:00 to {profile.closeHour}:00, average service {profile.serviceMinutes.toFixed(1)} min
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <button type="button" onClick={rerun} className="btn-main mt-5 inline-flex items-center justify-center gap-2">
            <Play className="h-5 w-5" />
            <span>Run Branch Day</span>
          </button>
        </div>

        <div className="shell-card rise-in p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-[var(--accent)]" />
            <h3 className="title-main text-xl">Operating Assumptions</h3>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="result-stat">
              <p className="kicker muted">Tellers</p>
              <p className="metric-value text-[var(--accent)]">{selectedProfile.tellers}</p>
            </div>
            <div className="result-stat">
              <p className="kicker muted">Queue Cap</p>
              <p className="metric-value text-[var(--accent-alt)]">{selectedProfile.queueLimit}</p>
            </div>
            <div className="result-stat">
              <p className="kicker muted">Avg Service</p>
              <p className="metric-value text-[var(--success)]">{selectedProfile.serviceMinutes.toFixed(1)}m</p>
            </div>
            <div className="result-stat">
              <p className="kicker muted">Patience Limit</p>
              <p className="metric-value text-[var(--danger)]">{selectedProfile.abandonmentMinutes}m</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="shell-card rise-in p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="kicker text-[var(--accent-alt)]">Simulation Output</p>
              <h2 className="title-main mt-2 text-2xl">{run.profile.name}</h2>
              <p className="muted mt-2 text-sm">
                Replica run for a typical operating day with realistic branch traffic waves.
              </p>
            </div>
            <div className="label-chip">
              <span className="status-live blink-soft" />
              Branch day simulated
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div className="metric-tile">
              <p className="kicker muted">Customers Arrived</p>
              <p className="metric-value text-[var(--accent)]">{run.totalArrivals}</p>
            </div>
            <div className="metric-tile">
              <p className="kicker muted">Customers Served</p>
              <p className="metric-value text-[var(--success)]">{run.totalServed}</p>
            </div>
            <div className="metric-tile">
              <p className="kicker muted">Left Queue</p>
              <p className="metric-value text-[var(--danger)]">{run.totalAbandoned}</p>
            </div>
            <div className="metric-tile">
              <p className="kicker muted">Average Wait</p>
              <p className="metric-value text-[var(--accent-alt)]">{run.averageWait.toFixed(1)} min</p>
            </div>
            <div className="metric-tile">
              <p className="kicker muted">Peak Queue</p>
              <p className="metric-value text-[var(--accent)]">{run.peakQueue}</p>
            </div>
            <div className="metric-tile">
              <p className="kicker muted">Teller Utilization</p>
              <p className="metric-value text-[var(--success)]">{(run.utilization * 100).toFixed(1)}%</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="result-stat">
              <p className="kicker muted">Busiest Window</p>
              <p className="mt-1 text-sm font-semibold">{run.busiestWindow}</p>
            </div>
            <div className="result-stat">
              <p className="kicker muted">Operating Span</p>
              <p className="mt-1 text-sm font-semibold">
                {formatHour(run.profile.openHour)} - {formatHour(run.profile.closeHour)}
              </p>
            </div>
            <div className="result-stat">
              <p className="kicker muted">Branch Type</p>
              <p className="mt-1 text-sm font-semibold">{run.profile.location}</p>
            </div>
          </div>
        </div>

        <div className="shell-card rise-in p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-[var(--accent)]" />
            <h3 className="title-main text-xl">Hourly Pressure</h3>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2">
              <thead>
                <tr className="text-left text-xs uppercase text-[var(--muted)]">
                  <th className="px-3">Window</th>
                  <th className="px-3">Arrivals</th>
                  <th className="px-3">Served</th>
                  <th className="px-3">Abandoned</th>
                  <th className="px-3">Avg Wait</th>
                  <th className="px-3">Peak Queue</th>
                </tr>
              </thead>
              <tbody>
                {run.hourlySnapshots.map((snapshot) => (
                  <tr key={snapshot.hourLabel} className="result-stat">
                    <td className="px-3 py-3 text-sm font-semibold">{snapshot.hourLabel}</td>
                    <td className="px-3 py-3 text-sm">{snapshot.arrivals}</td>
                    <td className="px-3 py-3 text-sm">{snapshot.served}</td>
                    <td className="px-3 py-3 text-sm">{snapshot.abandoned}</td>
                    <td className="px-3 py-3 text-sm">{snapshot.avgWait.toFixed(1)} min</td>
                    <td className="px-3 py-3 text-sm">{snapshot.peakQueue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="shell-card rise-in p-5">
            <div className="flex items-center gap-2">
              <Clock3 className="h-5 w-5 text-[var(--accent-alt)]" />
              <p className="title-main text-lg">Wait Signal</p>
            </div>
            <p className="muted mt-3 text-sm">
              This run is considered {run.averageWait <= 6 ? "comfortable" : run.averageWait <= 10 ? "stretched" : "congested"} for walk-in retail banking.
            </p>
          </div>

          <div className="shell-card rise-in p-5">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-[var(--success)]" />
              <p className="title-main text-lg">Service Health</p>
            </div>
            <p className="muted mt-3 text-sm">
              {(run.totalServed / Math.max(run.totalArrivals, 1) * 100).toFixed(1)}% of visitors were completed before abandoning the queue.
            </p>
          </div>

          <div className="shell-card rise-in p-5">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[var(--accent)]" />
              <p className="title-main text-lg">Staffing View</p>
            </div>
            <p className="muted mt-3 text-sm">
              {run.utilization > 0.86
                ? "Teller load is high enough to justify flex coverage around the midday rush."
                : "Current staffing absorbs the day without persistent teller saturation."}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
