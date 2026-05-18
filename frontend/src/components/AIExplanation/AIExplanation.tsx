import { Cpu, TrendingDown, Shield, Gauge, AlertTriangle } from "lucide-react";

interface AIExplanationProps {
  selectedTerrains: string[];
  weather: string;
  temperature: number;
  ridingStyle: string;
  bikeType: string;
  tubeless: boolean;
  tireInserts: boolean;
  frontPsi: number;
  rearPsi: number;
  aiReasoning: string;
}

export function AIExplanation({
  selectedTerrains,
  weather,
  temperature,
  ridingStyle,
  bikeType,
  tubeless,
  tireInserts,
  frontPsi,
  rearPsi,
  aiReasoning,
}: AIExplanationProps) {
  const FONT_DISPLAY = "var(--gripr-font-display)";
  const hasRockyOrTechnical =
    selectedTerrains.includes("Rocky / Stony Terrain") ||
    selectedTerrains.includes("Roots / Rough Trails") ||
    selectedTerrains.includes("Steep / Extreme Descents");
  const isWet = weather === "wet";
  const isDamp = weather === "damp";
  const isCold = temperature < 10;
  const isAggressive = ridingStyle === "aggressive";

  const buildExplanation = () => {
    const parts: string[] = [];

    if (isWet || isDamp) {
      parts.push(
        `Lower front pressure (${frontPsi} PSI) improves grip on ${isWet ? "wet" : "damp"} trail surfaces while maintaining rear support`,
      );
    } else {
      parts.push(
        `Balanced pressure setup (F: ${frontPsi} PSI / R: ${rearPsi} PSI) optimised for dry hardpack efficiency`,
      );
    }

    if (hasRockyOrTechnical) {
      parts.push("reduced tyre deformation on rocky impacts");
    }

    if (tubeless) {
      parts.push(
        "tubeless setup allows lower pressures without pinch flat risk",
      );
    }

    if (tireInserts) {
      parts.push(
        "inserts provide rim protection, enabling aggressive lower limits",
      );
    }

    if (isCold) {
      parts.push(
        `cold temperature (${temperature}°C) reduces air density — pressures adjusted accordingly`,
      );
    }

    if (isAggressive) {
      parts.push("aggressive style tuned for maximum cornering traction");
    }

    return parts.join(". ").replace(/\.\./g, ".") + ".";
  };

  const explanation = buildExplanation();

  const getFrontTyreDescription = () => {
    if (isWet) return "Wet grip optimised";
    if (hasRockyOrTechnical) return "Impact absorption";
    return "Roll efficiency";
  };

  const insights = [
    {
      icon: <Gauge size={14} />,
      title: "Front Tyre",
      desc: `${frontPsi} PSI — ${getFrontTyreDescription()}`,
    },
    {
      icon: <Shield size={14} />,
      title: "Rear Tyre",
      desc: `${rearPsi} PSI — ${isAggressive ? "Traction biased" : "Support & control"}`,
    },
    {
      icon: <TrendingDown size={14} />,
      title: "Terrain",
      desc:
        selectedTerrains.length > 0
          ? selectedTerrains.slice(0, 2).join(", ")
          : "General MTB trail",
    },
    {
      icon: <AlertTriangle size={14} />,
      title: "Conditions",
      desc: `${weather.charAt(0).toUpperCase() + weather.slice(1)} · ${temperature}°C · ${bikeType.charAt(0).toUpperCase() + bikeType.slice(1)} Setup`,
    },
  ];

  return (
    <div className="gripr-ai-card gripr-animate-in">
      <div className="gripr-ai-header">
        <div className="gripr-ai-avatar">
          <Cpu size={22} strokeWidth={1.8} />
        </div>
        <div style={{ flex: 1 }}>
          <div className="gripr-ai-name">GripR AI Summary</div>
          <div className="gripr-ai-label">
            Analysed on:{" "}
            {new Date().toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(34,197,94,0.1)",
            border: "1px solid rgba(34,197,94,0.2)",
            color: "#22C55E",
            borderRadius: 50,
            padding: "4px 12px",
            fontSize: "0.72rem",
            fontWeight: 700,
            fontFamily: FONT_DISPLAY,
            letterSpacing: "0.06em",
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#22C55E",
              boxShadow: "0 0 6px #22C55E",
              display: "inline-block",
            }}
          />
          ACTIVE
        </div>
      </div>

      <div className="gripr-ai-explanation">
        <p style={{ margin: "0 0 1rem" }}>
          <strong
            style={{
              fontFamily: FONT_DISPLAY,
              color: "var(--gripr-text-primary)",
            }}
          >
            AI Analysis Summary:
          </strong>{" "}
          {explanation}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: "0.88rem",
            color: "var(--gripr-text-secondary)",
            lineHeight: 1.7,
          }}
        >
          {aiReasoning ||
            "AI analysis unavailable. Using deterministic pressure calculation based on your setup and terrain."}
        </p>
      </div>

      {selectedTerrains.length > 0 && (
        <div
          style={{
            padding: "0 1.5rem 1.25rem",
            borderTop: "1px solid var(--gripr-border)",
            paddingTop: "1rem",
          }}
        >
          <div
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--gripr-text-muted)",
              fontFamily: FONT_DISPLAY,
              marginBottom: "0.6rem",
            }}
          >
            Route Terrain Profile
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {selectedTerrains.map((t) => (
              <span
                key={t}
                className="gripr-route-tag"
                style={{
                  color: "var(--gripr-accent)",
                  borderColor: "rgba(255,107,43,0.2)",
                  background: "var(--gripr-accent-dim)",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="gripr-ai-insights">
        {insights.map(({ icon, title, desc }) => (
          <div key={title} className="gripr-insight-item">
            <div className="gripr-insight-icon">{icon}</div>
            <div>
              <div className="gripr-insight-title">{title}</div>
              <div className="gripr-insight-desc">{desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          padding: "0.85rem 1.5rem",
          borderTop: "1px solid var(--gripr-border)",
          background: "var(--gripr-surface-2)",
          fontSize: "0.74rem",
          color: "var(--gripr-text-muted)",
          lineHeight: 1.6,
          display: "flex",
          alignItems: "flex-start",
          gap: 8,
        }}
      >
        <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>
          GripR recommendations are advisory only. Conditions vary — always ride
          within your ability and consult a qualified mechanic for
          safety-critical adjustments.
        </span>
      </div>
    </div>
  );
}
