"use client";

import type { ReactNode, FormEvent } from "react";
import { Loader2, Play, Sparkles } from "lucide-react";

type TimeUnit = "seconds" | "minutes" | "hours";

interface InputFormProps {
  mode: "manual" | "auto";
  onModeChange: (mode: "manual" | "auto") => void;
  manualServerMode: "single" | "multi";
  onManualServerModeChange: (value: "single" | "multi") => void;
  selectedModel: string;
  onSelectedModelChange: (model: string) => void;
  arrivalProcessType: "arrival" | "interArrival";
  onArrivalProcessTypeChange: (value: "arrival" | "interArrival") => void;
  arrivalDistribution: string;
  serviceDistribution: string;
  onArrivalDistributionChange: (value: string) => void;
  onServiceDistributionChange: (value: string) => void;
  servers: number;
  onServersChange: (value: number) => void;
  arrivalInputType: "rate" | "meanInterArrival";
  onArrivalInputTypeChange: (value: "rate" | "meanInterArrival") => void;
  arrivalTimeUnit: TimeUnit;
  onArrivalTimeUnitChange: (value: TimeUnit) => void;
  arrivalValue: string;
  onArrivalValueChange: (value: string) => void;
  serviceInputType: "rate" | "mean";
  onServiceInputTypeChange: (value: "rate" | "mean") => void;
  serviceRateValue: string;
  onServiceRateValueChange: (value: string) => void;
  serviceRateUnit: TimeUnit;
  onServiceRateUnitChange: (value: TimeUnit) => void;
  serviceTimeUnit: TimeUnit;
  onServiceTimeUnitChange: (value: TimeUnit) => void;
  serviceTime: string;
  onServiceTimeChange: (value: string) => void;
  serviceInputMode: "meanSpread" | "minMax" | "thetaK";
  onServiceInputModeChange: (value: "meanSpread" | "minMax" | "thetaK") => void;
  serviceSpreadType: "variance" | "stdDev";
  onServiceSpreadTypeChange: (value: "variance" | "stdDev") => void;
  serviceSpreadValue: string;
  onServiceSpreadValueChange: (value: string) => void;
  serviceMinTime: string;
  onServiceMinTimeChange: (value: string) => void;
  serviceMaxTime: string;
  onServiceMaxTimeChange: (value: string) => void;
  serviceGammaTheta: string;
  onServiceGammaThetaChange: (value: string) => void;
  serviceGammaK: string;
  onServiceGammaKChange: (value: string) => void;
  arrivalInputMode: "meanSpread" | "minMax" | "thetaK";
  onArrivalInputModeChange: (value: "meanSpread" | "minMax" | "thetaK") => void;
  arrivalSpreadType: "variance" | "stdDev";
  onArrivalSpreadTypeChange: (value: "variance" | "stdDev") => void;
  arrivalSpreadValue: string;
  onArrivalSpreadValueChange: (value: string) => void;
  arrivalMinTime: string;
  onArrivalMinTimeChange: (value: string) => void;
  arrivalMaxTime: string;
  onArrivalMaxTimeChange: (value: string) => void;
  arrivalGammaTheta: string;
  onArrivalGammaThetaChange: (value: string) => void;
  arrivalGammaK: string;
  onArrivalGammaKChange: (value: string) => void;
  ggServiceInputMode: "meanSpread" | "minMax" | "thetaK";
  onGgServiceInputModeChange: (value: "meanSpread" | "minMax" | "thetaK") => void;
  ggServiceSpreadType: "variance" | "stdDev";
  onGgServiceSpreadTypeChange: (value: "variance" | "stdDev") => void;
  ggServiceSpreadValue: string;
  onGgServiceSpreadValueChange: (value: string) => void;
  ggServiceMinTime: string;
  onGgServiceMinTimeChange: (value: string) => void;
  ggServiceMaxTime: string;
  onGgServiceMaxTimeChange: (value: string) => void;
  resultTimeUnit: TimeUnit;
  onResultTimeUnitChange: (value: TimeUnit) => void;
  effectiveModel: string;
  onSubmit: (e: FormEvent) => void;
  isLoading: boolean;
}

const timeUnitOptions: TimeUnit[] = ["seconds", "minutes", "hours"];

function optionLabel(unit: TimeUnit, variant: "rate" | "duration") {
  if (variant === "rate") {
    return unit === "seconds" ? "/ sec" : unit === "minutes" ? "/ min" : "/ hr";
  }
  return unit === "seconds" ? "sec" : unit === "minutes" ? "min" : "hr";
}

function SegmentedControl({
  value,
  options,
  onChange,
  disabled,
}: {
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="panel-strip">
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={`control-pill ${active ? "control-pill-active" : ""}`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function FieldCard({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="field-card">
      <div className="field-head">
        <p className="field-label">{label}</p>
        {hint ? <p className="field-hint">{hint}</p> : null}
      </div>
      {children}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  disabled,
  min = "0.0001",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  min?: string;
}) {
  return (
    <input
      type="number"
      step="any"
      min={min}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      placeholder={placeholder}
      className="field-input"
    />
  );
}

function UnitSelect({
  value,
  onChange,
  disabled,
  variant,
}: {
  value: TimeUnit;
  onChange: (value: TimeUnit) => void;
  disabled?: boolean;
  variant: "rate" | "duration";
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as TimeUnit)}
      disabled={disabled}
      className="field-select"
    >
      {timeUnitOptions.map((unit) => (
        <option key={unit} value={unit}>
          {optionLabel(unit, variant)}
        </option>
      ))}
    </select>
  );
}

export default function InputForm({
  mode,
  onModeChange,
  manualServerMode,
  onManualServerModeChange,
  selectedModel,
  onSelectedModelChange,
  arrivalProcessType,
  onArrivalProcessTypeChange,
  arrivalDistribution,
  serviceDistribution,
  onArrivalDistributionChange,
  onServiceDistributionChange,
  servers,
  onServersChange,
  arrivalInputType,
  onArrivalInputTypeChange,
  arrivalTimeUnit,
  onArrivalTimeUnitChange,
  arrivalValue,
  onArrivalValueChange,
  serviceInputType,
  onServiceInputTypeChange,
  serviceRateValue,
  onServiceRateValueChange,
  serviceRateUnit,
  onServiceRateUnitChange,
  serviceTimeUnit,
  onServiceTimeUnitChange,
  serviceTime,
  onServiceTimeChange,
  serviceInputMode,
  onServiceInputModeChange,
  serviceSpreadType,
  onServiceSpreadTypeChange,
  serviceSpreadValue,
  onServiceSpreadValueChange,
  serviceMinTime,
  onServiceMinTimeChange,
  serviceMaxTime,
  onServiceMaxTimeChange,
  serviceGammaTheta,
  onServiceGammaThetaChange,
  serviceGammaK,
  onServiceGammaKChange,
  arrivalInputMode,
  onArrivalInputModeChange,
  arrivalSpreadType,
  onArrivalSpreadTypeChange,
  arrivalSpreadValue,
  onArrivalSpreadValueChange,
  arrivalMinTime,
  onArrivalMinTimeChange,
  arrivalMaxTime,
  onArrivalMaxTimeChange,
  arrivalGammaTheta,
  onArrivalGammaThetaChange,
  arrivalGammaK,
  onArrivalGammaKChange,
  ggServiceInputMode,
  onGgServiceInputModeChange,
  ggServiceSpreadType,
  onGgServiceSpreadTypeChange,
  ggServiceSpreadValue,
  onGgServiceSpreadValueChange,
  ggServiceMinTime,
  onGgServiceMinTimeChange,
  ggServiceMaxTime,
  onGgServiceMaxTimeChange,
  resultTimeUnit,
  onResultTimeUnitChange,
  effectiveModel,
  onSubmit,
  isLoading,
}: InputFormProps) {
  const isMgModel = effectiveModel.startsWith("M/G/");
  const isGgModel = effectiveModel.startsWith("G/G/");

  const getEffMode = (distribution: string, currentMode: string) => {
    if (mode === "manual") return currentMode;
    if (distribution === "Uniform") return "minMax";
    if (distribution === "Normal") return "meanSpread";
    if (distribution === "Gamma") {
      return currentMode === "thetaK" ? "thetaK" : "meanSpread";
    }
    return currentMode;
  };

  const effMgSvcMode = getEffMode(serviceDistribution, serviceInputMode);
  const effArrMode = getEffMode(arrivalDistribution, arrivalInputMode);
  const effGgSvcMode = getEffMode(serviceDistribution, ggServiceInputMode);

  const serverOptions =
    manualServerMode === "single"
      ? [
          { value: "M/M/1", label: "M/M/1" },
          { value: "M/G/1", label: "M/G/1" },
          { value: "G/G/1", label: "G/G/1" },
        ]
      : [
          { value: "M/M/s", label: "M/M/s" },
          { value: "M/G/s", label: "M/G/s" },
          { value: "G/G/s", label: "G/G/s" },
        ];

  const isValid =
    Boolean(effectiveModel) &&
    servers >= 1 &&
    (mode === "manual" ? Boolean(selectedModel) : Boolean(arrivalDistribution)) &&
    Boolean(serviceDistribution);

  const arrivalLabel =
    arrivalInputType === "rate" ? "Arrival rate" : "Mean inter-arrival time";

  const serviceLabel = serviceInputType === "rate" ? "Service rate" : "Service time";

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section className="section-shell">
        <div className="section-header">
          <div>
            <p className="eyebrow">Core mode</p>
            <h3 className="section-title">Choose the routing style</h3>
          </div>
        </div>
        <SegmentedControl
          value={mode}
          onChange={(value) => onModeChange(value as "manual" | "auto")}
          disabled={isLoading}
          options={[
            { value: "manual", label: "Manual lane" },
            { value: "auto", label: "Auto detect" },
          ]}
        />

        {mode === "manual" ? (
          <div className="grid gap-5 md:grid-cols-2">
            <FieldCard label="Server topology" hint="Single or multi-server build">
              <SegmentedControl
                value={manualServerMode}
                onChange={(value) =>
                  onManualServerModeChange(value as "single" | "multi")
                }
                disabled={isLoading}
                options={[
                  { value: "single", label: "Single" },
                  { value: "multi", label: "Multi" },
                ]}
              />
            </FieldCard>

            <FieldCard label="Model family" hint="Pick the queue family directly">
              <select
                value={selectedModel}
                onChange={(event) => onSelectedModelChange(event.target.value)}
                disabled={isLoading}
                className="field-input"
              >
                <option value="" disabled>
                  Select a model
                </option>
                {serverOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FieldCard>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            <FieldCard label="Arrival source" hint="Auto mode infers the family">
              <select
                value={arrivalProcessType}
                onChange={(event) =>
                  onArrivalProcessTypeChange(
                    event.target.value as "arrival" | "interArrival",
                  )
                }
                disabled={isLoading}
                className="field-input"
              >
                <option value="arrival">Arrival distribution</option>
                <option value="interArrival">Inter-arrival distribution</option>
              </select>

              <div className="mt-3">
                {arrivalProcessType === "arrival" ? (
                  <div className="field-note">Poisson is fixed for arrival mode.</div>
                ) : (
                  <select
                    value={arrivalDistribution}
                    onChange={(event) =>
                      onArrivalDistributionChange(event.target.value)
                    }
                    disabled={isLoading}
                    className="field-input"
                  >
                    <option value="Exponential">Exponential</option>
                    <option value="Uniform">Uniform</option>
                    <option value="Normal">Normal</option>
                    <option value="Gamma">Gamma</option>
                  </select>
                )}
              </div>
            </FieldCard>

            <FieldCard label="Service source" hint="Choose the service distribution">
              <select
                value={serviceDistribution}
                onChange={(event) => onServiceDistributionChange(event.target.value)}
                disabled={isLoading}
                className="field-input"
              >
                {!(mode === "auto" && arrivalProcessType === "interArrival" && arrivalDistribution !== "Exponential") && (
                  <option value="Exponential">Exponential</option>
                )}
                <option value="Uniform">Uniform</option>
                <option value="Normal">Normal</option>
                <option value="Gamma">Gamma</option>
              </select>
            </FieldCard>
          </div>
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="section-shell">
          <div className="section-header">
            <div>
              <p className="eyebrow">Arrival channel</p>
              <h3 className="section-title">Shape the incoming flow</h3>
            </div>
          </div>

          {mode === "manual" && isGgModel ? (
            <SegmentedControl
              value={arrivalInputMode}
              onChange={(value) =>
                onArrivalInputModeChange(
                  value as "meanSpread" | "minMax" | "thetaK",
                )
              }
              disabled={isLoading}
              options={[
                { value: "meanSpread", label: "Mean + spread" },
                { value: "minMax", label: "Min / max" },
                { value: "thetaK", label: "Theta + K" },
              ]}
            />
          ) : mode === "auto" && arrivalDistribution === "Gamma" ? (
            <SegmentedControl
              value={arrivalInputMode}
              onChange={(value) =>
                onArrivalInputModeChange(
                  value as "meanSpread" | "minMax" | "thetaK",
                )
              }
              disabled={isLoading}
              options={[
                { value: "meanSpread", label: "Mean + spread" },
                { value: "thetaK", label: "Theta + K" },
              ]}
            />
          ) : null}

          {effArrMode === "thetaK" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <FieldCard label="Theta" hint="Scale parameter">
                <TextInput
                  value={arrivalGammaTheta}
                  onChange={onArrivalGammaThetaChange}
                  disabled={isLoading}
                  placeholder="Theta"
                />
              </FieldCard>
              <FieldCard label="K" hint="Shape parameter">
                <TextInput
                  value={arrivalGammaK}
                  onChange={onArrivalGammaKChange}
                  disabled={isLoading}
                  placeholder="K"
                />
              </FieldCard>
            </div>
          ) : effArrMode === "minMax" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <FieldCard label="Minimum" hint="Lower bound">
                <TextInput
                  value={arrivalMinTime}
                  onChange={onArrivalMinTimeChange}
                  disabled={isLoading}
                  placeholder="Min"
                />
              </FieldCard>
              <FieldCard label="Maximum" hint="Upper bound">
                <TextInput
                  value={arrivalMaxTime}
                  onChange={onArrivalMaxTimeChange}
                  disabled={isLoading}
                  placeholder="Max"
                />
              </FieldCard>
            </div>
          ) : (
            <>
              <div className="panel-strip">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => onArrivalInputTypeChange("rate")}
                  className={`control-pill ${arrivalInputType === "rate" ? "control-pill-active" : ""}`}
                >
                  Rate
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => onArrivalInputTypeChange("meanInterArrival")}
                  className={`control-pill ${arrivalInputType === "meanInterArrival" ? "control-pill-active" : ""}`}
                >
                  Mean time
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_9rem]">
                <FieldCard label={arrivalLabel} hint="Primary arrival input">
                  <TextInput
                    value={arrivalValue}
                    onChange={onArrivalValueChange}
                    disabled={isLoading}
                    placeholder={arrivalInputType === "rate" ? "e.g. 3.2" : "e.g. 1.4"}
                  />
                </FieldCard>
                <FieldCard label="Unit" hint="Time scale">
                  <UnitSelect
                    value={arrivalTimeUnit}
                    onChange={onArrivalTimeUnitChange}
                    disabled={isLoading}
                    variant={arrivalInputType === "rate" ? "rate" : "duration"}
                  />
                </FieldCard>
              </div>

              {(isGgModel || mode === "auto") && effArrMode !== "minMax" && effArrMode !== "thetaK" ? (
                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_10rem]">
                  <FieldCard label="Arrival spread type" hint="Variance or std dev">
                    <SegmentedControl
                      value={arrivalSpreadType}
                      onChange={(value) =>
                        onArrivalSpreadTypeChange(value as "variance" | "stdDev")
                      }
                      disabled={isLoading}
                      options={[
                        { value: "variance", label: "Variance" },
                        { value: "stdDev", label: "Std dev" },
                      ]}
                    />
                  </FieldCard>
                  <FieldCard label="Spread" hint="Variability">
                    <TextInput
                      value={arrivalSpreadValue}
                      onChange={onArrivalSpreadValueChange}
                      disabled={isLoading}
                      placeholder="e.g. 0.8"
                      min="0"
                    />
                  </FieldCard>
                </div>
              ) : null}
            </>
          )}
        </div>

        <div className="section-shell">
          <div className="section-header">
            <div>
              <p className="eyebrow">Service channel</p>
              <h3 className="section-title">Set the processing side</h3>
            </div>
          </div>

          {((isMgModel || isGgModel) && mode === "manual") ||
          (mode === "auto" && serviceDistribution === "Gamma") ? (
            <SegmentedControl
              value={isMgModel ? effMgSvcMode : effGgSvcMode}
              onChange={(value) => {
                if (isMgModel || mode === "auto") {
                  onServiceInputModeChange(value as "meanSpread" | "minMax" | "thetaK");
                }
                if (isGgModel || mode === "auto") {
                  onGgServiceInputModeChange(value as "meanSpread" | "minMax" | "thetaK");
                }
              }}
              disabled={isLoading}
              options={[
                { value: "meanSpread", label: "Mean + spread" },
                { value: "minMax", label: "Min / max" },
                { value: "thetaK", label: "Theta + K" },
              ]}
            />
          ) : null}

          {((isMgModel && effMgSvcMode === "thetaK") ||
            (isGgModel && effGgSvcMode === "thetaK")) ? (
            <div className="grid gap-4 md:grid-cols-2">
              <FieldCard label="Theta" hint="Scale parameter">
                <TextInput
                  value={serviceGammaTheta}
                  onChange={onServiceGammaThetaChange}
                  disabled={isLoading}
                  placeholder="Theta"
                />
              </FieldCard>
              <FieldCard label="K" hint="Shape parameter">
                <TextInput
                  value={serviceGammaK}
                  onChange={onServiceGammaKChange}
                  disabled={isLoading}
                  placeholder="K"
                />
              </FieldCard>
            </div>
          ) : ((isMgModel && effMgSvcMode === "minMax") ||
              (isGgModel && effGgSvcMode === "minMax")) ? (
            <div className="grid gap-4 md:grid-cols-2">
              <FieldCard label="Minimum" hint="Lower bound">
                <TextInput
                  value={isMgModel ? serviceMinTime : ggServiceMinTime}
                  onChange={
                    isMgModel ? onServiceMinTimeChange : onGgServiceMinTimeChange
                  }
                  disabled={isLoading}
                  placeholder="Min"
                />
              </FieldCard>
              <FieldCard label="Maximum" hint="Upper bound">
                <TextInput
                  value={isMgModel ? serviceMaxTime : ggServiceMaxTime}
                  onChange={
                    isMgModel ? onServiceMaxTimeChange : onGgServiceMaxTimeChange
                  }
                  disabled={isLoading}
                  placeholder="Max"
                />
              </FieldCard>
            </div>
          ) : (
            <>
              <div className="panel-strip">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => onServiceInputTypeChange("rate")}
                  className={`control-pill ${serviceInputType === "rate" ? "control-pill-active" : ""}`}
                >
                  Rate
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => onServiceInputTypeChange("mean")}
                  className={`control-pill ${serviceInputType === "mean" ? "control-pill-active" : ""}`}
                >
                  Mean time
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_9rem]">
                <FieldCard label={serviceLabel} hint="Primary service input">
                  <TextInput
                    value={serviceInputType === "rate" ? serviceRateValue : serviceTime}
                    onChange={
                      serviceInputType === "rate"
                        ? onServiceRateValueChange
                        : onServiceTimeChange
                    }
                    disabled={isLoading}
                    placeholder={serviceInputType === "rate" ? "e.g. 4.5" : "e.g. 0.8"}
                  />
                </FieldCard>
                <FieldCard
                  label="Unit"
                  hint={serviceInputType === "rate" ? "Rate scale" : "Time scale"}
                >
                  <UnitSelect
                    value={serviceInputType === "rate" ? serviceRateUnit : serviceTimeUnit}
                    onChange={
                      serviceInputType === "rate"
                        ? onServiceRateUnitChange
                        : onServiceTimeUnitChange
                    }
                    disabled={isLoading}
                    variant={serviceInputType === "rate" ? "rate" : "duration"}
                  />
                </FieldCard>
              </div>

              {isMgModel ? (
                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_10rem]">
                  <FieldCard label="Spread type" hint="Variance or std dev">
                    <SegmentedControl
                      value={serviceSpreadType}
                      onChange={(value) =>
                        onServiceSpreadTypeChange(value as "variance" | "stdDev")
                      }
                      disabled={isLoading}
                      options={[
                        { value: "variance", label: "Variance" },
                        { value: "stdDev", label: "Std dev" },
                      ]}
                    />
                  </FieldCard>
                  <FieldCard label="Spread" hint="Variability">
                    <TextInput
                      value={serviceSpreadValue}
                      onChange={onServiceSpreadValueChange}
                      disabled={isLoading}
                      placeholder="e.g. 1.1"
                      min="0"
                    />
                  </FieldCard>
                </div>
              ) : null}

              {isGgModel ? (
                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_10rem]">
                  <FieldCard label="Spread type" hint="Variance or std dev">
                    <SegmentedControl
                      value={ggServiceSpreadType}
                      onChange={(value) =>
                        onGgServiceSpreadTypeChange(value as "variance" | "stdDev")
                      }
                      disabled={isLoading}
                      options={[
                        { value: "variance", label: "Variance" },
                        { value: "stdDev", label: "Std dev" },
                      ]}
                    />
                  </FieldCard>
                  <FieldCard label="Spread" hint="Variability">
                    <TextInput
                      value={ggServiceSpreadValue}
                      onChange={onGgServiceSpreadValueChange}
                      disabled={isLoading}
                      placeholder="e.g. 0.9"
                      min="0"
                    />
                  </FieldCard>
                </div>
              ) : null}
            </>
          )}
        </div>
      </section>

      <section className="section-shell">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_15rem]">
          <FieldCard label="Servers" hint="Active service channels">
            <TextInput
              value={String(servers || "")}
              onChange={(value) => {
                const parsedValue = parseInt(value, 10);
                onServersChange(Number.isNaN(parsedValue) ? 0 : parsedValue);
              }}
              disabled={isLoading}
              placeholder="1"
              min="1"
            />
          </FieldCard>

          <FieldCard label="Result unit" hint="Displayed output scale">
            <UnitSelect
              value={resultTimeUnit}
              onChange={onResultTimeUnitChange}
              disabled={isLoading}
              variant="duration"
            />
          </FieldCard>
        </div>

        {effectiveModel ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="badge-soft">Model: {effectiveModel}</span>
            <span className="badge-soft">Servers: {servers}</span>
            <span className="badge-soft">Mode: {mode === "manual" ? "Manual" : "Auto"}</span>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isLoading || !isValid}
          className="submit-button"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing
            </>
          ) : (
            <>
              <Play className="h-5 w-5" />
              Run calculation
            </>
          )}
          <Sparkles className="h-4 w-4 opacity-70" />
        </button>
      </section>
    </form>
  );
}
