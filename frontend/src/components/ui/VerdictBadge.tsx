import React from 'react';
import { VerdictType } from '../../types';

interface VerdictBadgeProps {
  verdict: VerdictType;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
  customLabel?: string;
}

export const VerdictBadge: React.FC<VerdictBadgeProps> = ({
  verdict,
  size = 'md',
  showIcon = true,
  className = '',
  customLabel,
}) => {
  const configs = {
    TRUE: {
      label: 'TRUE',
      icon: 'check_circle',
      bgClass: 'bg-verdict-true/15 text-verdict-true border-verdict-true/30',
      dotClass: 'bg-verdict-true',
    },
    FALSE: {
      label: 'FALSE',
      icon: 'cancel',
      bgClass: 'bg-verdict-false/15 text-verdict-false border-verdict-false/30',
      dotClass: 'bg-verdict-false',
    },
    MIXED: {
      label: 'MIXED',
      icon: 'warning',
      bgClass: 'bg-verdict-mixed/15 text-verdict-mixed border-verdict-mixed/30',
      dotClass: 'bg-verdict-mixed',
    },
    UNCERTAIN: {
      label: 'UNCERTAIN',
      icon: 'help',
      bgClass: 'bg-verdict-uncertain/15 text-verdict-uncertain border-verdict-uncertain/30',
      dotClass: 'bg-verdict-uncertain',
    },
    RESEARCH_RESPONSE: {
      label: 'RESEARCH RESPONSE',
      icon: 'menu_book',
      bgClass: 'bg-brand-teal-bright/15 text-brand-teal-bright border-brand-teal-bright/30',
      dotClass: 'bg-brand-teal-bright',
    },
  }[verdict] || {
    label: verdict,
    icon: 'info',
    bgClass: 'bg-surface-container text-text-secondary border-border-subtle',
    dotClass: 'bg-text-secondary',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px] font-mono tracking-wider gap-1.5',
    md: 'px-3 py-1 text-xs font-mono tracking-wider gap-2',
    lg: 'px-4 py-1.5 text-sm font-mono tracking-wider gap-2.5 font-semibold',
  }[size];

  const iconSizes = {
    sm: 'text-[13px]',
    md: 'text-[16px]',
    lg: 'text-[18px]',
  }[size];

  return (
    <span
      className={`inline-flex items-center uppercase rounded border font-mono font-medium select-none ${configs.bgClass} ${sizeClasses} ${className}`}
      role="status"
    >
      {showIcon && (
        <span
          className={`material-symbols-outlined ${iconSizes} flex-shrink-0`}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {configs.icon}
        </span>
      )}
      <span>{customLabel || configs.label}</span>
    </span>
  );
};
