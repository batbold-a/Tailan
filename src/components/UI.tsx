import React from 'react';
import { cn } from '../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}

export const Card = ({ title, subtitle, children, className, ...props }: CardProps) => (
  <div className={cn("bg-white rounded-3xl border border-slate-200/60 shadow-sm transition-all duration-300", className)} {...props}>
    {(title || subtitle) && (
      <div className="px-8 py-6 border-b border-slate-50">
        {title && <h3 className="text-xl font-bold tracking-tight text-slate-900">{title}</h3>}
        {subtitle && <p className="text-sm text-slate-400 mt-1 font-medium">{subtitle}</p>}
      </div>
    )}
    <div className="p-8">{children}</div>
  </div>
);

export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' }>(
  ({ className, variant = 'primary', ...props }, ref) => {
    const variants = {
      primary: 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm active:scale-[0.98]',
      secondary: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 active:scale-[0.98]',
      outline: 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 active:scale-[0.98]',
      ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 active:scale-[0.98]',
      danger: 'bg-rose-500 text-white hover:bg-rose-600 shadow-sm active:scale-[0.98]',
    };
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-2xl px-6 py-2.5 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-slate-900",
        className
      )}
      {...props}
    />
  )
);

export const Label = ({ children, className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700 mb-2 block", className)} {...props}>
    {children}
  </label>
);
