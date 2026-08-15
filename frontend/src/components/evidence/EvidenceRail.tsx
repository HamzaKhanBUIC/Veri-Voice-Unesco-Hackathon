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
    STRONG_EVIDENCE: { label: 'Strong Evidence', color: 'text-verdict-true' },
    SUFFICIENT_EVIDENCE: { label: 'Sufficient Evidence', color: 'text-brand-teal-bright' },
    WEAK_EVIDENCE: { label: 'Limited Evidence', color: 'text-verdict-mixed' },
    NO_EVIDENCE: { label: 'Zero Evidence Retrieved', color: 'text-verdict-uncertain' },
    CONFLICTING_EVIDENCE: { label: 'Conflicting Consensus', color: 'text-verdict-mixed' },
    INFRASTRUCTURE_FAILURE: { label: 'Search Incomplete', color: 'text-verdict-false' },
  }[evidenceStrength] || { label: 'Evidence Grounded', color: 'text-text-secondary' };

  return (
    <aside
      className={`w-full lg:w-[380px] bg-[#0E0E0E] border-l border-white/[0.06] flex flex-col h-full overflow-hidden ${className}`}
      aria-label="Evidence and Source Rail"
    >
      {/* Header */}
      <div className="p-5 border-b border-white/[0.06] flex items-center justify-between sticky top-0 z-10 bg-[#0E0E0E]/95 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <AcousticAnchor size={14} />
          <h3 className="font-editorial font-medium text-base text-text-primary">Evidence Dossier</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
            {evidence.length} {evidence.length === 1 ? 'SOURCE' : 'SOURCES'}
          </span>
          {isMobileDrawer && onClose && (
            <button
              onClick={onClose}
              className="p-1 text-text-muted hover:text-text-primary"
              aria-label="Close evidence rail"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Meta Bar: Strength & Confidence */}
      <div className="px-5 py-3 border-b border-white/[0.04] flex items-center justify-between gap-2 text-xs font-mono">
        <span className={`uppercase tracking-wider font-semibold ${strengthLabels.color}`}>
          {strengthLabels.label}
        </span>
        <div className="text-right text-text-muted">
          <span>Confidence: </span>
          <strong className="text-brand-teal-bright font-semibold">
            {typeof confidence === 'number' ? `${(confidence * 100).toFixed(0)}%` : confidence}
          </strong>
        </div>
      </div>

      {/* Scrollable Source Cards Stream */}
      <div className="flex-1 overflow-y-auto px-5 py-2 space-y-1">
        {evidence.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-text-muted text-[32px]">travel_explore</span>
            <p className="text-xs text-text-muted font-sans max-w-[240px] leading-relaxed">
              No candidate evidence retrieved. VeriVoice refuses to hallucinate un-grounded assertions.
            </p>
          </div>
        ) : (
          evidence.map((item, idx) => (
            <SourceCard key={item.claimId || idx} evidence={item} index={idx + 1} />
          ))
        )}
      </div>

      {/* Institutional Guarantee Footer */}
      <div className="p-4 border-t border-white/[0.06] text-[11px] font-mono text-text-muted flex items-center gap-2">
        <span className="material-symbols-outlined text-brand-teal-bright text-[15px]">verified_user</span>
        <span>Anti-hallucination citation bounds enforced</span>
      </div>
    </aside>
  );
};
