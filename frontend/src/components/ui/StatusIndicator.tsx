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
      dot: 'bg-verdict-true',
      ring: 'bg-verdict-true/30 animate-pulse',
      text: 'text-text-secondary',
      defaultLabel: 'Engine Online',
    },
    checking: {
      dot: 'bg-brand-teal-bright',
      ring: 'bg-brand-teal-bright/40 animate-ping',
      text: 'text-brand-teal-bright',
      defaultLabel: 'Warming Up...',
    },
    warning: {
      dot: 'bg-verdict-mixed',
      ring: 'bg-verdict-mixed/30 animate-pulse',
      text: 'text-verdict-mixed',
      defaultLabel: 'High Load',
    },
    offline: {
      dot: 'bg-verdict-false',
      ring: 'bg-verdict-false/20',
      text: 'text-text-muted',
      defaultLabel: 'Standby / Waking...',
    },
  }[status];

  return (
    <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface-container/60 border border-border-subtle text-xs font-mono select-none backdrop-blur-sm ${className}`}>
      <span className="relative flex h-2 w-2 items-center justify-center">
        <span className={`absolute inline-flex h-full w-full rounded-full ${configs.ring}`} />
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${configs.dot}`} />
      </span>
      <span className={`text-[11px] font-medium ${configs.text}`}>{label || configs.defaultLabel}</span>
    </div>
  );
};
