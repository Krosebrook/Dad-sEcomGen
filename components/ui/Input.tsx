import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  isInvalid?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, isInvalid, ...props }, ref) => {
    
    const baseClasses = `flex h-12 w-full rounded-md border bg-transparent px-4 py-2 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-50`;

    const validityClasses = isInvalid 
      ? `border-red-500 text-red-900 placeholder:text-red-300 focus-visible:ring-red-500 dark:border-red-600 dark:focus-visible:ring-red-600`
      : `border-slate-300 focus-visible:ring-slate-400 dark:border-slate-700 dark:focus-visible:ring-slate-500`;

    return (
      <input
        type={type}
        className={`${baseClasses} ${validityClasses} ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
