import React, { forwardRef } from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  className,
  id,
  ...props
}, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-bili-text mb-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={clsx(
          'block w-full px-3 py-2 border rounded-md shadow-sm placeholder-bili-text-gray',
          'focus:outline-none focus:ring-2 focus:ring-bili-pink focus:border-transparent',
          'disabled:bg-bili-bg disabled:cursor-not-allowed',
          error ? 'border-red-500' : 'border-bili-border',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      {helperText && !error && <p className="mt-1 text-sm text-bili-text-gray">{helperText}</p>}
    </div>
  );
});