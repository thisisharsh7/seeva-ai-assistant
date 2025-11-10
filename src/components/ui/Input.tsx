import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm text-secondary mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`glass-input w-full px-4 py-2.5 text-primary placeholder-tertiary focus:outline-none focus:ring-2 focus:ring-accent-blue/50 ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
