import { Github, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="gripr-footer">
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--gripr-accent)', fontFamily: 'var(--gripr-font-display)', fontWeight: 700 }}>
              GripR
            </span>
            <span>·</span>
            <span>AI MTB Tire Intelligence</span>
            <span>·</span>
            <span>MVP · MTB Only</span>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span>Future: Gravel · Road</span>
            <a href="#" style={{ color: 'var(--gripr-text-muted)' }}><Github size={15} /></a>
            <a href="#" style={{ color: 'var(--gripr-text-muted)' }}><Twitter size={15} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}