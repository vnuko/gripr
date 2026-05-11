import { useState, useEffect, useCallback } from 'react';
import { Sparkles, UploadCloud, Loader2, ChevronDown, Mountain, Droplets, Zap, Route, Wind, Layers, CloudRain, Thermometer } from 'lucide-react';
import { GriprNavbar, HeroSection, Footer } from '../../components/Layout';
import { GPXUpload } from '../../components/GPXUpload';
import { RiderForm } from '../../components/RiderForm';
import { BikeSetupForm } from '../../components/BikeSetupForm';
import { ResultsSection } from '../../components/ResultsSection';
import { AIExplanation } from '../../components/AIExplanation';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorAlert, NetworkErrorAlert } from '../../components/ErrorAlert';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { useFormValidation, useAnalyze } from '../../hooks';
import type { AnalyzeRequest } from '../../api/generated';

function GriprSwitch({ checked, onChange, disabled = false }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <div
      className={`gripr-switch-track ${checked ? 'on' : ''}`}
      onClick={() => !disabled && onChange(!checked)}
      role="switch"
      aria-checked={checked}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => !disabled && (e.key === 'Enter' || e.key === ' ') && onChange(!checked)}
      style={{ cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1 }}
    >
      <div className="gripr-switch-thumb" />
    </div>
  );
}

const TERRAIN_OPTIONS = [
  { label: 'Rocky Terrain', icon: <Mountain size={12} /> },
  { label: 'Wet Roots', icon: <Droplets size={12} /> },
  { label: 'Fast Flow Trail', icon: <Zap size={12} /> },
  { label: 'Long Gravel Ride', icon: <Route size={12} /> },
  { label: 'Technical Descents', icon: <ChevronDown size={12} /> },
  { label: 'Loose Corners', icon: <Wind size={12} /> },
  { label: 'Muddy Conditions', icon: <Droplets size={12} /> },
  { label: 'Dry Hardpack', icon: <Layers size={12} /> },
];

const getWeatherDescription = (weather: string) => {
  switch (weather) {
    case 'Dry': return 'Hard, baked trails — slightly higher pressures recommended';
    case 'Damp': return 'Varied grip — balanced pressure for traction & roll resistance';
    case 'Wet': return 'Slippery — lower pressures for max contact patch & grip';
    default: return '';
  }
};

const getTempColor = (temp: number) => {
  if (temp <= 5) return '#60A5FA';
  if (temp <= 15) return '#34D399';
  if (temp <= 28) return '#FBBF24';
  return '#F87171';
};

const getTempDescription = (temp: number) => {
  if (temp <= 5) return 'Cold — air pressure drops, adjust before ride';
  if (temp <= 20) return 'Moderate — standard pressure range';
  if (temp <= 32) return 'Warm — slight pressure increase expected';
  return 'Hot — check pressure mid-ride';
};

function StepProgress({ inputMode, gpxFile, selectedTerrains, riderWeight, bikeType, tireFront, tireRear }: { inputMode: 'terrain' | 'gpx'; gpxFile: File | null; selectedTerrains: string[]; riderWeight: number | undefined; bikeType: string | undefined; tireFront: number | undefined; tireRear: number | undefined }) {
  const steps = [
    { label: inputMode === 'gpx' ? 'GPX Route' : 'Terrain', done: inputMode === 'gpx' ? !!gpxFile : selectedTerrains.length > 0 },
    { label: 'Rider Info', done: riderWeight !== undefined && riderWeight !== null },
    { label: 'Bike Setup', done: bikeType !== undefined && tireFront !== undefined && tireRear !== undefined },
    { label: 'Weather', done: true },
    { label: 'Analyse', done: false },
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '2rem',
        overflowX: 'auto',
        paddingBottom: '0.25rem',
      }}
    >
      {steps.map((step, i) => (
        <div key={step.label} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? '1 1 0' : '0 0 auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: step.done ? 'var(--gripr-accent)' : 'var(--gripr-surface-3)',
                border: `2px solid ${step.done ? 'var(--gripr-accent)' : 'var(--gripr-border)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: step.done ? 'white' : 'var(--gripr-text-muted)',
                fontSize: '0.72rem',
                fontWeight: 700,
                fontFamily: 'var(--gripr-font-display)',
                transition: 'all 0.3s',
                flexShrink: 0,
              }}
            >
              {step.done ? '✓' : i + 1}
            </div>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: step.done ? 'var(--gripr-accent)' : 'var(--gripr-text-muted)',
                fontFamily: 'var(--gripr-font-display)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                whiteSpace: 'nowrap',
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
                background: step.done ? 'var(--gripr-accent)' : 'var(--gripr-border)',
                margin: '0 6px',
                marginBottom: 18,
                transition: 'background 0.3s',
                borderRadius: 50,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function AnalysisProgress() {
  const [step, setStep] = useState(0);
  const steps = [
    'Parsing GPX waypoints…',
    'Analysing elevation profile…',
    'Processing terrain characteristics…',
    'Calculating optimal pressures…',
    'Applying AI fine-tuning…',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s + 1) % steps.length);
    }, 420);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        background: 'var(--gripr-accent-dim)',
        border: '1px solid rgba(255,107,43,0.2)',
        borderRadius: 50,
        padding: '6px 14px',
      }}
    >
      <div
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: 'var(--gripr-accent)',
          boxShadow: '0 0 8px var(--gripr-accent)',
          animation: 'gripr-bounce 1s ease-in-out infinite',
        }}
      />
      <span
        style={{
          fontSize: '0.78rem',
          color: 'var(--gripr-accent)',
          fontFamily: 'var(--gripr-font-display)',
          fontWeight: 600,
        }}
      >
        {steps[step]}
      </span>
    </div>
  );
}

export function HomePage() {
  const [isDark, setIsDark] = useState(false);
  const [gpxFile, setGpxFile] = useState<File | null>(null);
  const [inputMode, setInputMode] = useState<'terrain' | 'gpx'>('terrain');

  const {
    values,
    setValue,
    errors,
    validateAll,
    reset: resetForm,
  } = useFormValidation({
    riderWeight: undefined,
    skillLevel: 'intermediate',
    ridingStyle: 'moderate',
    bikeType: undefined,
    tireFront: undefined,
    tireRear: undefined,
    wheelSize: '29"',
    tubeless: true,
    tireInserts: false,
    selectedTerrains: [],
    weather: 'dry',
    temperature: 14,
  });

  const { status, result, error, errorType, analyze, reset: resetAnalysis } = useAnalyze();

  const handleSubmit = useCallback(async () => {
    const { isValid } = validateAll();
    if (!isValid) return;

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
      selectedTerrains: inputMode === 'terrain' ? values.selectedTerrains as string[] : undefined,
      weather: values.weather as string,
      temperature: values.temperature as number,
    };

    await analyze(inputMode === 'gpx' ? gpxFile : null, riderInput);
  }, [gpxFile, values, analyze, inputMode]);

  const handleRetry = useCallback(async () => {
    await handleSubmit();
  }, [handleSubmit]);

  const handleReset = useCallback(() => {
    resetForm();
    resetAnalysis();
    setGpxFile(null);
    setInputMode('terrain');
  }, [resetForm, resetAnalysis]);

  useEffect(() => {
    if (status === 'success' && result) {
      setTimeout(() => {
        const el = document.getElementById('gripr-results');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [status, result]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <div className="gripr-app" data-theme={isDark ? 'dark' : 'light'}>
      <GriprNavbar isDark={isDark} onToggleTheme={setIsDark} />
      <HeroSection />

      <main id="gripr-content" style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div className="gripr-section-label" style={{ justifyContent: 'center', display: 'flex', marginBottom: '0.5rem' }}>
            Analysis Setup
          </div>
          <h2
            style={{
              fontFamily: 'var(--gripr-font-display)',
              letterSpacing: '-0.03em',
              margin: '0 0 0.5rem',
              color: 'var(--gripr-text-primary)',
            }}
          >
            Configure Your Ride
          </h2>
          <p style={{ margin: 0, color: 'var(--gripr-text-secondary)', maxWidth: 500, marginLeft: 'auto', marginRight: 'auto' }}>
            Fill in your details below for a personalised tire pressure recommendation tailored to your exact setup.
          </p>
        </div>

        <StepProgress inputMode={inputMode} gpxFile={gpxFile} selectedTerrains={values.selectedTerrains as string[]} riderWeight={values.riderWeight as number | undefined} bikeType={values.bikeType as string | undefined} tireFront={values.tireFront as number | undefined} tireRear={values.tireRear as number | undefined} />

        {status === 'loading' && <LoadingSpinner fullPage message="Analyzing your route..." />}

        {error && errorType === 'network' && <NetworkErrorAlert onRetry={handleRetry} />}
        {error && errorType !== 'network' && (
          <ErrorAlert
            message={error}
            title="Analysis Failed"
            onDismiss={resetAnalysis}
            onRetry={handleRetry}
          />
        )}

        {status === 'success' && result ? (
          <div id="gripr-results" className="gripr-animate-in">
            <ResultsSection
              baseline={result.baseline}
              terrainAdjusted={result.terrainAdjusted}
              aiRecommended={result.aiRecommended}
            />

            <div style={{ marginTop: '1.5rem' }}>
              <div className="gripr-section-label" style={{ marginBottom: '0.75rem' }}>
                AI Reasoning
              </div>
              <AIExplanation
                selectedTerrains={values.selectedTerrains as string[]}
                weather={values.weather as string}
                temperature={values.temperature as number}
                ridingStyle={values.ridingStyle as string}
                skillLevel={values.skillLevel as string}
                bikeType={values.bikeType as string}
                tubeless={values.tubeless as boolean}
                tireInserts={values.tireInserts as boolean}
                frontPsi={result.aiRecommended.front}
                rearPsi={result.aiRecommended.rear}
              />
            </div>

            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button
                onClick={handleReset}
                style={{
                  background: 'none',
                  border: '1.5px solid var(--gripr-border)',
                  borderRadius: 10,
                  padding: '0.65rem 1.5rem',
                  color: 'var(--gripr-text-secondary)',
                  fontFamily: 'var(--gripr-font-display)',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                }}
              >
                <ChevronDown size={15} style={{ transform: 'rotate(180deg)' }} />
                Modify Setup & Re-analyse
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="gripr-card">
              <div className="gripr-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="gripr-section-icon">
                    {inputMode === 'gpx' ? <UploadCloud size={18} strokeWidth={2} /> : <Mountain size={18} strokeWidth={2} />}
                  </div>
                  <div>
                    <div className="gripr-section-label" style={{ marginBottom: 0 }}>Step 1</div>
                    <h3 style={{ margin: 0, color: 'var(--gripr-text-primary)', fontFamily: 'var(--gripr-font-display)' }}>
                      {inputMode === 'gpx' ? 'Upload GPX Route' : 'Terrain Conditions'}
                    </h3>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, fontFamily: 'var(--gripr-font-display)', color: inputMode === 'gpx' ? 'var(--gripr-accent)' : 'var(--gripr-text-muted)' }}>
                    GPX
                  </span>
                  <GriprSwitch checked={inputMode === 'gpx'} onChange={(v) => setInputMode(v ? 'gpx' : 'terrain')} disabled={status === 'loading'} />
                </div>
              </div>
              <div className="gripr-card-body">
                {inputMode === 'gpx' ? (
                  <GPXUpload file={gpxFile} onChange={setGpxFile} disabled={status === 'loading'} />
                ) : (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--gripr-text-muted)' }}>
                        Select all that apply
                      </span>
                      {(values.selectedTerrains as string[]).length > 0 && (
                        <span
                          style={{
                            background: 'var(--gripr-accent)',
                            color: 'white',
                            borderRadius: 50,
                            width: 22,
                            height: 22,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                          }}
                        >
                          {(values.selectedTerrains as string[]).length}
                        </span>
                      )}
                    </div>
                    <div className="gripr-chips">
                      {TERRAIN_OPTIONS.map(({ label, icon }) => (
                        <button
                          key={label}
                          type="button"
                          className={`gripr-chip ${(values.selectedTerrains as string[]).includes(label) ? 'selected' : ''}`}
                          onClick={() => {
                            const terrains = values.selectedTerrains as string[];
                            if (terrains.includes(label)) {
                              setValue('selectedTerrains', terrains.filter((t) => t !== label));
                            } else {
                              setValue('selectedTerrains', [...terrains, label]);
                            }
                          }}
                          disabled={status === 'loading'}
                        >
                          {icon}
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <RiderForm
              weight={values.riderWeight as number}
              onWeightChange={(v: number) => setValue('riderWeight', v)}
              weightError={errors.riderWeight}
              skillLevel={values.skillLevel as string}
              onSkillChange={(v: string) => setValue('skillLevel', v)}
              ridingStyle={values.ridingStyle as string}
              onStyleChange={(v: string) => setValue('ridingStyle', v)}
              disabled={status === 'loading'}
            />

            <BikeSetupForm
              bikeType={values.bikeType as string}
              onBikeTypeChange={(v: string) => setValue('bikeType', v)}
              tireFront={values.tireFront as number}
              onTireFrontChange={(v: number) => setValue('tireFront', v)}
              tireRear={values.tireRear as number}
              onTireRearChange={(v: number) => setValue('tireRear', v)}
              wheelSize={values.wheelSize as string}
              onWheelSizeChange={(v: string) => setValue('wheelSize', v)}
              tubeless={values.tubeless as boolean}
              onTubelessChange={(v: boolean) => setValue('tubeless', v)}
              tireInserts={values.tireInserts as boolean}
              onTireInsertsChange={(v: boolean) => setValue('tireInserts', v)}
              disabled={status === 'loading'}
            />

            <div className="gripr-card">
              <div className="gripr-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="gripr-section-icon">
                    <CloudRain size={18} strokeWidth={2} />
                  </div>
                  <div>
                    <div className="gripr-section-label" style={{ marginBottom: 0 }}>Step 4</div>
                    <h3 style={{ margin: 0, color: 'var(--gripr-text-primary)', fontFamily: 'var(--gripr-font-display)' }}>
                      Weather Conditions
                    </h3>
                  </div>
                </div>
              </div>
              <div className="gripr-card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
                  <div>
                    <label className="gripr-label">Trail Conditions</label>
                    <SegmentedControl
                      options={['Dry', 'Damp', 'Wet']}
                      value={(values.weather as string).charAt(0).toUpperCase() + (values.weather as string).slice(1)}
                      onChange={(v) => setValue('weather', v.toLowerCase())}
                      disabled={status === 'loading'}
                    />
                    <div style={{ marginTop: '0.5rem' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--gripr-text-muted)' }}>
                        {getWeatherDescription((values.weather as string).charAt(0).toUpperCase() + (values.weather as string).slice(1))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="gripr-label">
                      Temperature
                      <span
                        style={{
                          marginLeft: 8,
                          fontFamily: 'var(--gripr-font-display)',
                          fontWeight: 700,
                          color: getTempColor(values.temperature as number),
                          fontSize: '0.85rem',
                        }}
                      >
                        {values.temperature}°C
                      </span>
                    </label>

                    <div style={{ position: 'relative', padding: '0.5rem 0' }}>
                      <div
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: 0,
                          right: 0,
                          height: 6,
                          transform: 'translateY(-50%)',
                          borderRadius: 50,
                          background: 'linear-gradient(to right, #60A5FA 0%, #34D399 25%, #FBBF24 62%, #F87171 100%)',
                          opacity: 0.3,
                          pointerEvents: 'none',
                        }}
                      />
                      <input
                        type="range"
                        className="gripr-temp-slider"
                        min={0}
                        max={40}
                        value={values.temperature as number}
                        onChange={(e) => setValue('temperature', Number(e.target.value))}
                        disabled={status === 'loading'}
                        style={{
                          position: 'relative',
                          zIndex: 1,
                          background: 'transparent',
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                      {['0°C', '10°C', '20°C', '30°C', '40°C'].map((t) => (
                        <span
                          key={t}
                          style={{
                            fontSize: '0.68rem',
                            color: 'var(--gripr-text-muted)',
                            fontFamily: 'var(--gripr-font-display)',
                            fontWeight: 600,
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <div style={{ marginTop: '0.5rem' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          background: 'var(--gripr-surface-3)',
                          border: '1px solid var(--gripr-border)',
                          borderRadius: 8,
                          padding: '4px 10px',
                        }}
                      >
                        <Thermometer size={12} style={{ color: getTempColor(values.temperature as number) }} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--gripr-text-secondary)', fontFamily: 'var(--gripr-font-display)', fontWeight: 600 }}>
                          {getTempDescription(values.temperature as number)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="gripr-card">
              <div className="gripr-card-body">
                <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ margin: '0 0 0.3rem', fontFamily: 'var(--gripr-font-display)', color: 'var(--gripr-text-primary)' }}>
                    Ready to Optimise?
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--gripr-text-secondary)' }}>
                    GripIQ will analyse your route, setup and conditions to recommend the perfect tire pressures.
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 6,
                    justifyContent: 'center',
                    marginBottom: '1.25rem',
                  }}
                >
                  {[
                    `${values.riderWeight} kg`,
                    values.skillLevel,
                    values.ridingStyle,
                    values.bikeType,
                    `${values.wheelSize} wheels`,
                    values.tubeless ? 'Tubeless' : 'Tubed',
                    values.weather,
                    `${values.temperature}°C`,
                    ...(inputMode === 'terrain' ? (values.selectedTerrains as string[]).slice(0, 3) : []),
                    ...(inputMode === 'gpx' && gpxFile ? [gpxFile.name] : []),
                  ].map((tag) => (
                    <span key={String(tag)} className="gripr-route-tag">
                      {tag}
                    </span>
                  ))}
                </div>

                <button
                  className="gripr-analyze-btn"
                  onClick={handleSubmit}
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? (
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

                {status === 'loading' && (
                  <div style={{ marginTop: '1rem', textAlign: 'center' }}>
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