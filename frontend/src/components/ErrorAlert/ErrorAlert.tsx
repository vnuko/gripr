import { AlertCircle, WifiOff, X } from "lucide-react";

const FONT_DISPLAY = "var(--gripr-font-display)";

const VARIANT_COLORS = {
  danger: {
    bg: "rgba(220, 53, 69, 0.1)",
    border: "rgba(220, 53, 69, 0.25)",
    text: "#DC3545",
  },
  warning: {
    bg: "rgba(255, 193, 7, 0.1)",
    border: "rgba(255, 193, 7, 0.25)",
    text: "#FFC107",
  },
  info: {
    bg: "rgba(13, 110, 253, 0.1)",
    border: "rgba(13, 110, 253, 0.25)",
    text: "#0D6EFD",
  },
} as const;

interface ErrorAlertProps {
  message: string;
  title?: string;
  onDismiss?: () => void;
  onRetry?: () => void;
  variant?: "danger" | "warning" | "info";
}

export function ErrorAlert({
  message,
  title,
  onDismiss,
  onRetry,
  variant = "danger",
}: ErrorAlertProps) {
  const colors = VARIANT_COLORS[variant];

  return (
    <div
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: 10,
        padding: "1rem 1.25rem",
        marginBottom: "1rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <AlertCircle size={20} style={{ color: colors.text, flexShrink: 0 }} />
          <div>
            {title && (
              <h4
                style={{
                  margin: "0 0 0.25rem",
                  fontFamily: FONT_DISPLAY,
                  color: colors.text,
                  fontSize: "0.95rem",
                  fontWeight: 700,
                }}
              >
                {title}
              </h4>
            )}
            <p
              style={{
                margin: 0,
                color: "var(--gripr-text-primary)",
                fontSize: "0.88rem",
              }}
            >
              {message}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {onRetry && (
            <button
              type="button"
              style={{
                background: "transparent",
                border: `1px solid ${colors.border}`,
                borderRadius: 6,
                padding: "0.35rem 0.75rem",
                color: colors.text,
                fontFamily: FONT_DISPLAY,
                fontWeight: 600,
                fontSize: "0.78rem",
                cursor: "pointer",
              }}
              onClick={onRetry}
            >
              Retry
            </button>
          )}
          {onDismiss && (
            <button
              type="button"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--gripr-text-muted)",
                padding: 4,
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
              }}
              onClick={onDismiss}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface NetworkErrorAlertProps {
  onRetry?: () => void;
}

export function NetworkErrorAlert({ onRetry }: NetworkErrorAlertProps) {
  return (
    <div
      style={{
        background: "rgba(255, 193, 7, 0.1)",
        border: "1px solid rgba(255, 193, 7, 0.25)",
        borderRadius: 10,
        padding: "1rem 1.25rem",
        marginBottom: "1rem",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
      }}
    >
      <WifiOff size={24} style={{ color: "#FFC107" }} />
      <div style={{ flex: 1 }}>
        <h4
          style={{
            margin: "0 0 0.25rem",
            fontFamily: FONT_DISPLAY,
            color: "#FFC107",
            fontSize: "0.95rem",
            fontWeight: 700,
          }}
        >
          Connection Issue
        </h4>
        <p
          style={{
            margin: 0,
            color: "var(--gripr-text-primary)",
            fontSize: "0.88rem",
          }}
        >
          Unable to reach the analysis server. Please check your connection and
          try again.
        </p>
      </div>
      {onRetry && (
        <button
          type="button"
          style={{
            background: "#FFC107",
            border: "none",
            borderRadius: 6,
            padding: "0.5rem 1rem",
            color: "white",
            fontFamily: FONT_DISPLAY,
            fontWeight: 600,
            fontSize: "0.85rem",
            cursor: "pointer",
          }}
          onClick={onRetry}
        >
          Retry
        </button>
      )}
    </div>
  );
}
