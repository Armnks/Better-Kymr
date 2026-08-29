import React from 'react';
import { cn } from '../../lib/utils';
import { LucideIcon } from 'lucide-react';

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("bg-brand-surface border border-brand-border p-6", className)}>
      {children}
    </div>
  );
}

export function Button({ 
  className, 
  variant = 'primary', 
  size = 'md',
  children,
  icon: Icon,
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-mono uppercase tracking-widest transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
        {
          'border border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-brand-black font-bold': variant === 'primary',
          'bg-brand-surface-highlight border border-brand-border-light text-brand-ivory hover:border-brand-ivory font-bold': variant === 'secondary',
          'bg-transparent text-brand-muted hover:text-brand-ivory': variant === 'ghost',
          'bg-brand-accent-red text-white hover:bg-red-700': variant === 'danger',
          'text-[10px] px-3 py-1.5 gap-1.5': size === 'sm',
          'text-xs px-4 py-2 gap-2': size === 'md',
          'text-sm px-6 py-3 gap-2': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {Icon && <Icon className={cn({
        'w-3 h-3': size === 'sm',
        'w-4 h-4': size === 'md',
        'w-5 h-5': size === 'lg',
      })} />}
      {children}
    </button>
  );
}

export function Badge({ 
  children, 
  variant = 'default',
  className,
  ...props
}: { 
  children: React.ReactNode; 
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
} & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest border",
      {
        'border-brand-border text-brand-muted': variant === 'default',
        'border-brand-accent text-brand-accent bg-brand-accent/10': variant === 'success',
        'border-yellow-500 text-yellow-500 bg-yellow-500/10': variant === 'warning',
        'border-brand-accent-red text-brand-accent-red bg-brand-accent-red/10': variant === 'danger',
        'border-blue-400 text-blue-400 bg-blue-400/10': variant === 'info',
      },
      className
    )} {...props}>
      {children}
    </span>
  );
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full bg-brand-black border border-brand-border text-brand-ivory px-3 py-2 text-sm focus:outline-none focus:border-brand-accent transition-colors",
        className
      )}
      {...props}
    />
  );
});
Input.displayName = 'Input';
