import React from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    const baseClasses = "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700 dark:text-slate-300 mb-2 block";
    
    return (
      <label
        ref={ref}
        className={`${baseClasses} ${className}`}
        {...props}
      />
    );
  }
);
Label.displayName = 'Label';
