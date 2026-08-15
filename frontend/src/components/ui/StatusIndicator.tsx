import React from 'react';

interface StatusIndicatorProps {
  status: 'online' | 'checking' | 'warning' | 'offline';
  label?: string;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status = 'online',
  label,
  className = '',
}) => {
  const configs = {
    online: {
      dot: 'bg-verdict-true shadow-[0_0_8px_rgba(16,185,129,0.5)]',
      text: 'text-text-secondary',
      defaultLabel: 'All Systems Operational',
    },
    checking: {
      dot: 'bg-brand-teal-bright animate-ping',
      text: 'text-brand-teal-bright',
      defaultLabel: 'Checking Evidence...',
    },
    warning: {
      dot: 'bg-verdict-mixed shadow-[0_0_8px_rgba(245,158,11,0.5)]',
      text: 'text-verdict-mixed',
      defaultLabel: 'High Traffic / Queue Active',
    },
    offline: {
      dot: 'bg-verdict-false',
      text: 'text-verdict-false',
      defaultLabel: 'Backend Waking Up...',
    },
  }[status];

  return (
    <div className={`inline-flex items-center gap-2 text-xs font-mono select-none ${className}`}>
      <span className="relative flex h-2 w-2">
        <span className={`relative inline-flex rounded-full h-2 w-2 ${configs.dot}`} />
      </span>
      <span className={configs.text}>{label || configs.defaultLabel}</span>
    </div>
  );
};
