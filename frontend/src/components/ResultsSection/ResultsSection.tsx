import { CheckCircle, Cpu, TrendingDown } from 'lucide-react';
import type { ReactNode } from 'react';
import type { PressureResult } from '../../api/generated';
import { psiToBar } from '../../utils/pressure.js';
import { PressureGauge } from './PressureGauge.js';

function ResultCard({
  type,
  result,
  featured = false,
  icon,
  delay = 0,
}: {
  type: string;
  result: PressureResult;
  featured?: boolean;
  icon: ReactNode;
  delay?: number;
}) {
  const getNoteDescription = () => {
    if (featured) {
      return 'Optimised pressure fine-tuned by AI for your specific terrain, setup, and conditions.';
    }
    if (type === 'Baseline Pressure') {
      return 'Standard starting point based on rider weight and bike type.';
    }
    if (type === 'Terrain Adjusted') {
      return 'Pressure adjusted for your selected terrain composition.';
    }
    return result.note;
  };

  return (
    <div
      className={`gripr-result-card gripr-animate-in ${featured ? 'featured' : ''}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {featured && (
        <div
          style={{
            background: 'linear-gradient(135deg, #FF6B2B 0%, #FF8C55 100%)',
            padding: '5px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <Cpu size={12} color="white" />
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: 'white',
              textTransform: 'uppercase',
              fontFamily: 'var(--gripr-font-display)',
            }}
          >
            AI Recommended
          </span>
        </div>
      )}

      <div className="gripr-result-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: featured ? 'var(--gripr-accent)' : 'var(--gripr-text-muted)' }}>
            {icon}
          </span>
          <span className="gripr-result-type">{type}</span>
        </div>
        <div className="gripr-result-badge">
          <CheckCircle size={10} />
          {result.confidence}% confidence
        </div>
      </div>

      <div className="gripr-result-body">
        <div className="gripr-tire-section">
          <div className="gripr-tire-title">Front Tire</div>
          <div className="gripr-gauge-row">
            <PressureGauge
              value={result.front}
              featured={featured}
              unit="PSI"
              variant="primary"
              size={100}
              showLabel={false}
            />
            <div className="gripr-gauge-divider" />
            <PressureGauge
              value={psiToBar(result.front)}
              featured={featured}
              unit="BAR"
              variant="secondary"
              size={80}
              showLabel={false}
            />
          </div>
        </div>
        
        <div className="gripr-tire-section">
          <div className="gripr-tire-title">Rear Tire</div>
          <div className="gripr-gauge-row">
            <PressureGauge
              value={result.rear}
              featured={featured}
              unit="PSI"
              variant="primary"
              size={100}
              showLabel={false}
            />
            <div className="gripr-gauge-divider" />
            <PressureGauge
              value={psiToBar(result.rear)}
              featured={featured}
              unit="BAR"
              variant="secondary"
              size={80}
              showLabel={false}
            />
          </div>
        </div>

        <div style={{ marginTop: '0.75rem' }}>
          <div className="gripr-confidence-bar">
            <div
              className="gripr-confidence-fill"
              style={{ width: `${result.confidence}%` }}
            />
          </div>
          <div className="gripr-confidence-label">
            <span className="gripr-confidence-text">Confidence Score</span>
            <span
              className="gripr-confidence-text"
              style={{ color: featured ? 'var(--gripr-accent)' : 'var(--gripr-text-secondary)' }}
            >
              {result.confidence}%
            </span>
          </div>
        </div>
      </div>

      <div className="gripr-result-note">{getNoteDescription()}</div>
    </div>
  );
}

interface ResultsSectionProps {
  baseline: PressureResult;
  terrainAdjusted: PressureResult;
  aiRecommended: PressureResult;
}

export function ResultsSection({
  baseline,
  terrainAdjusted,
  aiRecommended,
}: ResultsSectionProps) {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div>
          <div className="gripr-section-label">Analysis Complete</div>
          <h2
            style={{
              margin: 0,
              fontFamily: 'var(--gripr-font-display)',
              color: 'var(--gripr-text-primary)',
              letterSpacing: '-0.025em',
            }}
          >
            Pressure Recommendations
          </h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.88rem', color: 'var(--gripr-text-secondary)' }}>
            Based on your route, setup, and terrain analysis
          </p>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.25)',
            color: '#22C55E',
            borderRadius: 50,
            padding: '6px 14px',
            fontSize: '0.8rem',
            fontWeight: 700,
            fontFamily: 'var(--gripr-font-display)',
          }}
        >
          <CheckCircle size={14} />
          Analysis Complete
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.25rem',
        }}
      >
        <ResultCard
          type="Baseline Pressure"
          result={baseline}
          icon={<TrendingDown size={14} />}
          delay={0}
        />
        <ResultCard
          type="Terrain Adjusted"
          result={terrainAdjusted}
          icon={<TrendingDown size={14} />}
          delay={100}
        />
        <ResultCard
          type="AI Recommendation"
          result={aiRecommended}
          featured
          icon={<Cpu size={14} />}
          delay={200}
        />
      </div>

      <div
        className="gripr-card gripr-animate-in gripr-animate-in-delay-3"
        style={{ marginTop: '1.25rem' }}
      >
        <div className="gripr-stats-bar">
          {[
            { value: `${aiRecommended.front} PSI`, label: 'Front PSI' },
            { value: `${psiToBar(aiRecommended.front).toFixed(2)} BAR`, label: 'Front BAR' },
            { value: `${aiRecommended.rear} PSI`, label: 'Rear PSI' },
            { value: `${psiToBar(aiRecommended.rear).toFixed(2)} BAR`, label: 'Rear BAR' },
            { value: `${aiRecommended.confidence}%`, label: 'AI Confidence' },
          ].map(({ value, label }) => (
            <div key={label} className="gripr-stat-item">
              <div className="gripr-stat-value">{value}</div>
              <div className="gripr-stat-label">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}