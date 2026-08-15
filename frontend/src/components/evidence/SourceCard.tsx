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
    <div className="py-3.5 border-b border-white/[0.06] text-left flex flex-col gap-2 group">
      {/* Top Header Line: Domain + Authority Tier */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <span className="text-[11px] font-mono font-semibold text-text-primary uppercase tracking-wider">
            {domain}
          </span>
        </div>
        <span
          className={`text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded ${
            isPrimary
              ? 'text-brand-teal-bright bg-brand-teal/20 border border-brand-teal/30 font-semibold'
              : 'text-text-muted bg-white/[0.03]'
          }`}
        >
          {isPrimary ? 'Primary Authority' : 'Web Source'}
        </span>
      </div>

      {/* Source Title */}
      <h4 className="font-editorial text-sm font-medium text-text-primary leading-snug">
        {evidence.sourceTitle || evidence.organization || `Source Reference #${index}`}
      </h4>

      {/* Grounding Excerpt Note */}
      {(evidence.statement || evidence.excerpt) && (
        <div
          onClick={() => setExpanded(!expanded)}
          className="border-l-2 border-brand-teal-bright/60 pl-3 py-1 text-xs text-text-secondary font-sans leading-relaxed cursor-pointer hover:text-text-primary transition-colors"
          title="Click to toggle excerpt"
        >
          <p className={expanded ? '' : 'line-clamp-3'}>
            "{evidence.statement || evidence.excerpt}"
          </p>
        </div>
      )}

      {/* Outbound Link */}
      <div className="flex items-center justify-between text-xs font-mono pt-1">
        <a
          href={evidence.url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-teal-bright hover:underline inline-flex items-center gap-1 text-[11px]"
        >
          <span>Examine Source Data</span>
          <span className="material-symbols-outlined text-[13px]">open_in_new</span>
        </a>
      </div>
    </div>
  );
};
