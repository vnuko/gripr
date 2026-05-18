import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
  fullPage?: boolean;
}

export function LoadingSpinner({
  message = "Analyzing your route...",
  fullPage = false,
}: LoadingSpinnerProps) {
  if (fullPage) {
    return (
      <div className="loading-overlay">
        <div className="text-center">
          <Loader2
            size={48}
            className="gripr-spin"
            style={{ color: "var(--gripr-accent)" }}
          />
          <p
            style={{
              marginTop: "1rem",
              color: "var(--gripr-text-primary)",
              fontFamily: "var(--gripr-font-display)",
              fontWeight: 600,
            }}
          >
            {message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center align-items-center py-4">
      <Loader2
        size={24}
        className="gripr-spin me-3"
        style={{ color: "var(--gripr-accent)" }}
      />
      <span style={{ color: "var(--gripr-text-secondary)" }}>{message}</span>
    </div>
  );
}
