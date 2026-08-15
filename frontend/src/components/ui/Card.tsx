import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  surface?: 'elevated' | 'container' | 'lowest' | 'high';
  accent?: 'true' | 'false' | 'mixed' | 'uncertain' | 'teal' | 'navy' | 'none';
  interactive?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'none';
}

export const Card: React.FC<CardProps> = ({
  children,
  surface = 'elevated',
  accent = 'none',
  interactive = false,
  padding = 'md',
  className = '',
  ...props
}) => {
  const surfaceStyles = {
    elevated: 'bg-surface-elevated',
    container: 'bg-surface-container',
    lowest: 'bg-surface-container-lowest',
    high: 'bg-surface-container-high',
  }[surface];

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-5 md:p-6',
    lg: 'p-6 md:p-8',
  }[padding];

  const accentStyles = {
    none: 'border-border-subtle',
    true: 'border-border-subtle border-l-4 border-l-verdict-true',
    false: 'border-border-subtle border-l-4 border-l-verdict-false',
    mixed: 'border-border-subtle border-l-4 border-l-verdict-mixed',
    uncertain: 'border-border-subtle border-l-4 border-l-verdict-uncertain',
    teal: 'border-border-subtle border-l-4 border-l-brand-teal-bright',
    navy: 'border-border-subtle border-l-4 border-l-brand-navy',
  }[accent];

  const interactiveStyles = interactive
    ? 'hover:border-border-variant transition-tactile cursor-pointer active:scale-[0.99]'
    : '';

  return (
    <div
      className={`rounded-lg border shadow-sm ${surfaceStyles} ${accentStyles} ${paddingStyles} ${interactiveStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
