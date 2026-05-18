interface SegmentedControlProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function SegmentedControl({
  options,
  value,
  onChange,
  disabled = false,
}: SegmentedControlProps) {
  return (
    <div className="gripr-segmented">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={`gripr-seg-btn ${value === option ? "active" : ""}`}
          onClick={() => !disabled && onChange(option)}
          disabled={disabled}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
