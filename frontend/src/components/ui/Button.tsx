import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'teal';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-sans font-medium rounded transition-tactile cursor-pointer select-none active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs tracking-wider uppercase font-mono gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3.5 text-base gap-2.5 font-semibold',
  }[size];

  const variantStyles = {
    primary: 'bg-brand-navy-light text-brand-navy-deep hover:bg-white border border-transparent shadow-sm',
    teal: 'bg-brand-teal text-text-primary hover:bg-brand-teal-dim border border-brand-teal-bright/30 shadow-[0_0_15px_rgba(126,212,214,0.15)]',
    secondary: 'bg-surface-elevated text-text-primary hover:bg-surface-container border border-border-subtle hover:border-border-variant',
    outline: 'bg-transparent text-text-primary hover:bg-surface-container border border-border-subtle hover:border-border-variant',
    ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-container/60 border border-transparent',
    destructive: 'bg-verdict-false/20 text-verdict-false hover:bg-verdict-false/30 border border-verdict-false/40',
  }[variant];

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
      ) : (
        icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>
      )}
      {children}
      {!isLoading && icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
    </button>
  );
};
