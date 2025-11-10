import { InputHTMLAttributes, forwardRef } from 'react';

interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ label, description, checked, className = '', ...props }, ref) => {
    return (
      <div className="flex items-center justify-between">
        {(label || description) && (
          <div className="flex-1 mr-4">
            {label && (
              <label className="block text-sm font-medium text-text-primary">
                {label}
              </label>
            )}
            {description && (
              <p className="text-xs text-text-tertiary mt-1">{description}</p>
            )}
          </div>
        )}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            className="sr-only peer"
            {...props}
          />
          <div
            className={`
              w-11 h-6 rounded-full
              bg-glass-light border border-border-subtle
              peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent-blue/50
              peer-checked:bg-accent-blue peer-checked:border-accent-blue
              peer-disabled:opacity-50 peer-disabled:cursor-not-allowed
              transition-all duration-200
              ${className}
            `}
          >
            <div
              className={`
                absolute top-[2px] left-[2px] w-5 h-5 rounded-full
                bg-white shadow-md
                transition-transform duration-200
                ${checked ? 'translate-x-5' : 'translate-x-0'}
              `}
            />
          </div>
        </label>
      </div>
    );
  }
);

Toggle.displayName = 'Toggle';
