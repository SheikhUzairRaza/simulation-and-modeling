"use client";

import { FormEvent, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import {
  Activity,
  BarChart3,
  SlidersHorizontal,
  Menu,
} from "lucide-react";
import InputForm from "@/components/InputForm";
import ResultsPanel, { SimulationResults } from "@/components/ResultsPanel";
import ThemeToggle from "@/components/ThemeToggle";
import Sidebar, { AppTab } from "@/components/Sidebar";

type TimeUnit = "seconds" | "minutes" | "hours";

const minutesPerUnit: Record<TimeUnit, number> = {
  seconds: 1 / 60,
  minutes: 1,
  hours: 60,
};

function convertDurationToMinutes(value: number, unit: TimeUnit): number {
  return value * minutesPerUnit[unit];
}

function convertRateToPerMinute(value: number, unit: TimeUnit): number {
  return value / minutesPerUnit[unit];
}

function convertMinutesToUnit(value: number, unit: TimeUnit): number {
  return value / minutesPerUnit[unit];
}

function detectModel(
  arrivalDistribution: string,
  serviceDistribution: string,
  servers: number,
): string {
  if (!arrivalDistribution || !serviceDistribution || servers < 1) {
    return "";
  }

  const arrival =
    arrivalDistribution === "Poisson" || arrivalDistribution === "Exponential"
      ? "M"
      : "G";
  const service = serviceDistribution === "Exponential" ? "M" : "G";

  return servers > 1 ? `${arrival}/${service}/s` : `${arrival}/${service}/1`;
}

function resolveManualModel(selectedModel: string, servers: number): string {
  if (!selectedModel) {
    return "";
  }

  if (selectedModel === "M/M/s") {
    return servers >= 1 ? "M/M/s" : "";
  }

  return selectedModel;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<AppTab>("models");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mode, setMode] = useState<"manual" | "auto">("manual");
  const [manualServerMode, setManualServerMode] = useState<"single" | "multi">(
    "single",
  );
  const [selectedModel, setSelectedModel] = useState("M/M/1");
  const [arrivalProcessType, setArrivalProcessType] = useState<
    "arrival" | "interArrival"
  >("arrival");
  const [arrivalDistribution, setArrivalDistribution] = useState("Poisson");
  const [serviceDistribution, setServiceDistribution] = useState("Exponential");
  const [arrivalInputType, setArrivalInputType] = useState<
    "rate" | "meanInterArrival"
  >("rate");
  const [arrivalTimeUnit, setArrivalTimeUnit] = useState<TimeUnit>("minutes");
  const [arrivalValue, setArrivalValue] = useState("");
  const [serviceInputType, setServiceInputType] = useState<"rate" | "mean">(
    "mean",
  );
  const [serviceRateValue, setServiceRateValue] = useState("");
  const [serviceRateUnit, setServiceRateUnit] = useState<TimeUnit>("minutes");
  const [serviceTimeUnit, setServiceTimeUnit] = useState<TimeUnit>("minutes");
  const [serviceTime, setServiceTime] = useState("");
  const [serviceInputMode, setServiceInputMode] = useState<
    "meanSpread" | "minMax" | "thetaK"
  >("meanSpread");
  const [serviceSpreadType, setServiceSpreadType] = useState<
    "variance" | "stdDev"
  >("variance");
  const [serviceSpreadValue, setServiceSpreadValue] = useState("");
  const [serviceMinTime, setServiceMinTime] = useState("");
  const [serviceMaxTime, setServiceMaxTime] = useState("");
  const [serviceGammaTheta, setServiceGammaTheta] = useState("");
  const [serviceGammaK, setServiceGammaK] = useState("");
  const [servers, setServers] = useState(1);
  const [arrivalInputMode, setArrivalInputMode] = useState<
    "meanSpread" | "minMax" | "thetaK"
  >("meanSpread");
  const [arrivalSpreadType, setArrivalSpreadType] = useState<
    "variance" | "stdDev"
  >("variance");
  const [arrivalSpreadValue, setArrivalSpreadValue] = useState("");
  const [arrivalMinTime, setArrivalMinTime] = useState("");
  const [arrivalMaxTime, setArrivalMaxTime] = useState("");
  const [arrivalGammaTheta, setArrivalGammaTheta] = useState("");
  const [arrivalGammaK, setArrivalGammaK] = useState("");
  const [ggServiceInputMode, setGgServiceInputMode] = useState<
    "meanSpread" | "minMax" | "thetaK"
  >("meanSpread");
  const [ggServiceSpreadType, setGgServiceSpreadType] = useState<
    "variance" | "stdDev"
  >("variance");
  const [ggServiceSpreadValue, setGgServiceSpreadValue] = useState("");
  const [ggServiceMinTime, setGgServiceMinTime] = useState("");
  const [ggServiceMaxTime, setGgServiceMaxTime] = useState("");
  const [resultTimeUnit, setResultTimeUnit] = useState<TimeUnit>("minutes");
  const [results, setResults] = useState<SimulationResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleModeChange = (nextMode: "manual" | "auto") => {
    setMode(nextMode);
    if (
      nextMode === "auto" &&
      arrivalProcessType === "interArrival" &&
      arrivalDistribution !== "Exponential" &&
      serviceDistribution === "Exponential"
    ) {
      setServiceDistribution("Uniform");
    }
  };

  const handleArrivalDistributionChange = (value: string) => {
    setArrivalDistribution(value);
    if (
      mode === "auto" &&
      arrivalProcessType === "interArrival" &&
      value !== "Exponential" &&
      serviceDistribution === "Exponential"
    ) {
      setServiceDistribution("Uniform");
    }
  };

  const handleArrivalProcessTypeChange = (
    value: "arrival" | "interArrival",
  ) => {
    setArrivalProcessType(value);
    if (value === "arrival") {
      setArrivalDistribution("Poisson");
    } else {
      setArrivalDistribution("Exponential");
    }
  };

  const handleManualServerModeChange = (value: "single" | "multi") => {
    setManualServerMode(value);

    if (value === "single") {
      setServers(1);
      if (selectedModel === "M/M/s") {
        setSelectedModel("M/M/1");
      } else if (selectedModel === "M/G/s") {
        setSelectedModel("M/G/1");
      } else if (selectedModel === "G/G/s") {
        setSelectedModel("G/G/1");
      }
      return;
    }

    if (servers < 2) {
      setServers(2);
    }

    if (selectedModel === "M/M/1") {
      setSelectedModel("M/M/s");
    } else if (selectedModel === "M/G/1") {
      setSelectedModel("M/G/s");
    } else if (selectedModel === "G/G/1") {
      setSelectedModel("G/G/s");
    }
  };

  const effectiveModel =
    mode === "manual"
      ? resolveManualModel(selectedModel, servers)
      : detectModel(arrivalDistribution, serviceDistribution, servers);

  const runSimulation = async (e: FormEvent) => {
    e.preventDefault();

    if (!effectiveModel) {
      toast.error("Current selection does not map to a supported model.");
      return;
    }

    const getEffMode = (distribution: string, currentMode: string) => {
      if (mode === "manual") return currentMode;
      if (distribution === "Uniform") return "minMax";
      if (distribution === "Normal") return "meanSpread";
      if (distribution === "Gamma")
        return currentMode === "thetaK" ? "thetaK" : "meanSpread";
      return currentMode;
    };

    const effArrMode = getEffMode(arrivalDistribution, arrivalInputMode);
    const effMgSvcMode = getEffMode(serviceDistribution, serviceInputMode);
    const effSvcMode = getEffMode(serviceDistribution, ggServiceInputMode);

    if (!effectiveModel.startsWith("G/G/") || effArrMode !== "minMax") {
      if (!arrivalValue) {
        toast.error("Please fill in all required fields");
        return;
      }
    }

    const parsedArrival = parseFloat(arrivalValue);
    const parsedServiceRate =
      serviceInputType === "rate" ? parseFloat(serviceRateValue) : undefined;
    const parsedServiceTime =
      effMgSvcMode === "meanSpread" ? parseFloat(serviceTime) : undefined;
    const parsedServiceMin =
      effMgSvcMode === "minMax" ? parseFloat(serviceMinTime) : undefined;
    const parsedServiceMax =
      effMgSvcMode === "minMax" ? parseFloat(serviceMaxTime) : undefined;

    if (
      (!effectiveModel.startsWith("G/G/") || effArrMode !== "minMax") &&
      parsedArrival <= 0
    ) {
      toast.error("Inputs must be positive values");
      return;
    }

    if (servers < 1) {
      toast.error("Inputs must be positive values");
      return;
    }

    if (
      mode === "manual" &&
      servers > 1 &&
      selectedModel !== "M/M/s" &&
      selectedModel !== "M/G/s" &&
      selectedModel !== "G/G/s"
    ) {
      toast.error("Unsupported model selected for multi-server mode.");
      return;
    }

    if (!effectiveModel.startsWith("G/G/")) {
      if (effectiveModel.startsWith("M/G/") && effMgSvcMode === "minMax") {
        if (
          !serviceMinTime ||
          !serviceMaxTime ||
          !parsedServiceMin ||
          !parsedServiceMax ||
          parsedServiceMin <= 0 ||
          parsedServiceMax <= 0
        ) {
          toast.error("Please provide valid positive min and max service times.");
          return;
        }

        if (parsedServiceMax < parsedServiceMin) {
          toast.error(
            "Maximum service time must be greater than or equal to minimum service time.",
          );
          return;
        }
      } else {
        if (serviceInputType === "rate") {
          if (
            !serviceRateValue ||
            !parsedServiceRate ||
            parsedServiceRate <= 0
          ) {
            toast.error("Please provide a valid positive service rate.");
            return;
          }
        } else {
          if (!serviceTime || !parsedServiceTime || parsedServiceTime <= 0) {
            toast.error("Please provide a valid mean service time.");
            return;
          }
        }
      }
    }

    if (effectiveModel.startsWith("M/G/") && effMgSvcMode === "meanSpread") {
      if (!serviceSpreadValue || parseFloat(serviceSpreadValue) < 0) {
        toast.error(
          "Please provide a valid non-negative service variance or standard deviation for M/G models.",
        );
        return;
      }
    }

    if (effectiveModel.startsWith("G/G/")) {
      if (effArrMode === "minMax") {
        if (
          !arrivalMinTime ||
          !arrivalMaxTime ||
          parseFloat(arrivalMinTime) <= 0 ||
          parseFloat(arrivalMaxTime) <= 0
        ) {
          toast.error("Please provide valid min and max inter-arrival times.");
          return;
        }
      } else {
        if (!arrivalSpreadValue || parseFloat(arrivalSpreadValue) < 0) {
          toast.error(
            "Please provide a valid non-negative arrival spread (variance or std dev) for G/G models.",
          );
          return;
        }
      }

      if (effSvcMode === "minMax") {
        if (
          !ggServiceMinTime ||
          !ggServiceMaxTime ||
          parseFloat(ggServiceMinTime) <= 0 ||
          parseFloat(ggServiceMaxTime) <= 0
        ) {
          toast.error("Please provide valid min and max service times.");
          return;
        }
      } else {
        if (!ggServiceSpreadValue || parseFloat(ggServiceSpreadValue) < 0) {
          toast.error(
            "Please provide a valid non-negative service spread (variance or std dev) for G/G models.",
          );
          return;
        }
      }
    }

    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5196";

      const parsedServiceTheta = parseFloat(serviceGammaTheta);
      const parsedServiceK = parseFloat(serviceGammaK);
      const parsedArrivalTheta = parseFloat(arrivalGammaTheta);
      const parsedArrivalK = parseFloat(arrivalGammaK);

      const normalizedServiceTime =
        serviceInputType === "rate" && parsedServiceRate
          ? 1 / convertRateToPerMinute(parsedServiceRate, serviceRateUnit)
          : effMgSvcMode === "meanSpread" && parsedServiceTime
            ? convertDurationToMinutes(parsedServiceTime, serviceTimeUnit)
            : effMgSvcMode === "thetaK" && parsedServiceK && parsedServiceTheta
              ? convertDurationToMinutes(
                  parsedServiceK * parsedServiceTheta,
                  serviceTimeUnit,
                )
              : undefined;

      const normalizedServiceMin =
        effMgSvcMode === "minMax" && parsedServiceMin
          ? convertDurationToMinutes(parsedServiceMin, serviceTimeUnit)
          : undefined;
      const normalizedServiceMax =
        effMgSvcMode === "minMax" && parsedServiceMax
          ? convertDurationToMinutes(parsedServiceMax, serviceTimeUnit)
          : undefined;

      const spreadValue =
        effectiveModel.startsWith("M/G/") &&
        effMgSvcMode === "meanSpread" &&
        serviceSpreadValue
          ? parseFloat(serviceSpreadValue)
          : undefined;

      const normalizedVariance =
        effMgSvcMode === "thetaK" && parsedServiceK && parsedServiceTheta
          ? parsedServiceK * Math.pow(parsedServiceTheta * minutesPerUnit[serviceTimeUnit], 2)
          : spreadValue !== undefined && serviceSpreadType === "variance"
            ? spreadValue * Math.pow(minutesPerUnit[serviceTimeUnit], 2)
            : undefined;

      const normalizedStdDev =
        spreadValue !== undefined && serviceSpreadType === "stdDev"
          ? spreadValue * minutesPerUnit[serviceTimeUnit]
          : undefined;

      let computedCa: number | undefined;
      let computedCs: number | undefined;

      if (effectiveModel.startsWith("G/G/")) {
        if (effArrMode === "minMax") {
          const aMin = convertDurationToMinutes(
            parseFloat(arrivalMinTime),
            arrivalTimeUnit,
          );
          const aMax = convertDurationToMinutes(
            parseFloat(arrivalMaxTime),
            arrivalTimeUnit,
          );
          const aMean = (aMin + aMax) / 2.0;
          const aVar = Math.pow(aMax - aMin, 2) / 12.0;
          computedCa = aVar / Math.pow(aMean, 2);
        } else if (effArrMode === "thetaK" && parsedArrivalK) {
          computedCa = 1.0 / parsedArrivalK;
        } else {
          const arrSpreadVal = parseFloat(arrivalSpreadValue);
          const aMean =
            arrivalInputType === "rate"
              ? 1 /
                convertRateToPerMinute(
                  parseFloat(arrivalValue),
                  arrivalTimeUnit,
                )
              : convertDurationToMinutes(parseFloat(arrivalValue), arrivalTimeUnit);
          const aVar =
            arrivalSpreadType === "variance"
              ? arrSpreadVal * Math.pow(minutesPerUnit[arrivalTimeUnit], 2)
              : Math.pow(arrSpreadVal * minutesPerUnit[arrivalTimeUnit], 2);
          computedCa = aVar / Math.pow(aMean, 2);
        }

        if (effSvcMode === "minMax") {
          const sMin = convertDurationToMinutes(
            parseFloat(ggServiceMinTime),
            serviceTimeUnit,
          );
          const sMax = convertDurationToMinutes(
            parseFloat(ggServiceMaxTime),
            serviceTimeUnit,
          );
          const sMean = (sMin + sMax) / 2.0;
          const sVar = Math.pow(sMax - sMin, 2) / 12.0;
          computedCs = sVar / Math.pow(sMean, 2);
        } else if (effSvcMode === "thetaK" && parsedServiceK) {
          computedCs = 1.0 / parsedServiceK;
        } else {
          const svcSpreadVal = parseFloat(ggServiceSpreadValue);
          const sMean =
            serviceInputType === "rate"
              ? 1 /
                convertRateToPerMinute(
                  parseFloat(serviceRateValue),
                  serviceRateUnit,
                )
              : convertDurationToMinutes(parseFloat(serviceTime), serviceTimeUnit);
          const sVar =
            ggServiceSpreadType === "variance"
              ? svcSpreadVal * Math.pow(minutesPerUnit[serviceTimeUnit], 2)
              : Math.pow(svcSpreadVal * minutesPerUnit[serviceTimeUnit], 2);
          computedCs = sVar / Math.pow(sMean, 2);
        }
      }

      const payload: Record<string, unknown> = {
        autoDetectModel: mode === "auto",
        model:
          mode === "manual"
            ? selectedModel === "M/M/1" || selectedModel === "M/M/s"
              ? "M/M/s"
              : selectedModel === "M/G/1" || selectedModel === "M/G/s"
                ? servers > 1
                  ? "M/G/s"
                  : "M/G/1"
                : selectedModel === "G/G/1" || selectedModel === "G/G/s"
                  ? servers > 1
                    ? "G/G/s"
                    : "G/G/1"
                  : undefined
            : undefined,
        arrivalDistribution: mode === "auto" ? arrivalDistribution : undefined,
        serviceDistribution: mode === "auto" ? serviceDistribution : undefined,
        serviceTime:
          effMgSvcMode === "meanSpread" || effMgSvcMode === "thetaK"
            ? normalizedServiceTime
            : undefined,
        serviceMinTime:
          effMgSvcMode === "minMax" ? normalizedServiceMin : undefined,
        serviceMaxTime:
          effMgSvcMode === "minMax" ? normalizedServiceMax : undefined,
        servers,
        variance:
          effectiveModel.startsWith("M/G/") &&
          (effMgSvcMode === "meanSpread" || effMgSvcMode === "thetaK") &&
          (serviceSpreadType === "variance" || effMgSvcMode === "thetaK")
            ? normalizedVariance
            : undefined,
        serviceStdDev:
          effectiveModel.startsWith("M/G/") &&
          effMgSvcMode === "meanSpread" &&
          serviceSpreadType === "stdDev"
            ? normalizedStdDev
            : undefined,
        ca: effectiveModel.startsWith("G/G/") ? computedCa : undefined,
        cs: effectiveModel.startsWith("G/G/") ? computedCs : undefined,
      };

      if (effectiveModel.startsWith("G/G/") && effArrMode === "minMax") {
        const aMin = convertDurationToMinutes(
          parseFloat(arrivalMinTime),
          arrivalTimeUnit,
        );
        const aMax = convertDurationToMinutes(
          parseFloat(arrivalMaxTime),
          arrivalTimeUnit,
        );
        payload.meanInterArrivalTime = (aMin + aMax) / 2.0;
      } else if (
        effectiveModel.startsWith("G/G/") &&
        effArrMode === "thetaK" &&
        parsedArrivalK &&
        parsedArrivalTheta
      ) {
        payload.meanInterArrivalTime = convertDurationToMinutes(
          parsedArrivalK * parsedArrivalTheta,
          arrivalTimeUnit,
        );
      } else if (arrivalInputType === "rate") {
        payload.arrivalRate = convertRateToPerMinute(
          parsedArrival,
          arrivalTimeUnit,
        );
      } else {
        payload.meanInterArrivalTime = convertDurationToMinutes(
          parsedArrival,
          arrivalTimeUnit,
        );
      }

      if (effectiveModel.startsWith("G/G/") && effSvcMode === "minMax") {
        const sMin = convertDurationToMinutes(
          parseFloat(ggServiceMinTime),
          serviceTimeUnit,
        );
        const sMax = convertDurationToMinutes(
          parseFloat(ggServiceMaxTime),
          serviceTimeUnit,
        );
        payload.serviceTime = (sMin + sMax) / 2.0;
      } else if (
        effectiveModel.startsWith("G/G/") &&
        effSvcMode === "thetaK" &&
        parsedServiceK &&
        parsedServiceTheta
      ) {
        payload.serviceTime = convertDurationToMinutes(
          parsedServiceK * parsedServiceTheta,
          serviceTimeUnit,
        );
      }

      const response = await fetch(`${apiUrl}/api/simulation/calculate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Calculation failed");
        setIsLoading(false);
        return;
      }

      const data = await response.json();

      const apiResults: SimulationResults = {
        model: data.model,
        rho: data.rho,
        Lq: data.lq,
        Wq: convertMinutesToUnit(data.wq, resultTimeUnit),
        L: data.l,
        W: convertMinutesToUnit(data.w, resultTimeUnit),
        P0: data.p0,
        timeUnit: resultTimeUnit,
      };

      setResults(apiResults);
      setIsLoading(false);
      toast.success("Calculation complete.");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to connect to the API.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen lg:pl-72">
      <Toaster position="top-right" />
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setSidebarOpen(false);
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="workspace-shell mx-auto min-h-screen max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-6 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] shadow-sm lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="hero-title text-4xl sm:text-5xl">Signal Room</h1>
          </div>
          <ThemeToggle />
        </header>

        {activeTab === "models" ? (
          <section className="space-y-6">
            <div className="section-shell">
              <div className="section-header">
                <div>
                  <p className="eyebrow">Input deck</p>
                  <h2 className="section-title">Parameter Studio</h2>
                </div>
                <SlidersHorizontal className="h-5 w-5 text-[var(--accent)]" />
              </div>

              <InputForm
                mode={mode}
                onModeChange={handleModeChange}
                manualServerMode={manualServerMode}
                onManualServerModeChange={handleManualServerModeChange}
                selectedModel={selectedModel}
                onSelectedModelChange={setSelectedModel}
                arrivalProcessType={arrivalProcessType}
                onArrivalProcessTypeChange={handleArrivalProcessTypeChange}
                arrivalDistribution={arrivalDistribution}
                serviceDistribution={serviceDistribution}
                onArrivalDistributionChange={handleArrivalDistributionChange}
                onServiceDistributionChange={setServiceDistribution}
                servers={servers}
                onServersChange={setServers}
                arrivalInputType={arrivalInputType}
                onArrivalInputTypeChange={setArrivalInputType}
                arrivalTimeUnit={arrivalTimeUnit}
                onArrivalTimeUnitChange={setArrivalTimeUnit}
                arrivalValue={arrivalValue}
                onArrivalValueChange={setArrivalValue}
                serviceInputType={serviceInputType}
                onServiceInputTypeChange={setServiceInputType}
                serviceRateValue={serviceRateValue}
                onServiceRateValueChange={setServiceRateValue}
                serviceRateUnit={serviceRateUnit}
                onServiceRateUnitChange={setServiceRateUnit}
                serviceTimeUnit={serviceTimeUnit}
                onServiceTimeUnitChange={setServiceTimeUnit}
                serviceTime={serviceTime}
                onServiceTimeChange={setServiceTime}
                serviceInputMode={serviceInputMode}
                onServiceInputModeChange={setServiceInputMode}
                serviceSpreadType={serviceSpreadType}
                onServiceSpreadTypeChange={setServiceSpreadType}
                serviceSpreadValue={serviceSpreadValue}
                onServiceSpreadValueChange={setServiceSpreadValue}
                serviceMinTime={serviceMinTime}
                onServiceMinTimeChange={setServiceMinTime}
                serviceMaxTime={serviceMaxTime}
                onServiceMaxTimeChange={setServiceMaxTime}
                serviceGammaTheta={serviceGammaTheta}
                onServiceGammaThetaChange={setServiceGammaTheta}
                serviceGammaK={serviceGammaK}
                onServiceGammaKChange={setServiceGammaK}
                arrivalInputMode={arrivalInputMode}
                onArrivalInputModeChange={setArrivalInputMode}
                arrivalSpreadType={arrivalSpreadType}
                onArrivalSpreadTypeChange={setArrivalSpreadType}
                arrivalSpreadValue={arrivalSpreadValue}
                onArrivalSpreadValueChange={setArrivalSpreadValue}
                arrivalMinTime={arrivalMinTime}
                onArrivalMinTimeChange={setArrivalMinTime}
                arrivalMaxTime={arrivalMaxTime}
                onArrivalMaxTimeChange={setArrivalMaxTime}
                arrivalGammaTheta={arrivalGammaTheta}
                onArrivalGammaThetaChange={setArrivalGammaTheta}
                arrivalGammaK={arrivalGammaK}
                onArrivalGammaKChange={setArrivalGammaK}
                ggServiceInputMode={ggServiceInputMode}
                onGgServiceInputModeChange={setGgServiceInputMode}
                ggServiceSpreadType={ggServiceSpreadType}
                onGgServiceSpreadTypeChange={setGgServiceSpreadType}
                ggServiceSpreadValue={ggServiceSpreadValue}
                onGgServiceSpreadValueChange={setGgServiceSpreadValue}
                ggServiceMinTime={ggServiceMinTime}
                onGgServiceMinTimeChange={setGgServiceMinTime}
                ggServiceMaxTime={ggServiceMaxTime}
                onGgServiceMaxTimeChange={setGgServiceMaxTime}
                resultTimeUnit={resultTimeUnit}
                onResultTimeUnitChange={setResultTimeUnit}
                effectiveModel={effectiveModel}
                onSubmit={runSimulation}
                isLoading={isLoading}
              />
            </div>

            {results ? (
              <ResultsPanel results={results} />
            ) : (
              <div className="section-shell">
                <div className="section-header">
                  <div>
                    <p className="eyebrow">Output bay</p>
                    <h2 className="section-title">Waiting for numbers</h2>
                  </div>
                  <BarChart3 className="h-5 w-5 text-[var(--accent-alt)]" />
                </div>
                <p className="section-copy mt-4">
                  Submit the form to render the queueing metrics here.
                </p>
              </div>
            )}
          </section>
        ) : (
          <section className="section-shell">
            <div className="section-header">
              <div>
                <p className="eyebrow">Simulator</p>
                <h2 className="section-title">Removed from backend</h2>
              </div>
              <Activity className="h-5 w-5 text-[var(--accent-alt)]" />
            </div>
            <p className="section-copy mt-4">
              The simulator area is kept in the sidebar for navigation, but the backend now only supports queueing model calculations.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
