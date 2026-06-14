import React from 'react';
import { cn } from './utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'match-gradient text-white hover:opacity-90 shadow-sm border border-white/10',
      secondary: 'glass text-indigo-400 hover:bg-white/5 shadow-sm',
      outline: 'border border-white/10 bg-transparent hover:bg-white/5 text-slate-200',
      ghost: 'bg-transparent hover:bg-white/5 text-slate-300',
      danger: 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 shadow-sm',
    };
    
    const sizes = {
      sm: 'h-8 px-3 text-xs rounded-full',
      md: 'h-10 px-4 py-2 rounded-full',
      lg: 'h-12 px-6 text-lg rounded-full',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
