import React from 'react';
import { cn } from './utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'danger';
  className?: string;
  children?: React.ReactNode;
  key?: React.Key;
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-indigo-600/20 text-indigo-400 border border-indigo-600/20',
    secondary: 'bg-purple-600/20 text-purple-400 border border-purple-600/20',
    outline: 'border border-white/10 text-slate-300',
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    danger: 'bg-red-500/10 text-red-400 border border-red-500/20',
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}
