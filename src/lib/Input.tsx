import React from 'react';
import { cn } from './utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && <label className="text-sm font-medium text-slate-300">{label}</label>}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-full border border-white/10 glass bg-slate-900/50 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500 focus-visible:ring-red-500",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    )
  }
)
Input.displayName = "Input"
