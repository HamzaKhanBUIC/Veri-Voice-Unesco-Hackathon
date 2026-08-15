import React, { useState } from 'react';
import { EvidenceItem } from '../../types';

interface SourceCardProps {
  evidence: EvidenceItem;
  index?: number;
  initiallyExpanded?: boolean;
}

export const SourceCard: React.FC<SourceCardProps> = ({
  evidence,
  index = 1,
  initiallyExpanded = false,
}) => {
  const [expanded, setExpanded] = useState(initiallyExpanded);

  const getDomain = (urlStr: string) => {
    try {
      const u = new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`);
      return u.hostname.replace(/^www\./, '');
    } catch {
      return 'official-source';
    }
  };

  const domain = getDomain(evidence.url);

  const isPrimary =
    evidence.authorityLevel === 'PRIMARY_AUTHORITY' ||
    domain.includes('who.int') ||
    domain.includes('nasa.gov') ||
    domain.includes('cdc.gov') ||
    domain.includes('usgs.gov') ||
    domain.includes('wmo.int') ||
    domain.includes('ndma.gov.pk');

  return (
    <div className="bg-surface-elevated border border-border-subtle hover:border-border-variant rounded-lg p-4 transition-tactile text-left flex flex-col gap-2.5">
      {/* Top Header: Domain & Authority Badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="material-symbols-outlined text-brand-teal-bright text-[18px]">public</span>
          <span className="font-mono text-xs font-semibold text-text-primary truncate uppercase tracking-wider">
            {domain}
          </span>
        </div>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider flex-shrink-0 ${
            isPrimary
              ? 'bg-brand-navy/60 text-brand-navy-light border border-brand-navy-light/30 font-semibold'
              : 'bg-surface-container text-text-muted border border-border-subtle'
          }`}
        >
          {isPrimary ? 'Primary Authority' : 'Verified Web Source'}
        </span>
      </div>

      {/* Title */}
      <h4 className="font-editorial text-sm font-medium text-text-primary leading-snug">
        {evidence.sourceTitle || evidence.organization || `Source #${index}`}
      </h4>

      {/* Organization */}
      {evidence.organization && (
        <span className="text-xs text-text-muted font-sans">
          Publisher: <strong className="text-text-secondary font-medium">{evidence.organization}</strong>
        </span>
      )}

      {/* Excerpt / Grounding Snippet */}
      {(evidence.statement || evidence.excerpt) && (
        <div
          onClick={() => setExpanded(!expanded)}
          className={`bg-surface-container/60 border-l-2 border-brand-teal-bright p-2.5 rounded-r text-xs text-text-secondary font-sans leading-relaxed cursor-pointer hover:bg-surface-container transition-colors ${
            expanded ? '' : 'line-clamp-3'
          }`}
          title="Click to toggle full excerpt"
        >
          "{evidence.statement || evidence.excerpt}"
        </div>
      )}

      {/* Footer Outbound Link & Expand Action */}
      <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-xs font-mono">
        <a
          href={evidence.url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-teal-bright hover:underline inline-flex items-center gap-1"
        >
          <span>Visit Source</span>
          <span className="material-symbols-outlined text-[14px]">open_in_new</span>
        </a>

        {evidence.claimId && (
          <span className="text-[10px] text-text-muted">ID: {evidence.claimId}</span>
        )}
      </div>
    </div>
  );
};
