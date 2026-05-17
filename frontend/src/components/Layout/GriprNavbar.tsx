import { Sun, Moon } from 'lucide-react';

interface GriprNavbarProps {
  isDark: boolean;
  onToggleTheme: (dark: boolean) => void;
}

export function GriprNavbar({ isDark, onToggleTheme }: GriprNavbarProps) {
  const scrollToContent = () => {
    const el = document.getElementById('gripr-content');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="gripr-navbar">
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="gripr-logo-text">
              Grip<span>R</span>
            </span>
            <span
              style={{
                display: 'inline-block',
                background: 'var(--gripr-accent-dim)',
                border: '1px solid rgba(255,107,43,0.25)',
                color: 'var(--gripr-accent)',
                fontSize: '0.62rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                padding: '2px 7px',
                borderRadius: 50,
                marginLeft: 2,
              }}
            >
              BETA
            </span>
          </div>

          {/* <div style={{ display: 'flex', gap: '1.75rem', alignItems: 'center' }}>
            {['Analyze', 'How It Works', 'About'].map((item) => (
              <button
                key={item}
                onClick={item === 'Analyze' ? scrollToContent : undefined}
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--gripr-text-secondary)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--gripr-font-display)',
                  transition: 'color 0.2s',
                }}
              >
                {item}
              </button>
            ))}
          </div> */}

          <div className="gripr-theme-toggle" role="group" aria-label="Toggle theme">
            <button
              className={`gripr-theme-btn ${!isDark ? 'active' : ''}`}
              onClick={() => onToggleTheme(false)}
              title="Light mode"
              aria-pressed={!isDark}
            >
              <Sun size={15} />
            </button>
            <button
              className={`gripr-theme-btn ${isDark ? 'active' : ''}`}
              onClick={() => onToggleTheme(true)}
              title="Dark mode"
              aria-pressed={isDark}
            >
              <Moon size={15} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}