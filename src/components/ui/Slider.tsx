import { InputHTMLAttributes, forwardRef } from 'react';

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  showValue?: boolean;
  valueLabel?: string;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ label, showValue = true, valueLabel, value, min = 0, max = 100, step = 1, className = '', ...props }, ref) => {
    const percentage = ((Number(value) - Number(min)) / (Number(max) - Number(min))) * 100;

    return (
      <div className="w-full">
        {(label || showValue) && (
          <div className="flex items-center justify-between mb-2">
            {label && (
              <label className="block text-sm font-medium text-text-secondary">
                {label}
              </label>
            )}
            {showValue && (
              <span className="text-sm text-text-primary font-mono">
                {valueLabel || value}
              </span>
            )}
          </div>
        )}
        <div className="relative">
          <input
            ref={ref}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            className={`
              w-full h-2 rounded-lg appearance-none cursor-pointer
              bg-glass-light border border-border-subtle
              focus:outline-none focus:ring-2 focus:ring-accent-blue/50
              disabled:opacity-50 disabled:cursor-not-allowed
              slider
              ${className}
            `}
            style={{
              background: `linear-gradient(to right,
                rgb(59 130 246 / 0.6) 0%,
                rgb(59 130 246 / 0.6) ${percentage}%,
                rgb(25 25 35 / 0.7) ${percentage}%,
                rgb(25 25 35 / 0.7) 100%)`
            }}
            {...props}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-text-tertiary">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
    );
  }
);

Slider.displayName = 'Slider';
