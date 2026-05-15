import { Sparkles, ChevronDown } from 'lucide-react';

const HERO_IMAGE = '/bike_bg.webp';

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
            AI-Powered
          </div>
          <h1>
            AI Tire Pressure<br />
            Recommendations<br />
            for MTB Trails
          </h1>
          <p>
            Select multiple terrain types or Upload your GPX route and get intelligent, terrain-aware pressure
            recommendations for maximum grip and speed.
          </p>
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