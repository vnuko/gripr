import { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  UploadCloud,
  Loader2,
  ChevronDown,
  Mountain,
  Droplets,
  Route,
  CloudRain,
  Thermometer,
  Car,
  Trees,
  TreePine,
  TrendingDown,
} from "lucide-react";
import { GriprNavbar, HeroSection, Footer } from "../../components/Layout";
import { GPXUpload } from "../../components/GPXUpload";
import { RiderForm } from "../../components/RiderForm";
import { BikeSetupForm } from "../../components/BikeSetupForm";
import { ResultsSection } from "../../components/ResultsSection";
import { AIExplanation } from "../../components/AIExplanation";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { ErrorAlert, NetworkErrorAlert } from "../../components/ErrorAlert";
import { SegmentedControl } from "../../components/ui/SegmentedControl";
import { useFormValidation, useAnalyze } from "../../hooks";
import type { AnalyzeRequest } from "../../api/generated";
import { BIKE_TYPE_TIRE_DEFAULTS } from "../../types/rider-input";

const FONT_DISPLAY = "var(--gripr-font-display)";
const TEXT_PRIMARY = "var(--gripr-text-primary)";
const TEXT_SECONDARY = "var(--gripr-text-secondary)";
const TEXT_MUTED = "var(--gripr-text-muted)";
const ACCENT = "var(--gripr-accent)";
const DISPLAY_INLINE_FLEX = "inline-flex";

function GriprSwitch({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={`gripr-switch-track ${checked ? "on" : ""}`}
      onClick={() => !disabled && onChange(!checked)}
      role="switch"
      aria-checked={checked}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) =>
        !disabled && (e.key === "Enter" || e.key === " ") && onChange(!checked)
      }
      style={{
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <div className="gripr-switch-thumb" />
    </div>
  );
}

const TERRAIN_OPTIONS = [
  { label: "Road / Paved Path", icon: <Car size={12} /> },
  { label: "Gravel / Dirt Roads", icon: <Route size={12} /> },
  { label: "Forest / Soil Trails", icon: <Trees size={12} /> },
  { label: "Muddy / Soft Ground", icon: <Droplets size={12} /> },
  { label: "Rocky / Stony Terrain", icon: <Mountain size={12} /> },
  { label: "Roots / Rough Trails", icon: <TreePine size={12} /> },
  { label: "Steep / Extreme Descents", icon: <TrendingDown size={12} /> },
];

const getWeatherDescription = (weather: string) => {
  switch (weather) {
    case "Dry":
      return "Hard, baked trails — slightly higher pressures recommended";
    case "Damp":
      return "Varied grip — balanced pressure for traction & roll resistance";
    case "Wet":
      return "Slippery — lower pressures for max contact patch & grip";
    default:
      return "";
  }
};

const getTempColor = (temp: number) => {
  if (temp <= 5) return "#60A5FA";
  if (temp <= 15) return "#34D399";
  if (temp <= 28) return "#FBBF24";
  return "#F87171";
};

const getTempDescription = (temp: number) => {
  if (temp <= 0)
    return "Freezing — tire pressure noticeably lower, check before riding";
  if (temp <= 10) return "Cold — slight pressure drop expected";
  if (temp <= 25) return "Normal — stable riding conditions";
  if (temp <= 35) return "Warm — minor pressure increase possible";
  return "Very hot — pressure may rise during long rides";
};

function StepProgress({
  inputMode,
  gpxFile,
  selectedTerrains,
  riderWeight,
  bikeType,
  tireFront,
  tireRear,
  status,
}: {
  inputMode: "terrain" | "gpx";
  gpxFile: File | null;
  selectedTerrains: string[];
  riderWeight: number | undefined;
  bikeType: string | undefined;
  tireFront: number | undefined;
  tireRear: number | undefined;
  status: string;
}) {
  const AMBER = "rgb(255, 140, 85)";
  const GRAY = "var(--gripr-surface-3)";
  const GRAY_BORDER = "var(--gripr-border)";

  const steps = [
    {
      label: inputMode === "gpx" ? "GPX Route" : "Terrain",
      done: inputMode === "gpx" ? !!gpxFile : selectedTerrains.length > 0,
    },
    { label: "Rider Info", done: riderWeight !== undefined },
    {
      label: "Bike Setup",
      done:
        bikeType !== undefined &&
        tireFront !== undefined &&
        tireRear !== undefined,
    },
    { label: "Weather", done: true },
    { label: "Analysed", done: status === "loading" || status === "success" },
  ];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        marginBottom: "1.5rem",
        overflowX: "auto",
        paddingBottom: "0.25rem",
      }}
    >
      {steps.map((step, i) => (
        <div
          key={step.label}
          style={{
            display: "flex",
            alignItems: "center",
            flex: i < steps.length - 1 ? "1 1 0" : "0 0 auto",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: step.done ? AMBER : GRAY,
                border: `2px solid ${step.done ? AMBER : GRAY_BORDER}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: step.done ? "white" : TEXT_MUTED,
                fontSize: "0.7rem",
                fontWeight: 700,
                fontFamily: FONT_DISPLAY,
                transition: "all 0.3s",
                flexShrink: 0,
              }}
            >
              {step.done ? "✓" : i + 1}
            </div>
            <span
              style={{
                fontSize: "0.65rem",
                fontWeight: 700,
                color: step.done ? AMBER : TEXT_MUTED,
                fontFamily: FONT_DISPLAY,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                whiteSpace: "nowrap",
              }}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              style={{
                flex: 1,
                height: 2,
                background: step.done ? AMBER : GRAY_BORDER,
                margin: "0 5px",
                marginBottom: 16,
                transition: "background 0.3s",
                borderRadius: 50,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

const ANALYSIS_STEPS = [
  "Parsing GPX waypoints…",
  "Analysing elevation profile…",
  "Processing terrain characteristics…",
  "Calculating optimal pressures…",
  "Applying AI fine-tuning…",
];

function AnalysisProgress() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s + 1) % ANALYSIS_STEPS.length);
    }, 420);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        display: DISPLAY_INLINE_FLEX,
        alignItems: "center",
        gap: 8,
        background: "var(--gripr-accent-dim)",
        border: "1px solid rgba(255,107,43,0.2)",
        borderRadius: 50,
        padding: "6px 14px",
      }}
    >
      <div
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: ACCENT,
          boxShadow: `0 0 8px ${ACCENT}`,
          animation: "gripr-bounce 1s ease-in-out infinite",
        }}
      />
      <span
        style={{
          fontSize: "0.78rem",
          color: ACCENT,
          fontFamily: FONT_DISPLAY,
          fontWeight: 600,
        }}
      >
        {ANALYSIS_STEPS[step]}
      </span>
    </div>
  );
}

function ErrorsDisplay({
  error,
  errorType,
  onRetry,
  onDismiss,
}: {
  error: string | null;
  errorType: string | null;
  onRetry: () => void;
  onDismiss: () => void;
}) {
  if (!error) return null;
  if (errorType === "network") return <NetworkErrorAlert onRetry={onRetry} />;
  return (
    <ErrorAlert
      message={error}
      title="Analysis Failed"
      onDismiss={onDismiss}
      onRetry={onRetry}
    />
  );
}

function TerrainChips({
  selectedTerrains,
  onToggle,
  disabled,
}: {
  selectedTerrains: string[];
  onToggle: (label: string) => void;
  disabled: boolean;
}) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.75rem",
        }}
      >
        <span style={{ fontSize: "0.78rem", color: TEXT_MUTED }}>
          Select all that apply
        </span>
        {selectedTerrains.length > 0 && (
          <span
            style={{
              background: ACCENT,
              color: "white",
              borderRadius: 50,
              width: 22,
              height: 22,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.72rem",
              fontWeight: 700,
            }}
          >
            {selectedTerrains.length}
          </span>
        )}
      </div>
      <div className="gripr-chips">
        {TERRAIN_OPTIONS.map(({ label, icon }) => (
          <button
            key={label}
            type="button"
            className={`gripr-chip ${selectedTerrains.includes(label) ? "selected" : ""}`}
            onClick={() => onToggle(label)}
            disabled={disabled}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function WeatherConditionsCard({
  weather,
  temperature,
  onWeatherChange,
  onTemperatureChange,
  disabled,
}: {
  weather: string;
  temperature: number;
  onWeatherChange: (v: string) => void;
  onTemperatureChange: (v: number) => void;
  disabled: boolean;
}) {
  const weatherCapitalized = weather.charAt(0).toUpperCase() + weather.slice(1);

  return (
    <div className="gripr-card">
      <div className="gripr-card-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="gripr-section-icon">
            <CloudRain size={18} strokeWidth={2} />
          </div>
          <div>
            <div className="gripr-section-label" style={{ marginBottom: 0 }}>
              Step 4
            </div>
            <h3
              style={{
                margin: 0,
                color: TEXT_PRIMARY,
                fontFamily: FONT_DISPLAY,
              }}
            >
              Weather Conditions
            </h3>
          </div>
        </div>
      </div>
      <div className="gripr-card-body">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1.5rem",
          }}
        >
          <div>
            <label className="gripr-label">Trail Conditions</label>
            <SegmentedControl
              options={["Dry", "Damp", "Wet"]}
              value={weatherCapitalized}
              onChange={(v) => onWeatherChange(v.toLowerCase())}
              disabled={disabled}
            />
            <div style={{ marginTop: "0.5rem" }}>
              <div style={{ fontSize: "0.78rem", color: TEXT_MUTED }}>
                {getWeatherDescription(weatherCapitalized)}
              </div>
            </div>
          </div>

          <div>
            <label className="gripr-label">
              Temperature
              <span
                style={{
                  marginLeft: 8,
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 700,
                  color: getTempColor(temperature),
                  fontSize: "0.85rem",
                }}
              >
                {temperature}°C
              </span>
            </label>

            <div style={{ position: "relative", padding: "0.5rem 0" }}>
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: 0,
                  right: 0,
                  height: 6,
                  transform: "translateY(-50%)",
                  borderRadius: 50,
                  background:
                    "linear-gradient(to right, #60A5FA 0%, #34D399 25%, #FBBF24 62%, #F87171 100%)",
                  opacity: 0.3,
                  pointerEvents: "none",
                }}
              />
              <input
                type="range"
                className="gripr-temp-slider"
                min={0}
                max={40}
                value={temperature}
                onChange={(e) => onTemperatureChange(Number(e.target.value))}
                disabled={disabled}
                style={{
                  position: "relative",
                  zIndex: 1,
                  background: "transparent",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "0.2rem",
              }}
            >
              {["0°C", "10°C", "20°C", "30°C", "40°C"].map((t) => (
                <span
                  key={t}
                  style={{
                    fontSize: "0.68rem",
                    color: TEXT_MUTED,
                    fontFamily: FONT_DISPLAY,
                    fontWeight: 600,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>

            <div style={{ marginTop: "0.5rem" }}>
              <div
                style={{
                  display: DISPLAY_INLINE_FLEX,
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Thermometer size={12} style={{ color: getTempColor(temperature) }} />
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: TEXT_SECONDARY,
                    fontFamily: FONT_DISPLAY,
                    fontWeight: 600,
                  }}
                >
                  {getTempDescription(temperature)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultsDisplay({
  result,
  values,
  onReset,
}: {
  result: NonNullable<ReturnType<typeof useAnalyze>["result"]>;
  values: Record<string, unknown>;
  onReset: () => void;
}) {
  return (
    <div id="gripr-results" className="gripr-animate-in">
      <ResultsSection
        baseline={result.baseline}
        terrainAdjusted={result.terrainAdjusted}
        aiRecommended={result.aiRecommended}
      />

      <div style={{ marginTop: "1.5rem" }}>
        <div className="gripr-section-label" style={{ marginBottom: "0.75rem" }}>
          AI Reasoning
        </div>
        <AIExplanation
          selectedTerrains={values.selectedTerrains as string[]}
          weather={values.weather as string}
          temperature={values.temperature as number}
          ridingStyle={values.ridingStyle as string}
          bikeType={values.bikeType as string}
          tubeless={values.tubeless as boolean}
          tireInserts={values.tireInserts as boolean}
          frontPsi={result.aiRecommended.front}
          rearPsi={result.aiRecommended.rear}
          aiReasoning={result.aiRecommended.note}
        />
      </div>

      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <button
          onClick={onReset}
          style={{
            background: "none",
            border: "1.5px solid var(--gripr-border)",
            borderRadius: 10,
            padding: "0.65rem 1.5rem",
            color: TEXT_SECONDARY,
            fontFamily: FONT_DISPLAY,
            fontWeight: 600,
            fontSize: "0.88rem",
            cursor: "pointer",
            transition: "all 0.2s",
            display: DISPLAY_INLINE_FLEX,
            alignItems: "center",
            gap: 7,
          }}
        >
          <ChevronDown size={15} style={{ transform: "rotate(180deg)" }} />
          Modify Setup & Re-analyse
        </button>
      </div>
    </div>
  );
}

function InputModeCard({
  inputMode,
  gpxFile,
  selectedTerrains,
  onGpxFileChange,
  onInputModeChange,
  onTerrainToggle,
  disabled,
}: {
  inputMode: "terrain" | "gpx";
  gpxFile: File | null;
  selectedTerrains: string[];
  onGpxFileChange: (file: File | null) => void;
  onInputModeChange: (mode: "terrain" | "gpx") => void;
  onTerrainToggle: (label: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="gripr-card">
      <div className="gripr-card-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="gripr-section-icon">
            {inputMode === "gpx" ? (
              <UploadCloud size={18} strokeWidth={2} />
            ) : (
              <Mountain size={18} strokeWidth={2} />
            )}
          </div>
          <div>
            <div className="gripr-section-label" style={{ marginBottom: 0 }}>
              Step 1
            </div>
            <h3 style={{ margin: 0, color: TEXT_PRIMARY, fontFamily: FONT_DISPLAY }}>
              {inputMode === "gpx" ? "Upload GPX Route" : "Terrain Conditions"}
            </h3>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              fontSize: "0.78rem",
              fontWeight: 700,
              fontFamily: FONT_DISPLAY,
              color: inputMode === "gpx" ? ACCENT : TEXT_MUTED,
            }}
          >
            GPX
          </span>
          <GriprSwitch
            checked={inputMode === "gpx"}
            onChange={(v) => onInputModeChange(v ? "gpx" : "terrain")}
            disabled={disabled}
          />
        </div>
      </div>
      <div className="gripr-card-body">
        {inputMode === "gpx" ? (
          <GPXUpload file={gpxFile} onChange={onGpxFileChange} disabled={disabled} />
        ) : (
          <TerrainChips
            selectedTerrains={selectedTerrains}
            onToggle={onTerrainToggle}
            disabled={disabled}
          />
        )}
      </div>
    </div>
  );
}

export function HomePage() {
  const [isDark, setIsDark] = useState(false);
  const [gpxFile, setGpxFile] = useState<File | null>(null);
  const [inputMode, setInputMode] = useState<"terrain" | "gpx">("terrain");

  const {
    values,
    setValue,
    errors,
    validateAll,
    reset: resetForm,
  } = useFormValidation({
    riderWeight: undefined,
    skillLevel: "intermediate",
    ridingStyle: "moderate",
    bikeType: undefined,
    tireFront: undefined,
    tireRear: undefined,
    wheelSize: '29"',
    tubeless: false,
    tireInserts: false,
    selectedTerrains: [],
    weather: "dry",
    temperature: 14,
  });

  const {
    status,
    result,
    error,
    errorType,
    analyze,
    reset: resetAnalysis,
  } = useAnalyze();

  const handleSubmit = useCallback(async () => {
    const { isValid, errors } = validateAll();
    if (!isValid) {
      console.error("Form validation failed:", errors);
      return;
    }

    const riderInput: AnalyzeRequest = {
      riderWeight: values.riderWeight as number,
      bikeType: values.bikeType as string,
      tireFront: values.tireFront as number,
      tireRear: values.tireRear as number,
      wheelSize: values.wheelSize as string,
      tubeless: values.tubeless as boolean,
      tireInserts: values.tireInserts as boolean,
      skillLevel: values.skillLevel as string,
      ridingStyle: values.ridingStyle as string,
      selectedTerrains:
        inputMode === "terrain"
          ? (values.selectedTerrains as string[])
          : undefined,
      weather: values.weather as string,
      temperature: values.temperature as number,
    };

    await analyze(inputMode === "gpx" ? gpxFile : null, riderInput);
  }, [gpxFile, values, analyze, inputMode, validateAll]);

  const handleRetry = useCallback(async () => {
    await handleSubmit();
  }, [handleSubmit]);

  const handleReset = useCallback(() => {
    resetForm();
    resetAnalysis();
    setGpxFile(null);
    setInputMode("terrain");
  }, [resetForm, resetAnalysis]);

  const handleTerrainToggle = useCallback(
    (label: string) => {
      const terrains = values.selectedTerrains as string[];
      if (terrains.includes(label)) {
        setValue("selectedTerrains", terrains.filter((t) => t !== label));
      } else {
        setValue("selectedTerrains", [...terrains, label]);
      }
    },
    [values.selectedTerrains, setValue],
  );

  useEffect(() => {
    if (status === "success" && result) {
      setTimeout(() => {
        const el = document.getElementById("gripr-results");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [status, result]);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      isDark ? "dark" : "light",
    );
  }, [isDark]);

  return (
    <div className="gripr-app" data-theme={isDark ? "dark" : "light"}>
      <GriprNavbar isDark={isDark} onToggleTheme={setIsDark} />
      <HeroSection />

      <main
        id="gripr-content"
        style={{ maxWidth: 1100, margin: "0 auto", padding: "2.5rem 1.5rem" }}
      >
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div
            className="gripr-section-label"
            style={{
              justifyContent: "center",
              display: "flex",
              marginBottom: "0.5rem",
            }}
          >
            Analysis Setup
          </div>
          <h2
            style={{
              fontFamily: FONT_DISPLAY,
              letterSpacing: "-0.03em",
              margin: "0 0 0.5rem",
              color: TEXT_PRIMARY,
            }}
          >
            Configure Your Ride
          </h2>
          <p
            style={{
              margin: 0,
              color: TEXT_SECONDARY,
              maxWidth: 500,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Fill in your details below for a personalised tire pressure
            recommendation tailored to your exact setup.
          </p>
        </div>

        {status !== "idle" && (
          <StepProgress
            inputMode={inputMode}
            gpxFile={gpxFile}
            selectedTerrains={values.selectedTerrains as string[]}
            riderWeight={values.riderWeight as number | undefined}
            bikeType={values.bikeType as string | undefined}
            tireFront={values.tireFront as number | undefined}
            tireRear={values.tireRear as number | undefined}
            status={status}
          />
        )}

        {status === "loading" && (
          <LoadingSpinner fullPage message="Analyzing your route..." />
        )}

        <ErrorsDisplay
          error={error}
          errorType={errorType}
          onRetry={handleRetry}
          onDismiss={resetAnalysis}
        />

        {status === "success" && result ? (
          <ResultsDisplay
            result={result}
            values={values}
            onReset={handleReset}
          />
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            <InputModeCard
              inputMode={inputMode}
              gpxFile={gpxFile}
              selectedTerrains={values.selectedTerrains as string[]}
              onGpxFileChange={setGpxFile}
              onInputModeChange={setInputMode}
              onTerrainToggle={handleTerrainToggle}
              disabled={status === "loading"}
            />

            <RiderForm
              weight={values.riderWeight as number}
              onWeightChange={(v: number) => setValue("riderWeight", v)}
              weightError={errors.riderWeight}
              skillLevel={values.skillLevel as string}
              onSkillChange={(v: string) => setValue("skillLevel", v)}
              ridingStyle={values.ridingStyle as string}
              onStyleChange={(v: string) => setValue("ridingStyle", v)}
              disabled={status === "loading"}
            />

            <BikeSetupForm
              bikeType={values.bikeType as string}
              bikeTypeError={errors.bikeType}
              onBikeTypeChange={(v: string) => {
                setValue("bikeType", v);
                const defaults =
                  BIKE_TYPE_TIRE_DEFAULTS[
                    v as keyof typeof BIKE_TYPE_TIRE_DEFAULTS
                  ];
                if (defaults) {
                  setValue("tireFront", defaults.front);
                  setValue("tireRear", defaults.rear);
                }
              }}
              tireFront={values.tireFront as number | undefined}
              tireFrontError={errors.tireFront}
              onTireFrontChange={(v: number | undefined) =>
                setValue("tireFront", v)
              }
              tireRear={values.tireRear as number | undefined}
              tireRearError={errors.tireRear}
              onTireRearChange={(v: number | undefined) =>
                setValue("tireRear", v)
              }
              wheelSize={values.wheelSize as string}
              onWheelSizeChange={(v: string) => setValue("wheelSize", v)}
              tubeless={values.tubeless as boolean}
              onTubelessChange={(v: boolean) => setValue("tubeless", v)}
              tireInserts={values.tireInserts as boolean}
              onTireInsertsChange={(v: boolean) => setValue("tireInserts", v)}
              disabled={status === "loading"}
            />

            <WeatherConditionsCard
              weather={values.weather as string}
              temperature={values.temperature as number}
              onWeatherChange={(v) => setValue("weather", v)}
              onTemperatureChange={(v) => setValue("temperature", v)}
              disabled={status === "loading"}
            />

            <div className="gripr-card">
              <div className="gripr-card-body">
                <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
                  <h3
                    style={{
                      margin: "0 0 0.3rem",
                      fontFamily: FONT_DISPLAY,
                      color: TEXT_PRIMARY,
                    }}
                  >
                    Ready to Optimise?
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.88rem",
                      color: TEXT_SECONDARY,
                    }}
                  >
                    GripR will analyse your route, setup and conditions to
                    recommend the perfect tire pressures.
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                    justifyContent: "center",
                    marginBottom: "1.25rem",
                  }}
                >
                  {[
                    `${values.riderWeight} kg`,
                    values.skillLevel,
                    values.ridingStyle,
                    values.bikeType,
                    `${values.wheelSize} wheels`,
                    values.tubeless ? "Tubeless" : "Tubed",
                    values.weather,
                    `${values.temperature}°C`,
                    ...(inputMode === "terrain"
                      ? (values.selectedTerrains as string[]).slice(0, 3)
                      : []),
                    ...(inputMode === "gpx" && gpxFile ? [gpxFile.name] : []),
                  ].map((tag) => (
                    <span key={String(tag)} className="gripr-route-tag">
                      {tag}
                    </span>
                  ))}
                </div>

                <button
                  className="gripr-analyze-btn"
                  onClick={handleSubmit}
                  disabled={status === "loading"}
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 size={18} className="gripr-spin" />
                      Analysing Route & Setup…
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Analyse Tire Pressure
                    </>
                  )}
                </button>

                {status === "loading" && (
                  <div style={{ marginTop: "1rem", textAlign: "center" }}>
                    <AnalysisProgress />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
