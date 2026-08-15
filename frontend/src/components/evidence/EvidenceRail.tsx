import React from 'react';
import { EvidenceItem, EvidenceStrength } from '../../types';
import { SourceCard } from './SourceCard';
import { AcousticAnchor } from '../brand/AcousticAnchor';

interface EvidenceRailProps {
  evidence: EvidenceItem[];
  evidenceStrength?: EvidenceStrength;
  confidence?: string | number;
  className?: string;
  onClose?: () => void;
  isMobileDrawer?: boolean;
}

export const EvidenceRail: React.FC<EvidenceRailProps> = ({
  evidence = [],
  evidenceStrength = 'STRONG_EVIDENCE',
  confidence = 'HIGH',
  className = '',
  onClose,
  isMobileDrawer = false,
}) => {
  const strengthLabels = {
    STRONG_EVIDENCE: { label: 'Strong Evidence', color: 'text-verdict-true bg-verdict-true/10 border-verdict-true/30' },
    SUFFICIENT_EVIDENCE: { label: 'Sufficient Evidence', color: 'text-brand-teal-bright bg-brand-teal-bright/10 border-brand-teal-bright/30' },
    WEAK_EVIDENCE: { label: 'Limited Evidence', color: 'text-verdict-mixed bg-verdict-mixed/10 border-verdict-mixed/30' },
    NO_EVIDENCE: { label: 'Zero Evidence Retrieved', color: 'text-verdict-uncertain bg-verdict-uncertain/10 border-verdict-uncertain/30' },
    CONFLICTING_EVIDENCE: { label: 'Conflicting Consensus', color: 'text-verdict-mixed bg-verdict-mixed/10 border-verdict-mixed/30' },
    INFRASTRUCTURE_FAILURE: { label: 'Search Incomplete', color: 'text-verdict-false bg-verdict-false/10 border-verdict-false/30' },
  }[evidenceStrength] || { label: 'Evidence Grounded', color: 'text-text-secondary bg-surface-container border-border-subtle' };

  return (
    <aside
      className={`w-full lg:w-[380px] bg-surface-container-low border-l border-border-subtle flex flex-col h-full overflow-hidden ${className}`}
      aria-label="Evidence and Source Rail"
    >
      {/* Header */}
      <div className="p-4 md:p-5 border-b border-border-subtle bg-surface-container-low/95 backdrop-blur flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <AcousticAnchor size={16} />
          <h3 className="font-editorial font-semibold text-base text-text-primary">Evidence Rail</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-wider text-text-secondary bg-surface-container px-2 py-0.5 rounded border border-border-subtle">
            {evidence.length} {evidence.length === 1 ? 'SOURCE' : 'SOURCES'}
          </span>
          {isMobileDrawer && onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded text-text-secondary hover:text-text-primary hover:bg-surface-container"
              aria-label="Close evidence rail"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Meta Bar: Strength & Confidence */}
      <div className="p-4 bg-surface-elevated/60 border-b border-border-subtle flex items-center justify-between gap-2">
        <span className={`px-2.5 py-1 rounded text-[11px] font-mono uppercase tracking-wider border ${strengthLabels.color}`}>
          {strengthLabels.label}
        </span>
        <div className="text-right">
          <span className="text-[10px] font-mono uppercase text-text-muted block">Confidence</span>
          <span className="text-xs font-mono font-semibold text-brand-teal-bright">
            {typeof confidence === 'number' ? `${(confidence * 100).toFixed(0)}%` : confidence}
          </span>
        </div>
      </div>

      {/* Scrollable Source Cards Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
        {evidence.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-text-muted text-[36px]">travel_explore</span>
            <p className="text-xs text-text-muted font-sans max-w-[220px]">
              No direct candidate evidence available. VeriVoice refuses to hallucinate un-grounded claims.
            </p>
          </div>
        ) : (
          evidence.map((item, idx) => (
            <SourceCard key={item.claimId || idx} evidence={item} index={idx + 1} />
          ))
        )}
      </div>

      {/* Institutional Guarantee Footer */}
      <div className="p-3 bg-surface-container-lowest border-t border-border-subtle text-[11px] font-mono text-text-muted flex items-center gap-2">
        <span className="material-symbols-outlined text-brand-teal-bright text-[15px]">verified_user</span>
        <span>Anti-hallucination citation bounds enforced</span>
      </div>
    </aside>
  );
};
