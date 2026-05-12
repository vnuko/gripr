import { Settings2 } from 'lucide-react';
import { SegmentedControl } from '../ui/SegmentedControl';

interface BikeSetupFormProps {
  bikeType: string;
  onBikeTypeChange: (v: string) => void;
  tireFront: number;
  onTireFrontChange: (v: number) => void;
  tireRear: number;
  onTireRearChange: (v: number) => void;
  wheelSize: string;
  onWheelSizeChange: (v: string) => void;
  tubeless: boolean;
  onTubelessChange: (v: boolean) => void;
  tireInserts: boolean;
  onTireInsertsChange: (v: boolean) => void;
  disabled?: boolean;
}

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

const BIKE_TYPE_TIRE_DEFAULTS: Record<string, { front: number; rear: number }> = {
  xc: { front: 2.2, rear: 2.2 },
  trail: { front: 2.4, rear: 2.4 },
  enduro: { front: 2.5, rear: 2.5 },
  downhill: { front: 2.5, rear: 2.5 },
  gravel: { front: 1.77, rear: 1.77 },
};

export function BikeSetupForm({
  bikeType,
  onBikeTypeChange,
  tireFront,
  onTireFrontChange,
  tireRear,
  onTireRearChange,
  wheelSize,
  onWheelSizeChange,
  tubeless,
  onTubelessChange,
  tireInserts,
  onTireInsertsChange,
  disabled = false,
}: BikeSetupFormProps) {
  const defaultTireWidth = BIKE_TYPE_TIRE_DEFAULTS[bikeType]?.front ?? 2.4;

  return (
    <div className="gripr-card">
      <div className="gripr-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="gripr-section-icon">
            <Settings2 size={18} strokeWidth={2} />
          </div>
          <div>
            <div className="gripr-section-label" style={{ marginBottom: 0 }}>Step 3</div>
            <h3 style={{ margin: 0, color: 'var(--gripr-text-primary)', fontFamily: 'var(--gripr-font-display)' }}>
              Bike Setup
            </h3>
          </div>
        </div>
      </div>

      <div className="gripr-card-body">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <div className="gripr-form-group" style={{ marginBottom: 0 }}>
            <label className="gripr-label">
              Bike Type
              <span style={{ color: 'rgb(255, 140, 85)', marginLeft: 4, fontWeight: 600 }}>*</span>
            </label>
            <select
              className="gripr-select"
              value={bikeType || ''}
              onChange={(e) => onBikeTypeChange(e.target.value)}
              disabled={disabled}
            >
              <option value="" disabled>Please select</option>
              <option value="xc">XC — Cross Country</option>
              <option value="trail">Trail</option>
              <option value="enduro">Enduro</option>
              <option value="downhill">Downhill</option>
              <option value="gravel">Gravel</option>
            </select>
          </div>

          <div className="gripr-form-group" style={{ marginBottom: 0 }}>
            <label className="gripr-label">Wheel Size</label>
            <SegmentedControl
              options={['27.5"', '29"']}
              value={wheelSize}
              onChange={onWheelSizeChange}
              disabled={disabled}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginTop: '1.25rem' }}>
          <div className="gripr-form-group" style={{ marginBottom: 0 }}>
            <label className="gripr-label">Front Tire Width</label>
            <div className="gripr-input-wrap">
              <input
                type="number"
                className="gripr-input"
                value={tireFront || ''}
                onChange={(e) => onTireFrontChange(Number(e.target.value))}
                placeholder={defaultTireWidth.toString()}
                min={1.8}
                max={3.0}
                step={0.05}
                disabled={disabled}
                style={{ paddingRight: '3.2rem' }}
              />
              <span className="gripr-input-unit">inches</span>
            </div>
          </div>

          <div className="gripr-form-group" style={{ marginBottom: 0 }}>
            <label className="gripr-label">Rear Tire Width</label>
            <div className="gripr-input-wrap">
              <input
                type="number"
                className="gripr-input"
                value={tireRear || ''}
                onChange={(e) => onTireRearChange(Number(e.target.value))}
                placeholder={defaultTireWidth.toString()}
                min={1.8}
                max={3.0}
                step={0.05}
                disabled={disabled}
                style={{ paddingRight: '3.2rem' }}
              />
              <span className="gripr-input-unit">inches</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.25rem' }}>
          <div className="gripr-toggle-row">
            <div>
              <div className="gripr-toggle-label">Tubeless Setup</div>
              <div className="gripr-toggle-desc">
                {tubeless ? 'Tubeless setup allows lower pressures with added puncture protection' : 'Tube setup requires slightly higher minimum pressures'}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, fontFamily: 'var(--gripr-font-display)', color: tubeless ? 'var(--gripr-accent)' : 'var(--gripr-text-muted)' }}>
                {tubeless ? 'YES' : 'NO'}
              </span>
              <GriprSwitch checked={tubeless} onChange={onTubelessChange} disabled={disabled} />
            </div>
          </div>

          <div className="gripr-toggle-row">
            <div>
              <div className="gripr-toggle-label">Tire Inserts</div>
              <div className="gripr-toggle-desc">
                {tireInserts ? 'Tire inserts allow lower pressures with added rim protection' : 'No tire inserts, standard pressure recommendations apply'}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, fontFamily: 'var(--gripr-font-display)', color: tireInserts ? 'var(--gripr-accent)' : 'var(--gripr-text-muted)' }}>
                {tireInserts ? 'YES' : 'NO'}
              </span>
              <GriprSwitch checked={tireInserts} onChange={onTireInsertsChange} disabled={disabled} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}