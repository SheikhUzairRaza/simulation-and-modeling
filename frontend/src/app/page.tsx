"use client";
import MM1Simulator from "@/components/MM1Simulator";
import { useState, FormEvent } from "react";
import { Toaster, toast } from "react-hot-toast";
import { CheckCircle2, Menu, X, WandSparkles } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import ModelSelector from "@/components/ModelSelector";
import InputForm from "@/components/InputForm";
import ResultsPanel, { SimulationResults } from "@/components/ResultsPanel";
import ThemeToggle from "@/components/ThemeToggle";
import BankSimulationPanel from "@/components/BankSimulationPanel";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"models" | "simulator">("models");
  const [selectedModel, setSelectedModel] = useState("");
  const [numberOfServers, setNumberOfServers] = useState(2);
  const [meanInterarrivalTime, setMeanInterarrivalTime] = useState("");
  const [meanServiceTime, setMeanServiceTime] = useState("");
  const [interarrivalTimeStandardDeviation, setInterarrivalTimeStandardDeviation] = useState("");
  const [serviceTimeStandardDeviation, setServiceTimeStandardDeviation] = useState("");
  const [results, setResults] = useState<SimulationResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const getEndpointForModel = (model: string) => {
    switch (model) {
      case "M/M/1":
        return "/api/simulation/mm1";
      case "M/G/1":
        return "/api/simulation/mg1";
      case "G/G/1":
        return "/api/simulation/gg1";
      case "M/M/s":
        return "/api/simulation/mms";
      case "M/G/s":
        return "/api/simulation/mgs";
      case "G/G/s":
        return "/api/simulation/ggs";
      default:
        return null;
    }
  };

  const buildRequestBody = (model: string, interarrivalTime: number, serviceTime: number) => {
    switch (model) {
      case "M/M/1":
        return {
          meanInterarrivalTime: interarrivalTime,
          meanServiceTime: serviceTime,
        };
      case "M/G/1":
        return {
          meanInterarrivalTime: interarrivalTime,
          meanServiceTime: serviceTime,
          serviceTimeStandardDeviation: parseFloat(serviceTimeStandardDeviation),
        };
      case "G/G/1":
        return {
          meanInterarrivalTime: interarrivalTime,
          meanServiceTime: serviceTime,
          interarrivalTimeStandardDeviation: parseFloat(interarrivalTimeStandardDeviation),
          serviceTimeStandardDeviation: parseFloat(serviceTimeStandardDeviation),
        };
      case "M/M/s":
        return {
          meanInterarrivalTime: interarrivalTime,
          meanServiceTime: serviceTime,
          numberOfServers,
        };
      case "M/G/s":
        return {
          meanInterarrivalTime: interarrivalTime,
          meanServiceTime: serviceTime,
          serviceTimeStandardDeviation: parseFloat(serviceTimeStandardDeviation),
          numberOfServers,
        };
      case "G/G/s":
        return {
          meanInterarrivalTime: interarrivalTime,
          meanServiceTime: serviceTime,
          interarrivalTimeStandardDeviation: parseFloat(interarrivalTimeStandardDeviation),
          serviceTimeStandardDeviation: parseFloat(serviceTimeStandardDeviation),
          numberOfServers,
        };
      default:
        return null;
    }
  };

  const runSimulation = async (e: FormEvent) => {
    e.preventDefault();

    if (!selectedModel || !meanInterarrivalTime || !meanServiceTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    const interarrivalTime = parseFloat(meanInterarrivalTime);
    const serviceTime = parseFloat(meanServiceTime);

    if (interarrivalTime <= 0 || serviceTime <= 0) {
      toast.error("Times must be positive numbers");
      return;
    }

    if (
      (selectedModel === "M/G/1" ||
        selectedModel === "G/G/1" ||
        selectedModel === "M/G/s" ||
        selectedModel === "G/G/s") &&
      (!serviceTimeStandardDeviation || parseFloat(serviceTimeStandardDeviation) < 0)
    ) {
      toast.error("Service time standard deviation must be zero or greater");
      return;
    }

    if (
      (selectedModel === "G/G/1" || selectedModel === "G/G/s") &&
      (!interarrivalTimeStandardDeviation || parseFloat(interarrivalTimeStandardDeviation) < 0)
    ) {
      toast.error("Interarrival time standard deviation must be zero or greater");
      return;
    }

    if (
      (selectedModel === "M/M/s" || selectedModel === "M/G/s" || selectedModel === "G/G/s") &&
      numberOfServers <= 0
    ) {
      toast.error("Number of servers must be at least 1");
      return;
    }

    const endpoint = getEndpointForModel(selectedModel);
    if (!endpoint) {
      toast.error(`${selectedModel} is not available in the backend yet.`);
      return;
    }

    const requestBody = buildRequestBody(selectedModel, interarrivalTime, serviceTime);
    if (!requestBody) {
      toast.error("Unable to build the request for this model.");
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = "http://localhost:5196";
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Simulation failed");
        setIsLoading(false);
        return;
      }

      const data = await response.json();

      const apiResults: SimulationResults = {
        lambda: data.lambda,
        mu: data.mu,
        rho: data.rho,
        Lq: data.lq,
        Wq: data.wq,
        L: data.l,
        W: data.w,
        idleProbability: data.idleProbability,
      };

      setResults(apiResults);
      setIsLoading(false);
      toast.success("Queue analysis complete.");
    } catch (error) {
      console.error("Error:", error);
      toast.error("API connection failed.");
      setIsLoading(false);
    }
  };

  return (
    <div className="root-stage">
      <Toaster
        position="top-right"
        toastOptions={{
          className: "sim-toast",
          duration: 4200,
          success: {
            className: "sim-toast sim-toast-success",
            icon: <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />,
          },
        }}
      />

      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="relative min-h-screen px-4 pb-10 pt-4 sm:px-6 sm:pt-6 lg:pl-[21.5rem] lg:pr-8">
        <header className="shell-card rise-in px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="btn-ghost lg:hidden"
                aria-label="Toggle menu"
              >
                {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

              <div className="min-w-0">
                <p className="label-chip mb-2">
                  <span className="status-live blink-soft" /> Session active
                </p>
                <h1 className="title-main truncate text-2xl sm:text-3xl">
                  {activeTab === "models" ? "Queueing Command Center" : "Bank Branch Simulator"}
                </h1>
                <p className="muted mt-1 text-sm sm:text-base">
                  {activeTab === "models"
                    ? "Build an input profile and compute queue metrics instantly."
                    : "Run a realistic teller-floor replica using branch traffic and staffing patterns."}
                </p>
              </div>
            </div>

            <ThemeToggle />
          </div>
        </header>

        <main className="mt-5">
          {activeTab === "models" ? (
            <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
              <section className="space-y-5">
                <ModelSelector
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                  numberOfServers={numberOfServers}
                  onServersChange={setNumberOfServers}
                />

                <InputForm
                  meanInterarrivalTime={meanInterarrivalTime}
                  meanServiceTime={meanServiceTime}
                  interarrivalTimeStandardDeviation={interarrivalTimeStandardDeviation}
                  serviceTimeStandardDeviation={serviceTimeStandardDeviation}
                  numberOfServers={numberOfServers}
                  onMeanInterarrivalTimeChange={setMeanInterarrivalTime}
                  onMeanServiceTimeChange={setMeanServiceTime}
                  onInterarrivalTimeStandardDeviationChange={setInterarrivalTimeStandardDeviation}
                  onServiceTimeStandardDeviationChange={setServiceTimeStandardDeviation}
                  onSubmit={runSimulation}
                  isLoading={isLoading}
                  selectedModel={selectedModel}
                />
              </section>

              <section className="space-y-5">
                {results ? (
                  <ResultsPanel results={results} />
                ) : (
                  <div className="shell-card rise-in p-8 sm:p-10">
                    <div className="inline-flex rounded-2xl border-2 border-[var(--line)] bg-[var(--panel)] p-4">
                      <WandSparkles className="h-7 w-7 text-[var(--accent)]" />
                    </div>
                    <h2 className="title-main mt-5 text-2xl">No Results Yet</h2>
                    <p className="muted mt-3 max-w-prose text-sm sm:text-base">
                      Select a model, provide interarrival and service timings, then run the solver to populate performance indicators.
                    </p>
                  </div>
                )}
              </section>
            </div>
       ) : (
            <div className="space-y-10">
              {/* This shows your bank branch simulation */}
              <BankSimulationPanel />
              
              {/* This adds the new MM1 ATM Simulator & Gantt Chart below it */}
              <div className="border-t border-[var(--line)] pt-10">
                <div className="px-4 mb-6">
                  <h2 className="title-main text-3xl">ATM Discrete Simulator</h2>
                  <p className="muted mt-2">M/M/1 simulation trace with visual Gantt chart tracking.</p>
                </div>
                <MM1Simulator />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
