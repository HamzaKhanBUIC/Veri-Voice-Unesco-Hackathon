import React, { useState } from 'react';
import { VeriVoiceErrorContext } from '../../types/errors';

interface ErrorRecoveryCardProps {
  error: VeriVoiceErrorContext;
  onRetry?: () => void;
  onSecondaryAction?: () => void;
  onReport?: (context: VeriVoiceErrorContext) => void;
  onDismiss?: () => void;
  className?: string;
}

export const ErrorRecoveryCard: React.FC<ErrorRecoveryCardProps> = ({
  error,
  onRetry,
  onSecondaryAction,
  onReport,
  onDismiss,
  className = '',
}) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const getSeverityStyle = () => {
    switch (error.severity) {
      case 'CRITICAL':
      case 'ERROR':
        return {
          border: 'border-verdict-false/30',
          bg: 'bg-verdict-false/[0.04]',
          icon: 'error',
          iconColor: 'text-verdict-false',
          accentBtn: 'bg-verdict-false/20 hover:bg-verdict-false/30 text-verdict-false border border-verdict-false/40',
        };
      case 'WARNING':
        return {
          border: 'border-verdict-mixed/30',
          bg: 'bg-verdict-mixed/[0.04]',
          icon: 'warning',
          iconColor: 'text-verdict-mixed',
          accentBtn: 'bg-brand-teal hover:bg-brand-teal-dim text-white',
        };
      case 'INFO':
      default:
        return {
          border: 'border-white/[0.1]',
          bg: 'bg-white/[0.02]',
          icon: 'info',
          iconColor: 'text-brand-teal-bright',
          accentBtn: 'bg-brand-teal hover:bg-brand-teal-dim text-white',
        };
    }
  };

  const style = getSeverityStyle();

  return (
    <div
      role="alert"
      className={`w-full max-w-xl p-5 rounded-2xl ${style.bg} ${style.border} border shadow-xl backdrop-blur-md transition-all text-left space-y-4 animate-fade-up ${className}`}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className={`material-symbols-outlined text-[20px] ${style.iconColor}`}>
            {style.icon}
          </span>
          <h3 className="font-editorial text-base sm:text-lg font-medium text-text-primary">
            {error.userTitle}
          </h3>
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-text-muted hover:text-text-primary transition-colors p-1 rounded-lg hover:bg-white/[0.06]"
            aria-label="Dismiss error"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>

      {/* User Message */}
      <p className="font-sans text-xs sm:text-sm text-text-secondary leading-relaxed font-light">
        {error.userMessage}
      </p>

      {/* Technical Details Toggle */}
      {error.technicalDetails && (
        <div className="space-y-1.5 pt-1">
          <button
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="text-[11px] font-mono text-text-muted hover:text-text-secondary flex items-center gap-1 transition-colors"
          >
            <span>{showTechnicalDetails ? 'Hide technical context' : 'View technical details'}</span>
            <span className={`material-symbols-outlined text-[14px] transition-transform ${showTechnicalDetails ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>

          {showTechnicalDetails && (
            <pre className="text-[10px] font-mono text-text-muted bg-black/40 p-2.5 rounded-xl overflow-x-auto border border-white/[0.04]">
              {error.technicalDetails}
            </pre>
          )}
        </div>
      )}

      {/* Actions Row */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-white/[0.06]">
        <div className="flex flex-wrap items-center gap-2">
          {error.retryable && onRetry && (
            <button
              onClick={onRetry}
              className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider font-semibold transition-tactile flex items-center gap-1.5 ${style.accentBtn}`}
            >
              <span className="material-symbols-outlined text-[15px]">refresh</span>
              <span>Retry</span>
            </button>
          )}

          {error.fallbackAction === 'TYPE_INSTEAD' && onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-text-primary border border-white/[0.1] text-xs font-mono uppercase tracking-wider transition-tactile flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[15px]">keyboard</span>
              <span>Type Question</span>
            </button>
          )}

          {error.fallbackAction === 'USE_SAMPLE' && onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-text-primary border border-white/[0.1] text-xs font-mono uppercase tracking-wider transition-tactile flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[15px]">lightbulb</span>
              <span>Try Sample</span>
            </button>
          )}

          {error.fallbackAction === 'PLAY_AGAIN' && onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-text-primary border border-white/[0.1] text-xs font-mono uppercase tracking-wider transition-tactile flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[15px]">play_arrow</span>
              <span>Play Audio</span>
            </button>
          )}
        </div>

        {onReport && (
          <button
            onClick={() => onReport(error)}
            className="text-[11px] font-mono text-text-muted hover:text-brand-teal-bright flex items-center gap-1 transition-colors py-1 px-2 rounded-lg hover:bg-white/[0.04]"
          >
            <span className="material-symbols-outlined text-[13px]">flag</span>
            <span>Report Issue</span>
          </button>
        )}
      </div>
    </div>
  );
};
