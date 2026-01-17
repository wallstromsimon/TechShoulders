import { useState, useEffect, useCallback } from 'react';

interface EraSliderProps {
  minYear: number;
  maxYear: number;
  value: [number, number];
  onChange: (range: [number, number]) => void;
}

export default function EraSlider({ minYear, maxYear, value, onChange }: EraSliderProps) {
  const [localValue, setLocalValue] = useState<[number, number]>(value);

  // Sync local state with prop changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounced onChange to avoid too many updates
  const handleChange = useCallback(
    (newValue: [number, number]) => {
      setLocalValue(newValue);
      // Debounce the actual onChange call
      const timeout = setTimeout(() => {
        onChange(newValue);
      }, 150);
      return () => clearTimeout(timeout);
    },
    [onChange]
  );

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = parseInt(e.target.value, 10);
    if (newMin <= localValue[1]) {
      handleChange([newMin, localValue[1]]);
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = parseInt(e.target.value, 10);
    if (newMax >= localValue[0]) {
      handleChange([localValue[0], newMax]);
    }
  };

  const handleReset = () => {
    handleChange([minYear, maxYear]);
  };

  // Calculate percentages for visual slider track
  const minPercent = ((localValue[0] - minYear) / (maxYear - minYear)) * 100;
  const maxPercent = ((localValue[1] - minYear) / (maxYear - minYear)) * 100;

  const isFiltered = localValue[0] !== minYear || localValue[1] !== maxYear;

  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.5rem',
        }}
      >
        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>
          Era: {localValue[0]} – {localValue[1]}
        </span>
        {isFiltered && (
          <button
            onClick={handleReset}
            style={{
              fontSize: '0.75rem',
              padding: '0.125rem 0.5rem',
              background: 'none',
              border: '1px solid #ccc',
              borderRadius: 4,
              cursor: 'pointer',
              color: '#666',
            }}
          >
            Reset
          </button>
        )}
      </div>

      {/* Visual track */}
      <div
        style={{
          position: 'relative',
          height: 8,
          background: '#e0e0e0',
          borderRadius: 4,
          marginBottom: '0.5rem',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
            height: '100%',
            background: '#3498db',
            borderRadius: 4,
          }}
        />
      </div>

      {/* Dual range inputs */}
      <div
        style={{
          position: 'relative',
          height: 20,
        }}
      >
        <input
          type="range"
          min={minYear}
          max={maxYear}
          value={localValue[0]}
          onChange={handleMinChange}
          style={{
            position: 'absolute',
            width: '100%',
            height: 20,
            appearance: 'none',
            background: 'transparent',
            pointerEvents: 'none',
            zIndex: 2,
          }}
          className="era-slider-thumb"
        />
        <input
          type="range"
          min={minYear}
          max={maxYear}
          value={localValue[1]}
          onChange={handleMaxChange}
          style={{
            position: 'absolute',
            width: '100%',
            height: 20,
            appearance: 'none',
            background: 'transparent',
            pointerEvents: 'none',
            zIndex: 2,
          }}
          className="era-slider-thumb"
        />
      </div>

      {/* Year labels */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.7rem',
          color: '#999',
          marginTop: '0.25rem',
        }}
      >
        <span>{minYear}</span>
        <span>{maxYear}</span>
      </div>

      {/* Manual input fields */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center',
          marginTop: '0.5rem',
        }}
      >
        <input
          type="number"
          min={minYear}
          max={localValue[1]}
          value={localValue[0]}
          onChange={(e) => {
            const newMin = parseInt(e.target.value, 10);
            if (!isNaN(newMin) && newMin >= minYear && newMin <= localValue[1]) {
              handleChange([newMin, localValue[1]]);
            }
          }}
          style={{
            width: 70,
            padding: '0.25rem 0.5rem',
            fontSize: '0.85rem',
            border: '1px solid #ccc',
            borderRadius: 4,
            textAlign: 'center',
          }}
        />
        <span style={{ color: '#999' }}>to</span>
        <input
          type="number"
          min={localValue[0]}
          max={maxYear}
          value={localValue[1]}
          onChange={(e) => {
            const newMax = parseInt(e.target.value, 10);
            if (!isNaN(newMax) && newMax >= localValue[0] && newMax <= maxYear) {
              handleChange([localValue[0], newMax]);
            }
          }}
          style={{
            width: 70,
            padding: '0.25rem 0.5rem',
            fontSize: '0.85rem',
            border: '1px solid #ccc',
            borderRadius: 4,
            textAlign: 'center',
          }}
        />
      </div>

      {/* CSS for slider thumbs */}
      <style>{`
        .era-slider-thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          background: #3498db;
          border-radius: 50%;
          cursor: pointer;
          pointer-events: auto;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        .era-slider-thumb::-moz-range-thumb {
          width: 18px;
          height: 18px;
          background: #3498db;
          border-radius: 50%;
          cursor: pointer;
          pointer-events: auto;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
}
