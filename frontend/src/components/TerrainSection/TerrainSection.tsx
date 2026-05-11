import {
  Mountain,
  Droplets,
  Zap,
  Route,
  ChevronDown,
  Layers,
  Wind,
  Thermometer,
  CloudRain,
} from 'lucide-react';
import { SegmentedControl } from '../ui/SegmentedControl';

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

interface TerrainSectionProps {
  selectedTerrains: string[];
  onTerrainsChange: (terrains: string[]) => void;
  weather: string;
  onWeatherChange: (v: string) => void;
  temperature: number;
  onTemperatureChange: (v: number) => void;
  disabled?: boolean;
}

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

export function TerrainSection({
  selectedTerrains,
  onTerrainsChange,
  weather,
  onWeatherChange,
  temperature,
  onTemperatureChange,
  disabled = false,
}: TerrainSectionProps) {
  const toggleTerrain = (terrain: string) => {
    if (disabled) return;
    if (selectedTerrains.includes(terrain)) {
      onTerrainsChange(selectedTerrains.filter((t) => t !== terrain));
    } else {
      onTerrainsChange([...selectedTerrains, terrain]);
    }
  };

  const weatherValue = weather.charAt(0).toUpperCase() + weather.slice(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="gripr-card">
        <div className="gripr-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="gripr-section-icon">
              <Mountain size={18} strokeWidth={2} />
            </div>
            <div>
              <div className="gripr-section-label" style={{ marginBottom: 0 }}>Step 4</div>
              <h3 style={{ margin: 0, color: 'var(--gripr-text-primary)', fontFamily: 'var(--gripr-font-display)' }}>
                Terrain Conditions
              </h3>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {selectedTerrains.length > 0 && (
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
                {selectedTerrains.length}
              </span>
            )}
            <span style={{ fontSize: '0.78rem', color: 'var(--gripr-text-muted)' }}>
              Select all that apply
            </span>
          </div>
        </div>

        <div className="gripr-card-body">
          <div className="gripr-chips">
            {TERRAIN_OPTIONS.map(({ label, icon }) => (
              <button
                key={label}
                type="button"
                className={`gripr-chip ${selectedTerrains.includes(label) ? 'selected' : ''}`}
                onClick={() => toggleTerrain(label)}
                disabled={disabled}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="gripr-card">
        <div className="gripr-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="gripr-section-icon">
              <CloudRain size={18} strokeWidth={2} />
            </div>
            <div>
              <div className="gripr-section-label" style={{ marginBottom: 0 }}>Step 5</div>
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
                value={weatherValue}
                onChange={(v) => onWeatherChange(v.toLowerCase())}
                disabled={disabled}
              />
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--gripr-text-muted)' }}>
                  {getWeatherDescription(weatherValue)}
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
                    color: getTempColor(temperature),
                    fontSize: '0.85rem',
                  }}
                >
                  {temperature}°C
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
                  value={temperature}
                  onChange={(e) => onTemperatureChange(Number(e.target.value))}
                  disabled={disabled}
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
                  <Thermometer size={12} style={{ color: getTempColor(temperature) }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--gripr-text-secondary)', fontFamily: 'var(--gripr-font-display)', fontWeight: 600 }}>
                    {getTempDescription(temperature)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}