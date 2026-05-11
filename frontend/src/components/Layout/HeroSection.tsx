import { Sparkles, ChevronDown } from 'lucide-react';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1562861894-0918c74b6448?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGJpa2UlMjB0cmFpbCUyMHJpZGluZyUyMGFjdGlvbnxlbnwxfHx8fDE3Nzg1MDExMzh8MA&ixlib=rb-4.1.0&q=80&w=1080';

export function HeroSection() {
  const scrollToContent = () => {
    const el = document.getElementById('gripr-content');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="gripr-hero">
      <div
        className="gripr-hero-bg"
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
      />
      <div className="gripr-hero-overlay" />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '4rem 1.5rem 5rem', width: '100%' }}>
        <div className="gripr-hero-content gripr-animate-in">
          <div className="gripr-hero-badge">
            <Sparkles size={11} />
            AI-Powered MTB Intelligence
          </div>
          <h1>
            AI Tire Pressure<br />
            Recommendations<br />
            for MTB Trails
          </h1>
          <p>
            Upload your GPX route and get intelligent, terrain-aware pressure
            recommendations for maximum grip, comfort, and speed.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: '1.5rem' }}>
            {['Rocky Terrain', 'Technical Descents', 'Wet Roots', 'Fast Flow Trails'].map((tag) => (
              <span
                key={tag}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'rgba(255,255,255,0.85)',
                  borderRadius: 50,
                  padding: '4px 13px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  fontFamily: 'var(--gripr-font-display)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <button
        className="gripr-scroll-indicator"
        onClick={scrollToContent}
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        aria-label="Scroll to content"
      >
        <span>Scroll</span>
        <ChevronDown size={16} />
      </button>
    </section>
  );
}