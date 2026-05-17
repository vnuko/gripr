import { useState, useRef, useCallback } from 'react';
import { UploadCloud, FileText, X } from 'lucide-react';

interface GPXUploadProps {
  file: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}

export function GPXUpload({ file, onChange, disabled = false }: GPXUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.name.toLowerCase().endsWith('.gpx')) {
      onChange(dropped);
    }
  }, [disabled, onChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setDragOver(true);
  }, [disabled]);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) onChange(selected);
  }, [onChange]);

  const handleClear = useCallback(() => {
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  }, [onChange]);

  if (file) {
    return (
      <div>
        <div className="gripr-file-preview">
          <div className="gripr-file-icon">
            <FileText size={18} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="gripr-file-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {file.name}
            </div>
            <div className="gripr-file-size">{formatSize(file.size)} · GPX Route File</div>
          </div>
          {!disabled && (
            <button
              onClick={handleClear}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--gripr-text-muted)',
                padding: 4,
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
              }}
              title="Remove file"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* <div style={{ marginTop: '1rem' }}>
          <div
            className="gripr-gpx-map"
            style={{
              background: 'var(--gripr-surface-3)',
              borderRadius: 10,
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 100,
              border: '1px solid var(--gripr-border)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <svg viewBox="0 0 400 80" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="none">
              <defs>
                <linearGradient id="terrainGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(255,107,43,0.25)" />
                  <stop offset="100%" stopColor="rgba(255,107,43,0)" />
                </linearGradient>
              </defs>
              <path
                d="M0 60 Q30 20 60 45 Q90 70 120 30 Q150 5 180 35 Q210 60 240 25 Q270 0 300 40 Q330 65 360 30 L400 30 L400 80 L0 80 Z"
                fill="url(#terrainGrad)"
              />
              <path
                d="M0 60 Q30 20 60 45 Q90 70 120 30 Q150 5 180 35 Q210 60 240 25 Q270 0 300 40 Q330 65 360 30 L400 30"
                fill="none"
                stroke="#FF6B2B"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="0" cy="60" r="4" fill="#FF6B2B" />
              <circle cx="400" cy="30" r="4" fill="#FF6B2B" />
            </svg>

            <div
              style={{
                position: 'relative',
                zIndex: 1,
                background: 'var(--gripr-surface)',
                border: '1px solid var(--gripr-border)',
                borderRadius: 8,
                padding: '4px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: 'var(--gripr-shadow-card)',
              }}
            >
              <MapPin size={11} style={{ color: 'var(--gripr-accent)' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gripr-text-primary)', fontFamily: 'var(--gripr-font-display)' }}>
                Route Loaded
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
            {[
              { icon: <TrendingUp size={14} />, label: 'Distance', value: '24.3 km' },
              { icon: <Mountain size={14} />, label: 'Elevation', value: '+1,240 m' },
              { icon: <MapPin size={14} />, label: 'Waypoints', value: '847 pts' },
            ].map(({ icon, label, value }) => (
              <div
                key={label}
                style={{
                  background: 'var(--gripr-surface-3)',
                  border: '1px solid var(--gripr-border)',
                  borderRadius: 10,
                  padding: '0.65rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span style={{ color: 'var(--gripr-accent)' }}>{icon}</span>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--gripr-text-muted)', fontWeight: 600, fontFamily: 'var(--gripr-font-display)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {label}
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--gripr-text-primary)', fontFamily: 'var(--gripr-font-display)' }}>
                    {value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div> */}
      </div>
    );
  }

  return (
    <div
      className={`gripr-upload-zone ${dragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      style={{ cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1 }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".gpx"
        onChange={handleFileChange}
        disabled={disabled}
        style={{ display: 'none' }}
      />
      <div className="gripr-upload-icon">
        <UploadCloud size={26} strokeWidth={1.8} />
      </div>
      <div className="gripr-upload-title">
        {dragOver ? 'Drop your GPX file here' : 'Drag & drop your GPX file'}
      </div>
      <div className="gripr-upload-sub">
        or click to browse your files
      </div>
      <div className="gripr-upload-format">
        <FileText size={11} />
        .GPX Format Only
      </div>
    </div>
  );
}