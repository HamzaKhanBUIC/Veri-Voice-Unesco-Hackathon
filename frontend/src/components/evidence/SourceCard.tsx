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

  // Authority badge configuration
  const getAuthorityBadge = (level?: string) => {
    switch (level) {
      case 'PRIMARY_INSTITUTIONAL':
      case 'PRIMARY_AUTHORITY':
        return { label: 'Primary Institutional', cls: 'text-brand-teal-bright bg-brand-teal/20 border-brand-teal/30' };
      case 'PRIMARY_SCIENTIFIC_DATA':
        return { label: 'Scientific Data', cls: 'text-cyan-300 bg-cyan-950/40 border-cyan-500/30' };
      case 'OFFICIAL_GOVERNMENT':
        return { label: 'Official Government', cls: 'text-emerald-300 bg-emerald-950/40 border-emerald-500/30' };
      case 'SCIENTIFIC_REVIEW':
        return { label: 'Scientific Review', cls: 'text-sky-300 bg-sky-950/40 border-sky-500/30' };
      case 'FACT_CHECKING_ORGANIZATION':
      case 'REPUTABLE_NEWS':
        return { label: 'Fact-Checking Network', cls: 'text-amber-300 bg-amber-950/40 border-amber-500/30' };
      case 'RESEARCH_NETWORK':
        return { label: 'Research Observatory', cls: 'text-indigo-300 bg-indigo-950/40 border-indigo-500/30' };
      case 'CITIZEN_SCIENCE':
        return { label: 'Citizen Science', cls: 'text-lime-300 bg-lime-950/40 border-lime-500/30' };
      case 'SECONDARY_REPUTABLE':
      case 'SECONDARY_AUTHORITY':
        return { label: 'Academic Journal', cls: 'text-blue-300 bg-blue-950/40 border-blue-500/30' };
      default:
        if (domain.includes('who.int') || domain.includes('wmo.int') || domain.includes('unesco.org')) {
          return { label: 'Primary Institutional', cls: 'text-brand-teal-bright bg-brand-teal/20 border-brand-teal/30' };
        }
        if (domain.includes('nasa.gov') || domain.includes('noaa.gov') || domain.includes('usgs.gov')) {
          return { label: 'Scientific Data', cls: 'text-cyan-300 bg-cyan-950/40 border-cyan-500/30' };
        }
        if (domain.includes('cdc.gov') || domain.includes('ndma.gov.pk') || domain.includes('kemkes.go.id')) {
          return { label: 'Official Government', cls: 'text-emerald-300 bg-emerald-950/40 border-emerald-500/30' };
        }
        if (domain.includes('climatefeedback.org')) {
          return { label: 'Scientific Review', cls: 'text-sky-300 bg-sky-950/40 border-sky-500/30' };
        }
        if (domain.includes('edmo.eu')) {
          return { label: 'Research Observatory', cls: 'text-indigo-300 bg-indigo-950/40 border-indigo-500/30' };
        }
        if (domain.includes('factcheck.afp.com')) {
          return { label: 'Fact-Checking Network', cls: 'text-amber-300 bg-amber-950/40 border-amber-500/30' };
        }
        if (domain.includes('inaturalist.org')) {
          return { label: 'Citizen Science', cls: 'text-lime-300 bg-lime-950/40 border-lime-500/30' };
        }
        return { label: 'Web Source', cls: 'text-text-muted bg-white/[0.03] border-white/[0.08]' };
    }
  };

  const badge = getAuthorityBadge(evidence.authorityLevel);

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
          className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border ${badge.cls}`}
        >
          {badge.label}
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
