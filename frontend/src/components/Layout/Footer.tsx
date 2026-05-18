import { Github, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="gripr-footer">
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 1.5rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                color: "var(--gripr-accent)",
                fontFamily: "var(--gripr-font-display)",
                fontWeight: 700,
              }}
            >
              GripR
            </span>
            <span>·</span>
            <span>AI Powered</span>
            <span>·</span>
            <span>MVP</span>
            <span>·</span>
            <span>MTB & Gravel Only</span>
          </div>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <a
              href="https://github.com/vnuko/gripr"
              style={{ color: "var(--gripr-text-muted)" }}
            >
              <Github size={15} />
            </a>
            <a href="#" style={{ color: "var(--gripr-text-muted)" }}>
              <Instagram size={15} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
