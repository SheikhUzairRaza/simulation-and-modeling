"use client";

import { useState, FormEvent } from "react";
import { Toaster, toast } from "react-hot-toast";
import { Menu, X } from "lucide-react";
import Sidebar, { AppTab } from "@/components/Sidebar";
import InputForm from "@/components/InputForm";
import ResultsPanel, { SimulationResults } from "@/components/ResultsPanel";
import ThemeToggle from "@/components/ThemeToggle";

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

  if (servers > 1) {
    return `${arrival}/${service}/s`;
  }

  return `${arrival}/${service}/1`;
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

export default function QueueingModelsPage() {
  const [activeTab, setActiveTab] = useState<AppTab>("models");
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
  // G/G/1 arrival spread state
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
  // G/G/1 service spread state (replaces ca/cs direct entry)
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleModeChange = (nextMode: "manual" | "auto") => {
    setMode(nextMode);
    if (nextMode === "auto" && arrivalProcessType === "interArrival" && arrivalDistribution !== "Exponential" && serviceDistribution === "Exponential") {
      setServiceDistribution("Uniform");
    }
  };

  const handleArrivalDistributionChange = (value: string) => {
    setArrivalDistribution(value);
    if (mode === "auto" && arrivalProcessType === "interArrival" && value !== "Exponential" && serviceDistribution === "Exponential") {
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

    const getEffMode = (dist: string, currentMode: string) => {
      if (mode === "manual") return currentMode;
      if (dist === "Uniform") return "minMax";
      if (dist === "Normal") return "meanSpread";
      if (dist === "Gamma") return currentMode === "thetaK" ? "thetaK" : "meanSpread";
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
          toast.error(
            "Please provide valid positive min and max service times.",
          );
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
            toast.error("Please provide a valid positive service rate (μ).");
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

      // When rate (μ) is entered directly, convert to service time in minutes: 1 / (rate per minute)
      const normalizedServiceTime =
        serviceInputType === "rate" && parsedServiceRate
          ? 1 / convertRateToPerMinute(parsedServiceRate, serviceRateUnit)
          : effMgSvcMode === "meanSpread" && parsedServiceTime
            ? convertDurationToMinutes(parsedServiceTime, serviceTimeUnit)
            : effMgSvcMode === "thetaK" && parsedServiceK && parsedServiceTheta
              ? convertDurationToMinutes(parsedServiceK * parsedServiceTheta, serviceTimeUnit)
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
        effectiveModel.startsWith("M/G/") && effMgSvcMode === "meanSpread" && serviceSpreadValue
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

      // Compute Ca² and Cs² for G/G/1 from spread inputs
      let computedCa: number | undefined;
      let computedCs: number | undefined;
      if (effectiveModel.startsWith("G/G/")) {
        // Arrival Ca²
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
              : convertDurationToMinutes(
                  parseFloat(arrivalValue),
                  arrivalTimeUnit,
                );
          const aVar =
            arrivalSpreadType === "variance"
              ? arrSpreadVal * Math.pow(minutesPerUnit[arrivalTimeUnit], 2)
              : Math.pow(arrSpreadVal * minutesPerUnit[arrivalTimeUnit], 2);
          computedCa = aVar / Math.pow(aMean, 2);
        }
        // Service Cs²
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
              : convertDurationToMinutes(
                  parseFloat(serviceTime),
                  serviceTimeUnit,
                );
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
          (effMgSvcMode === "meanSpread" || effMgSvcMode === "thetaK") ? normalizedServiceTime : undefined,
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
      } else if (effectiveModel.startsWith("G/G/") && effArrMode === "thetaK" && parsedArrivalK && parsedArrivalTheta) {
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
      } else if (effectiveModel.startsWith("G/G/") && effSvcMode === "thetaK" && parsedServiceK && parsedServiceTheta) {
        payload.serviceTime = convertDurationToMinutes(
          parsedServiceK * parsedServiceTheta,
          serviceTimeUnit,
        );
      }

      const response = await fetch(`${apiUrl}/api/queue/calculate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Simulation failed");
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
      toast.success("Simulation completed successfully!");
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        "API Connection failed. Please ensure the backend is running and accessible.",
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      <Toaster position="top-right" />

      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 lg:ml-72 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 py-4 shadow-sm transition-colors">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 
                         hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                aria-label="Toggle menu"
              >
                {isSidebarOpen ? (
                  <X className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                ) : (
                  <Menu className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                )}
              </button>

              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  Queueing Models
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Clean configuration and live results for queueing analysis.
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6 pb-12">
            <div className="rounded-[2rem] border border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] p-6 sm:p-8">
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-500">
                  Queueing Models
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  Queueing Models
                </h2>
                <p className="max-w-2xl text-sm sm:text-base text-slate-500 dark:text-slate-400">
                  Simple queue analysis dashboard.
                </p>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
              <div className="space-y-6">
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

              <div className="space-y-6">
                <ResultsPanel results={results} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
