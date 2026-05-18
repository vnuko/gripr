interface PressureGaugeProps {
  value: number;
  label?: string;
  min?: number;
  max?: number;
  featured?: boolean;
  size?: number;
  unit?: "PSI" | "BAR";
  variant?: "primary" | "secondary";
  showLabel?: boolean;
}

export function PressureGauge({
  value,
  label,
  min = 14,
  max = 42,
  featured = false,
  size = 100,
  unit = "PSI",
  variant = "primary",
  showLabel = true,
}: PressureGaugeProps) {
  const isSecondary = variant === "secondary";
  const baseRadius = 40;
  const scaleFactor = size / 110;
  const radius = baseRadius * scaleFactor;
  const center = size / 2;
  const strokeWidth = isSecondary ? 5 : 7;
  const circumference = 2 * Math.PI * radius;

  const arcDegrees = 240;
  const arcLength = (arcDegrees / 360) * circumference;
  const gapLength = circumference - arcLength;

  const barMin = 1.0;
  const barMax = 2.9;
  const effectiveMin = unit === "BAR" ? barMin : min;
  const effectiveMax = unit === "BAR" ? barMax : max;
  const pct = Math.min(
    Math.max((value - effectiveMin) / (effectiveMax - effectiveMin), 0),
    1,
  );
  const fillLength = pct * arcLength;

  const startAngle = 150;

  const getAccentColor = (): string => {
    if (featured) return "#FF6B2B";
    if (isSecondary) return "var(--gripr-text-muted)";
    return "#9396a8";
  };
  const accentColor = getAccentColor();
  const trackColor = "var(--gripr-surface-3)";

  const valueFontSize = isSecondary
    ? `${1.2 * scaleFactor}rem`
    : `${1.5 * scaleFactor}rem`;
  const unitFontSize = isSecondary
    ? `${0.55 * scaleFactor}rem`
    : `${0.62 * scaleFactor}rem`;
  const unitYOffset = isSecondary ? 16 * scaleFactor : 20;
  const displayValue = unit === "BAR" ? value.toFixed(2) : value;

  const getTextFillColor = (): string => {
    if (featured) return "#FF6B2B";
    if (isSecondary) return "var(--gripr-text-secondary)";
    return "var(--gripr-text-primary)";
  };
  const textFillColor = getTextFillColor();

  return (
    <div
      className={
        isSecondary
          ? "gripr-gauge-wrapper gripr-gauge-secondary"
          : "gripr-gauge-wrapper"
      }
    >
      {showLabel && label && (
        <div className="gripr-psi-position">{label} Tire</div>
      )}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <svg
          width={size + "%"}
          height={size + "%"}
          viewBox={`0 0 ${size} ${size * 0.9}`}
          className="gripr-gauge-svg"
          style={{ overflow: "visible" }}
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
              filter: featured
                ? "drop-shadow(0 0 6px rgba(255,107,43,0.5))"
                : undefined,
              transition: "stroke-dasharray 1s cubic-bezier(0.4,0,0.2,1)",
            }}
          />
          <text
            x={center}
            y={center + 3 * scaleFactor}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{
              fill: textFillColor,
              fontSize: valueFontSize,
              fontWeight: 700,
              letterSpacing: "-0.03em",
            }}
          >
            {displayValue}
          </text>
          <text
            x={center}
            y={center + unitYOffset}
            textAnchor="middle"
            style={{
              fill: "var(--gripr-text-muted)",
              fontSize: unitFontSize,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {unit}
          </text>
        </svg>
      </div>
    </div>
  );
}
