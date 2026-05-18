import { User } from "lucide-react";
import { SegmentedControl } from "../ui/SegmentedControl";

interface RiderFormProps {
  weight: number;
  onWeightChange: (v: number) => void;
  weightError?: string;
  skillLevel: string;
  onSkillChange: (v: string) => void;
  ridingStyle: string;
  onStyleChange: (v: string) => void;
  disabled?: boolean;
}

const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];
const RIDING_STYLES = ["Casual", "Balanced", "Aggressive"];
const TEXT_MUTED = "var(--gripr-text-muted)";

const getRidingStyleValue = (style: string): string => {
  if (style === "conservative") return "Casual";
  if (style === "aggressive") return "Aggressive";
  return "Balanced";
};

const getRidingStyleKey = (value: string): string => {
  if (value === "Casual") return "conservative";
  if (value === "Aggressive") return "aggressive";
  return "moderate";
};

const getSkillDescription = (level: string) => {
  switch (level) {
    case "Expert":
      return "Lower pressures, maximum grip & control";
    case "Advanced":
      return "Balanced performance setup";
    case "Intermediate":
      return "Moderate traction focus";
    default:
      return "Higher pressures for stability";
  }
};

export function RiderForm({
  weight,
  onWeightChange,
  weightError,
  skillLevel,
  onSkillChange,
  ridingStyle,
  onStyleChange,
  disabled = false,
}: RiderFormProps) {
  const skillLevelValue =
    skillLevel.charAt(0).toUpperCase() + skillLevel.slice(1);
  const ridingStyleValue = getRidingStyleValue(ridingStyle);

  return (
    <div className="gripr-card">
      <div className="gripr-card-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="gripr-section-icon">
            <User size={18} strokeWidth={2} />
          </div>
          <div>
            <div className="gripr-section-label" style={{ marginBottom: 0 }}>
              Step 2
            </div>
            <h3
              style={{
                margin: 0,
                color: "var(--gripr-text-primary)",
                fontFamily: "var(--gripr-font-display)",
              }}
            >
              Rider Information
            </h3>
          </div>
        </div>
      </div>

      <div className="gripr-card-body">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1.25rem",
          }}
        >
          <div className="gripr-form-group" style={{ marginBottom: 0 }}>
            <label className="gripr-label">
              Rider Weight
              <span
                style={{
                  color: "rgb(255, 140, 85)",
                  marginLeft: 4,
                  fontWeight: 600,
                }}
              >
                *
              </span>
            </label>
            <div className="gripr-input-wrap">
              <input
                type="number"
                className="gripr-input"
                value={weight || ""}
                onChange={(e) => onWeightChange(Number(e.target.value))}
                placeholder="73"
                min={40}
                max={160}
                disabled={disabled}
                style={{
                  paddingRight: "2.8rem",
                  borderColor: weightError ? "#dc3545" : undefined,
                }}
              />
              <span className="gripr-input-unit">kg</span>
            </div>
            {weightError ? (
              <div
                style={{
                  marginTop: "0.4rem",
                  fontSize: "0.75rem",
                  color: "#dc3545",
                }}
              >
                {weightError}
              </div>
            ) : (
              <div
                style={{
                  marginTop: "0.4rem",
                  fontSize: "0.75rem",
                  color: TEXT_MUTED,
                }}
              >
                Range: 40 – 160 kg
              </div>
            )}
          </div>

          <div className="gripr-form-group" style={{ marginBottom: 0 }}>
            <label className="gripr-label">Skill Level</label>
            <SegmentedControl
              options={SKILL_LEVELS}
              value={skillLevelValue}
              onChange={(v) => onSkillChange(v.toLowerCase())}
              disabled={disabled}
            />
            <div
              style={{
                marginTop: "0.4rem",
                fontSize: "0.75rem",
                color: TEXT_MUTED,
              }}
            >
              {getSkillDescription(skillLevelValue)}
            </div>
          </div>
        </div>

        <div style={{ marginTop: "1.25rem" }}>
          <label className="gripr-label">Riding Style</label>
          <SegmentedControl
            options={RIDING_STYLES}
            value={ridingStyleValue}
            onChange={(v) => onStyleChange(getRidingStyleKey(v))}
            disabled={disabled}
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "0.5rem",
              marginTop: "0.6rem",
            }}
          >
            {[
              {
                style: "Casual",
                desc: "Comfort & control, relaxed trail days",
              },
              { style: "Balanced", desc: "All-round performance & efficiency" },
              { style: "Aggressive", desc: "Max traction, fast cornering" },
            ].map(({ style, desc }) => (
              <div
                key={style}
                style={{
                  padding: "0.5rem 0.7rem",
                  transition: "all 0.2s",
                }}
              >
                <div
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: TEXT_MUTED,
                    fontFamily: "var(--gripr-font-display)",
                    marginBottom: 2,
                  }}
                >
                  {style}
                </div>
                <div
                  style={{
                    fontSize: "0.71rem",
                    color: TEXT_MUTED,
                    lineHeight: 1.4,
                  }}
                >
                  {desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
