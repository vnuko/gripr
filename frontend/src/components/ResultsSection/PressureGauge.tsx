interface PressureGaugeProps {
  value: number;
  label: string;
  min?: number;
  max?: number;
  featured?: boolean;
  size?: number;
}

export function PressureGauge({
  value,
  label,
  min = 14,
  max = 42,
  featured = false,
  size = 110,
}: PressureGaugeProps) {
  const radius = 40;
  const center = size / 2;
  const strokeWidth = 7;
  const circumference = 2 * Math.PI * radius;

  const arcDegrees = 240;
  const arcLength = (arcDegrees / 360) * circumference;
  const gapLength = circumference - arcLength;

  const pct = Math.min(Math.max((value - min) / (max - min), 0), 1);
  const fillLength = pct * arcLength;

  const startAngle = 150;
  const accentColor = featured ? '#FF6B2B' : '#9396a8';
  const trackColor = 'var(--gripr-surface-3)';

  return (
    <div className="gripr-psi-item">
      <div className="gripr-psi-position">{label} Tire</div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg
          width={size}
          height={size * 0.85}
          viewBox={`0 0 ${size} ${size * 0.9}`}
          className="gripr-gauge-svg"
          style={{ overflow: 'visible' }}
        >
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${gapLength}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform={`rotate(${startAngle} ${center} ${center})`}
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={accentColor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${fillLength} ${circumference - fillLength}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform={`rotate(${startAngle} ${center} ${center})`}
            style={{
              filter: featured ? 'drop-shadow(0 0 6px rgba(255,107,43,0.5))' : undefined,
              transition: 'stroke-dasharray 1s cubic-bezier(0.4,0,0.2,1)',
            }}
          />
          <text
            x={center}
            y={center + 3}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{
              fill: featured ? '#FF6B2B' : 'var(--gripr-text-primary)',
              fontSize: '1.5rem',
              fontWeight: 700,
              letterSpacing: '-0.03em',
            }}
          >
            {value}
          </text>
          <text
            x={center}
            y={center + 20}
            textAnchor="middle"
            style={{
              fill: 'var(--gripr-text-muted)',
              fontSize: '0.62rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            PSI
          </text>
        </svg>
      </div>
    </div>
  );
}