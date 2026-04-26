"use client";

import { useState } from "react";
import { Activity, BarChart3, Building2, Clock3, LineChart, Play, Table2, Users } from "lucide-react";

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

type CustomerRecord = {
  id: number;
  arrivalMinute: number;
  arrivalLabel: string;
  serviceMinutes: number;
  queueWait: number;
  responseMinutes: number | null;
  turnaroundMinutes: number | null;
  startMinute: number | null;
  endMinute: number | null;
  tellerId: number | null;
  status: "served" | "abandoned_queue_limit" | "abandoned_patience";
};

type TellerSegment = {
  customerId: number;
  tellerId: number;
  startMinute: number;
  endMinute: number;
  serviceMinutes: number;
};

type TellerPerformance = {
  tellerId: number;
  customersServed: number;
  avgTurnaround: number;
  avgWait: number;
  avgResponse: number;
  utilization: number;
  busyMinutes: number;
};

type SimulationRun = {
  profile: BranchProfile;
  totalArrivals: number;
  totalServed: number;
  totalAbandoned: number;
  averageWait: number;
  averageTurnaround: number;
  averageResponse: number;
  peakQueue: number;
  utilization: number;
  busiestWindow: string;
  closingMinute: number;
  customers: CustomerRecord[];
  tellerPerformance: TellerPerformance[];
  hourlySnapshots: HourlySnapshot[];
  segments: TellerSegment[];
  timeline: number[];
  queueSeries: number[];
  utilizationSeries: number[];
};

type TabKey = "summary" | "events" | "performance" | "graphs";

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

const tabItems: Array<{ id: TabKey; label: string; icon: typeof Table2 }> = [
  { id: "summary", label: "Summary", icon: BarChart3 },
  { id: "events", label: "Event Table", icon: Table2 },
  { id: "performance", label: "Performance", icon: Users },
  { id: "graphs", label: "Graphical View", icon: LineChart },
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

function formatMinuteLabel(profile: BranchProfile, minute: number | null) {
  if (minute === null) return "Not served";

  const totalMinutes = profile.openHour * 60 + minute;
  const hours24 = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const suffix = hours24 >= 12 ? "PM" : "AM";
  const normalized = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${normalized}:${mins.toString().padStart(2, "0")} ${suffix}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function buildPath(values: number[], width: number, height: number) {
  if (values.length === 0) return "";

  const maxValue = Math.max(...values, 1);
  const stepX = values.length > 1 ? width / (values.length - 1) : width;

  return values
    .map((value, index) => {
      const x = index * stepX;
      const y = height - (value / maxValue) * height;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function runBankSimulation(profile: BranchProfile): SimulationRun {
  const random = createSeededRandom(profile.name.length * 97 + profile.tellers * 31 + profile.queueLimit * 13);
  const totalMinutes = (profile.closeHour - profile.openHour) * 60;
  const tellerBusyUntil = Array.from({ length: profile.tellers }, () => 0);
  const tellerCurrentCustomer = Array.from({ length: profile.tellers }, () => -1);
  const tellerBusyMinutes = Array.from({ length: profile.tellers }, () => 0);
  const queue: number[] = [];
  const segments: TellerSegment[] = [];
  const customers: CustomerRecord[] = [];

  const hourlySnapshots = profile.arrivalPattern.map((_, index) => ({
    hourLabel: `${formatHour(profile.openHour + index)} - ${formatHour(profile.openHour + index + 1)}`,
    arrivals: 0,
    served: 0,
    abandoned: 0,
    avgWait: 0,
    peakQueue: 0,
  }));

  const timeline: number[] = [];
  const queueSeries: number[] = [];
  const utilizationSeries: number[] = [];

  let minute = 0;
  let nextCustomerId = 1;
  let totalArrivals = 0;
  let totalServed = 0;
  let totalAbandoned = 0;
  let totalWait = 0;
  let totalTurnaround = 0;
  let totalResponse = 0;
  let peakQueue = 0;

  while (
    minute < totalMinutes ||
    queue.length > 0 ||
    tellerBusyUntil.some((busyUntil) => busyUntil > minute)
  ) {
    if (minute < totalMinutes) {
      const hourIndex = Math.min(Math.floor(minute / 60), profile.arrivalPattern.length - 1);
      const arrivalsThisHour = profile.arrivalPattern[hourIndex];
      const arrivalProbability = arrivalsThisHour / 60;
      const extraBurst = random() < 0.08 ? 1 : 0;
      const arrivalsThisMinute = (random() < arrivalProbability ? 1 : 0) + extraBurst;

      for (let i = 0; i < arrivalsThisMinute; i += 1) {
        const serviceMinutes = Math.max(2, Math.round(randomNormal(random, profile.serviceMinutes, profile.serviceDeviation)));
        const record: CustomerRecord = {
          id: nextCustomerId,
          arrivalMinute: minute,
          arrivalLabel: formatMinuteLabel(profile, minute),
          serviceMinutes,
          queueWait: 0,
          responseMinutes: null,
          turnaroundMinutes: null,
          startMinute: null,
          endMinute: null,
          tellerId: null,
          status: "served",
        };

        customers.push(record);
        totalArrivals += 1;
        hourlySnapshots[hourIndex].arrivals += 1;

        if (queue.length < profile.queueLimit) {
          queue.push(record.id);
        } else {
          record.status = "abandoned_queue_limit";
          totalAbandoned += 1;
          hourlySnapshots[hourIndex].abandoned += 1;
        }

        nextCustomerId += 1;
      }
    }

    for (let tellerIndex = 0; tellerIndex < profile.tellers; tellerIndex += 1) {
      if (tellerBusyUntil[tellerIndex] > minute) {
        continue;
      }

      tellerCurrentCustomer[tellerIndex] = -1;

      while (queue.length > 0) {
        const customerId = queue.shift();
        if (customerId === undefined) break;

        const customer = customers[customerId - 1];
        const waitMinutes = minute - customer.arrivalMinute;
        const snapshotIndex = Math.min(
          Math.floor(customer.arrivalMinute / 60),
          hourlySnapshots.length - 1,
        );

        if (waitMinutes > profile.abandonmentMinutes) {
          customer.status = "abandoned_patience";
          customer.queueWait = waitMinutes;
          totalAbandoned += 1;
          hourlySnapshots[snapshotIndex].abandoned += 1;
          continue;
        }

        customer.startMinute = minute;
        customer.endMinute = minute + customer.serviceMinutes;
        customer.queueWait = waitMinutes;
        customer.responseMinutes = waitMinutes;
        customer.turnaroundMinutes = customer.queueWait + customer.serviceMinutes;
        customer.tellerId = tellerIndex + 1;
        customer.status = "served";

        tellerBusyUntil[tellerIndex] = customer.endMinute;
        tellerCurrentCustomer[tellerIndex] = customer.id;
        tellerBusyMinutes[tellerIndex] += customer.serviceMinutes;
        totalServed += 1;
        totalWait += customer.queueWait;
        totalResponse += customer.responseMinutes;
        totalTurnaround += customer.turnaroundMinutes;
        hourlySnapshots[snapshotIndex].served += 1;
        hourlySnapshots[snapshotIndex].avgWait += customer.queueWait;

        segments.push({
          customerId: customer.id,
          tellerId: tellerIndex + 1,
          startMinute: customer.startMinute,
          endMinute: customer.endMinute,
          serviceMinutes: customer.serviceMinutes,
        });
        break;
      }
    }

    peakQueue = Math.max(peakQueue, queue.length);

    const activeHourIndex = Math.min(Math.floor(Math.min(minute, totalMinutes - 1) / 60), hourlySnapshots.length - 1);
    hourlySnapshots[activeHourIndex].peakQueue = Math.max(hourlySnapshots[activeHourIndex].peakQueue, queue.length);

    timeline.push(minute);
    queueSeries.push(queue.length);
    utilizationSeries.push(
      tellerBusyUntil.filter((busyUntil) => busyUntil > minute).length / profile.tellers,
    );

    minute += 1;
  }

  const finalizedHourlySnapshots = hourlySnapshots.map((snapshot) => ({
    ...snapshot,
    avgWait: snapshot.served > 0 ? snapshot.avgWait / snapshot.served : 0,
  }));

  const tellerPerformance = tellerBusyMinutes.map((busyMinutes, index) => {
    const servedByTeller = customers.filter(
      (customer) => customer.status === "served" && customer.tellerId === index + 1,
    );

    return {
      tellerId: index + 1,
      customersServed: servedByTeller.length,
      avgTurnaround:
        servedByTeller.length > 0
          ? servedByTeller.reduce((sum, customer) => sum + (customer.turnaroundMinutes ?? 0), 0) / servedByTeller.length
          : 0,
      avgWait:
        servedByTeller.length > 0
          ? servedByTeller.reduce((sum, customer) => sum + customer.queueWait, 0) / servedByTeller.length
          : 0,
      avgResponse:
        servedByTeller.length > 0
          ? servedByTeller.reduce((sum, customer) => sum + (customer.responseMinutes ?? 0), 0) / servedByTeller.length
          : 0,
      utilization: busyMinutes / Math.max(minute, 1),
      busyMinutes,
    };
  });

  const busiestWindow = finalizedHourlySnapshots.reduce((current, next) =>
    next.arrivals > current.arrivals ? next : current,
  ).hourLabel;

  return {
    profile,
    totalArrivals,
    totalServed,
    totalAbandoned,
    averageWait: totalServed > 0 ? totalWait / totalServed : 0,
    averageTurnaround: totalServed > 0 ? totalTurnaround / totalServed : 0,
    averageResponse: totalServed > 0 ? totalResponse / totalServed : 0,
    peakQueue,
    utilization:
      tellerBusyMinutes.reduce((sum, busyMinutes) => sum + busyMinutes, 0) / Math.max(profile.tellers * minute, 1),
    busiestWindow,
    closingMinute: minute,
    customers,
    tellerPerformance,
    hourlySnapshots: finalizedHourlySnapshots,
    segments,
    timeline,
    queueSeries,
    utilizationSeries,
  };
}

function MiniTrendChart({
  title,
  values,
  color,
  formatValue,
}: {
  title: string;
  values: number[];
  color: string;
  formatValue: (value: number) => string;
}) {
  const width = 640;
  const height = 160;
  const path = buildPath(values, width, height);
  const maxValue = Math.max(...values, 1);
  const lastValue = values.at(-1) ?? 0;

  return (
    <div className="shell-card rise-in p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="kicker muted">{title}</p>
          <p className="title-main mt-2 text-xl">{formatValue(maxValue)} peak</p>
        </div>
        <p className="text-sm font-semibold text-[var(--muted)]">End: {formatValue(lastValue)}</p>
      </div>

      <div className="mt-4 overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height + 28}`} className="h-48 min-w-[640px] w-full">
          <line x1="0" y1={height} x2={width} y2={height} stroke="var(--line)" strokeWidth="2" />
          <path d={path} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
          {values.map((value, index) => {
            const x = values.length > 1 ? (index / (values.length - 1)) * width : width / 2;
            const y = height - (value / maxValue) * height;
            if (index % Math.max(1, Math.floor(values.length / 14)) !== 0 && index !== values.length - 1) {
              return null;
            }

            return (
              <g key={`${title}-${index}`}>
                <circle cx={x} cy={y} r="4" fill={color} />
              </g>
            );
          })}
          <text x="0" y={height + 20} fill="var(--muted)" fontSize="12">
            Open
          </text>
          <text x={width - 28} y={height + 20} fill="var(--muted)" fontSize="12">
            Close
          </text>
        </svg>
      </div>
    </div>
  );
}

function GanttChart({ run }: { run: SimulationRun }) {
  const width = 960;
  const rowHeight = 46;
  const leftPad = 88;
  const chartHeight = run.profile.tellers * rowHeight + 28;
  const palette = ["#0f766e", "#1d4ed8", "#b45309", "#be123c", "#6d28d9", "#166534"];

  return (
    <div className="shell-card rise-in p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="kicker text-[var(--accent-alt)]">Graphical View</p>
          <h3 className="title-main mt-2 text-2xl">Bank Teller Gantt Chart</h3>
          <p className="muted mt-2 text-sm">
            Service windows by teller, inspired by the hospital module&apos;s timeline view.
          </p>
        </div>
        <div className="label-chip">Run length {run.closingMinute} min</div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <svg viewBox={`0 0 ${width + leftPad} ${chartHeight + 40}`} className="min-w-[1048px] w-full">
          {Array.from({ length: run.profile.tellers }, (_, tellerIndex) => {
            const y = tellerIndex * rowHeight + 26;
            return (
              <g key={`row-${tellerIndex}`}>
                <text x="0" y={y + 18} fill="var(--foreground)" fontSize="13" fontWeight="600">
                  Teller {tellerIndex + 1}
                </text>
                <line
                  x1={leftPad}
                  y1={y + 22}
                  x2={leftPad + width}
                  y2={y + 22}
                  stroke="var(--line)"
                  strokeDasharray="4 6"
                />
              </g>
            );
          })}

          {run.segments.map((segment) => {
            const y = (segment.tellerId - 1) * rowHeight + 8;
            const x = leftPad + (segment.startMinute / Math.max(run.closingMinute, 1)) * width;
            const barWidth = Math.max(8, ((segment.endMinute - segment.startMinute) / Math.max(run.closingMinute, 1)) * width);
            const color = palette[(segment.customerId - 1) % palette.length];

            return (
              <g key={`segment-${segment.customerId}`}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height="28"
                  rx="8"
                  fill={color}
                  opacity="0.92"
                />
                <text
                  x={x + clamp(barWidth / 2, 16, barWidth - 8)}
                  y={y + 18}
                  textAnchor="middle"
                  fill="white"
                  fontSize="11"
                  fontWeight="700"
                >
                  C{segment.customerId}
                </text>
                <title>
                  {`Customer ${segment.customerId} | Teller ${segment.tellerId} | ${segment.serviceMinutes} min`}
                </title>
              </g>
            );
          })}

          <text x={leftPad} y={chartHeight + 28} fill="var(--muted)" fontSize="12">
            Branch opens
          </text>
          <text x={leftPad + width - 72} y={chartHeight + 28} fill="var(--muted)" fontSize="12">
            End of run
          </text>
        </svg>
      </div>
    </div>
  );
}

export default function BankSimulationPanel() {
  const [selectedProfileId, setSelectedProfileId] = useState(branchProfiles[0].id);
  const [activeTab, setActiveTab] = useState<TabKey>("summary");
  const [run, setRun] = useState<SimulationRun>(() => runBankSimulation(branchProfiles[0]));

  const selectedProfile =
    branchProfiles.find((profile) => profile.id === selectedProfileId) ?? branchProfiles[0];

  const rerun = () => {
    setRun(runBankSimulation(selectedProfile));
  };

  const selectProfile = (profileId: string) => {
    const profile = branchProfiles.find((entry) => entry.id === profileId) ?? branchProfiles[0];
    setSelectedProfileId(profile.id);
    setRun(runBankSimulation(profile));
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="space-y-5">
        <div className="shell-card rise-in p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="kicker text-[var(--accent)]">Branch Setup</p>
              <h2 className="title-main mt-2 text-2xl">Bank Simulation</h2>
              <p className="muted mt-2 text-sm">
                Teller-floor simulation rebuilt in the richer module style with tables, metrics, and charts.
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
                  onClick={() => selectProfile(profile.id)}
                  className={`nav-btn text-left ${active ? "nav-btn-active" : ""}`}
                >
                  <div>
                    <p className="font-semibold">{profile.name}</p>
                    <p className="muted mt-1 text-sm">{profile.location}</p>
                    <p className="muted mt-2 text-xs">
                      {profile.tellers} tellers, queue cap {profile.queueLimit}, average service {profile.serviceMinutes.toFixed(1)} min
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={rerun}
            className="btn-main mt-5 inline-flex items-center justify-center gap-2"
          >
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

          <div className="mt-4 rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-4">
            <p className="kicker text-[var(--accent-alt)]">Module Flow</p>
            <p className="muted mt-2 text-sm">
              Select a branch, run the simulation, then inspect event records, teller performance, and graphical charts just like the richer standalone module flow.
            </p>
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
                Detailed bank run with the current project&apos;s branch assumptions and a hospital-module-style output layout.
              </p>
            </div>
            <div className="label-chip">
              <span className="status-live blink-soft" />
              Branch day simulated
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
            <div className="metric-tile">
              <p className="kicker muted">Customers Arrived</p>
              <p className="metric-value text-[var(--accent)]">{run.totalArrivals}</p>
            </div>
            <div className="metric-tile">
              <p className="kicker muted">Customers Served</p>
              <p className="metric-value text-[var(--success)]">{run.totalServed}</p>
            </div>
            <div className="metric-tile">
              <p className="kicker muted">Abandoned</p>
              <p className="metric-value text-[var(--danger)]">{run.totalAbandoned}</p>
            </div>
            <div className="metric-tile">
              <p className="kicker muted">Peak Queue</p>
              <p className="metric-value text-[var(--accent-alt)]">{run.peakQueue}</p>
            </div>
            <div className="metric-tile">
              <p className="kicker muted">Average Wait</p>
              <p className="metric-value text-[var(--accent-alt)]">{run.averageWait.toFixed(1)} min</p>
            </div>
            <div className="metric-tile">
              <p className="kicker muted">Average Response</p>
              <p className="metric-value text-[var(--accent)]">{run.averageResponse.toFixed(1)} min</p>
            </div>
            <div className="metric-tile">
              <p className="kicker muted">Average Turnaround</p>
              <p className="metric-value text-[var(--success)]">{run.averageTurnaround.toFixed(1)} min</p>
            </div>
            <div className="metric-tile">
              <p className="kicker muted">Teller Utilization</p>
              <p className="metric-value text-[var(--success)]">{(run.utilization * 100).toFixed(1)}%</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {tabItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`nav-btn inline-flex items-center gap-2 ${active ? "nav-btn-active" : ""}`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {activeTab === "summary" ? (
          <>
            <div className="shell-card rise-in p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-[var(--accent)]" />
                <h3 className="title-main text-xl">Branch Summary</h3>
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
                <BarChart3 className="h-5 w-5 text-[var(--accent)]" />
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
                  {(run.totalServed / Math.max(run.totalArrivals, 1) * 100).toFixed(1)}% of visitors were completed before leaving or abandoning the queue.
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
          </>
        ) : null}

        {activeTab === "events" ? (
          <div className="shell-card rise-in p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <Table2 className="h-5 w-5 text-[var(--accent)]" />
              <h3 className="title-main text-xl">Event Table</h3>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-[980px] border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-left text-xs uppercase text-[var(--muted)]">
                    <th className="px-3">S.No</th>
                    <th className="px-3">Arrival</th>
                    <th className="px-3">Service</th>
                    <th className="px-3">Teller</th>
                    <th className="px-3">Start</th>
                    <th className="px-3">End</th>
                    <th className="px-3">Wait</th>
                    <th className="px-3">Response</th>
                    <th className="px-3">Turnaround</th>
                    <th className="px-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {run.customers.map((customer) => (
                    <tr key={customer.id} className="result-stat">
                      <td className="px-3 py-3 text-sm font-semibold">{customer.id}</td>
                      <td className="px-3 py-3 text-sm">{customer.arrivalLabel}</td>
                      <td className="px-3 py-3 text-sm">{customer.serviceMinutes} min</td>
                      <td className="px-3 py-3 text-sm">{customer.tellerId ?? "-"}</td>
                      <td className="px-3 py-3 text-sm">{formatMinuteLabel(run.profile, customer.startMinute)}</td>
                      <td className="px-3 py-3 text-sm">{formatMinuteLabel(run.profile, customer.endMinute)}</td>
                      <td className="px-3 py-3 text-sm">{customer.queueWait} min</td>
                      <td className="px-3 py-3 text-sm">
                        {customer.responseMinutes !== null ? `${customer.responseMinutes} min` : "-"}
                      </td>
                      <td className="px-3 py-3 text-sm">
                        {customer.turnaroundMinutes !== null ? `${customer.turnaroundMinutes} min` : "-"}
                      </td>
                      <td className="px-3 py-3 text-sm">
                        {customer.status === "served"
                          ? "Served"
                          : customer.status === "abandoned_queue_limit"
                            ? "Queue Full"
                            : "Patience Expired"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {activeTab === "performance" ? (
          <div className="shell-card rise-in p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-[var(--accent)]" />
              <h3 className="title-main text-xl">Teller Performance</h3>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-left text-xs uppercase text-[var(--muted)]">
                    <th className="px-3">Teller</th>
                    <th className="px-3">Served</th>
                    <th className="px-3">Avg Turnaround</th>
                    <th className="px-3">Avg Wait</th>
                    <th className="px-3">Avg Response</th>
                    <th className="px-3">Busy Minutes</th>
                    <th className="px-3">Utilization</th>
                  </tr>
                </thead>
                <tbody>
                  {run.tellerPerformance.map((teller) => (
                    <tr key={teller.tellerId} className="result-stat">
                      <td className="px-3 py-3 text-sm font-semibold">Teller {teller.tellerId}</td>
                      <td className="px-3 py-3 text-sm">{teller.customersServed}</td>
                      <td className="px-3 py-3 text-sm">{teller.avgTurnaround.toFixed(1)} min</td>
                      <td className="px-3 py-3 text-sm">{teller.avgWait.toFixed(1)} min</td>
                      <td className="px-3 py-3 text-sm">{teller.avgResponse.toFixed(1)} min</td>
                      <td className="px-3 py-3 text-sm">{teller.busyMinutes.toFixed(0)}</td>
                      <td className="px-3 py-3 text-sm">{(teller.utilization * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {activeTab === "graphs" ? (
          <>
            <GanttChart run={run} />

            <div className="grid gap-5 lg:grid-cols-2">
              <MiniTrendChart
                title="Queue Length vs Time"
                values={run.queueSeries}
                color="#1d4ed8"
                formatValue={(value) => `${value.toFixed(0)} in queue`}
              />
              <MiniTrendChart
                title="Teller Utilization vs Time"
                values={run.utilizationSeries}
                color="#0f766e"
                formatValue={(value) => `${(value * 100).toFixed(0)}% busy`}
              />
            </div>
          </>
        ) : null}
      </section>
    </div>
  );
}
