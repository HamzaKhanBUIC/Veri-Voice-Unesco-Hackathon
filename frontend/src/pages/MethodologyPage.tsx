import React from 'react';
import { AcousticAnchor } from '../components/brand/AcousticAnchor';
import { getTranslation } from '../i18n/translations';
import { AppView } from '../types';

interface MethodologyPageProps {
  onNavigate: (view: AppView) => void;
  currentLanguage?: string;
}

export const MethodologyPage: React.FC<MethodologyPageProps> = ({
  onNavigate,
  currentLanguage = 'en',
}) => {
  const t = getTranslation(currentLanguage);

  return (
    <div className="flex flex-col gap-16 max-w-4xl mx-auto px-6 md:px-12 py-10 md:py-16 text-left">
      {/* Header */}
      <div className="space-y-4 border-b border-white/[0.08] pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono uppercase tracking-widest text-text-secondary">
          <AcousticAnchor size={12} />
          <span>Verification Architecture & Trust Standard</span>
        </div>
        <h1 className="font-editorial text-4xl sm:text-5xl font-medium text-text-primary tracking-tight">
          {t.methodology.title}
        </h1>
        <p className="text-text-secondary font-sans text-base sm:text-lg leading-relaxed max-w-2xl">
          {t.methodology.subtitle}
        </p>
      </div>

      {/* 4 Core Verification Pillars (Clean Linear Editorial Stream) */}
      <div className="space-y-12">
        <div className="space-y-3 border-b border-white/[0.06] pb-8">
          <div className="flex items-center gap-2 text-brand-teal-bright">
            <span className="material-symbols-outlined text-[20px]">shield</span>
            <h3 className="font-editorial font-medium text-xl text-text-primary">
              1. Delimited Prompt Isolation
            </h3>
          </div>
          <p className="text-sm text-text-secondary font-sans leading-relaxed max-w-2xl">
            Untrusted user audio transcripts and external web snippets are isolated within strict XML boundaries (<code className="text-brand-teal-bright font-mono">&lt;USER_CLAIM&gt;</code> and <code className="text-brand-teal-bright font-mono">&lt;EVIDENCE&gt;</code>). This prevents prompt injection attacks from hijacking the verification reasoning engine.
          </p>
        </div>

        <div className="space-y-3 border-b border-white/[0.06] pb-8">
          <div className="flex items-center gap-2 text-brand-teal-bright">
            <span className="material-symbols-outlined text-[20px]">verified</span>
            <h3 className="font-editorial font-medium text-xl text-text-primary">
              2. Strict Citation Allow-Listing
            </h3>
          </div>
          <p className="text-sm text-text-secondary font-sans leading-relaxed max-w-2xl">
            Every output URL is cross-checked against retrieved source domains. If an LLM hallucination fabricates an unsupplied link or misattributes a quote, the verification pipeline immediately aborts and reverts to safe uncertainty.
          </p>
        </div>

        <div className="space-y-3 border-b border-white/[0.06] pb-8">
          <div className="flex items-center gap-2 text-brand-teal-bright">
            <span className="material-symbols-outlined text-[20px]">domain</span>
            <h3 className="font-editorial font-medium text-xl text-text-primary">
              3. Institutional Authority Hierarchy
            </h3>
          </div>
          <p className="text-sm text-text-secondary font-sans leading-relaxed max-w-2xl">
            Sources are ranked deterministically: Primary Institutional Authorities (WHO, CDC, PAHO, NASA, WMO, USGS, NDMA) take absolute precedence over unverified blogs, opinion op-eds, or syndicated social media feeds.
          </p>
        </div>

        <div className="space-y-3 border-b border-white/[0.06] pb-8">
          <div className="flex items-center gap-2 text-brand-teal-bright">
            <span className="material-symbols-outlined text-[20px]">help_outline</span>
            <h3 className="font-editorial font-medium text-xl text-text-primary">
              4. Honest Uncertainty as a Feature
            </h3>
          </div>
          <p className="text-sm text-text-secondary font-sans leading-relaxed max-w-2xl">
            When evidence is sparse, missing, or contradictory, VeriVoice delivers an explicit <code className="text-verdict-uncertain font-mono">UNCERTAIN</code> verdict rather than generating an ungrounded guess. Refusing to hallucinate is our primary trust guarantee.
          </p>
        </div>
      </div>

      {/* Verification Verdict Taxonomy */}
      <div className="space-y-6 pt-4">
        <h2 className="font-editorial text-2xl font-medium text-text-primary">
          Verification Verdict Taxonomy
        </h2>

        <div className="space-y-4 text-xs font-sans">
          <div className="flex items-start gap-4 py-3 border-b border-white/[0.06]">
            <strong className="font-mono text-verdict-true w-24 flex-shrink-0 uppercase text-sm">TRUE</strong>
            <p className="text-text-secondary leading-relaxed">
              The claim is fully substantiated by peer-reviewed evidence or explicit consensus guidelines from primary global or national authorities.
            </p>
          </div>

          <div className="flex items-start gap-4 py-3 border-b border-white/[0.06]">
            <strong className="font-mono text-verdict-false w-24 flex-shrink-0 uppercase text-sm">FALSE</strong>
            <p className="text-text-secondary leading-relaxed">
              The claim directly contradicts established empirical findings or official safety warnings released by verified health or scientific organizations.
            </p>
          </div>

          <div className="flex items-start gap-4 py-3 border-b border-white/[0.06]">
            <strong className="font-mono text-verdict-mixed w-24 flex-shrink-0 uppercase text-sm">MIXED</strong>
            <p className="text-text-secondary leading-relaxed">
              The claim contains elements of truth but omits critical context, presents outdated metrics, or overgeneralizes a specific localized finding.
            </p>
          </div>

          <div className="flex items-start gap-4 py-3 border-b border-white/[0.06]">
            <strong className="font-mono text-verdict-uncertain w-24 flex-shrink-0 uppercase text-sm">UNCERTAIN</strong>
            <p className="text-text-secondary leading-relaxed">
              Available reliable evidence is insufficient to verify the claim with high confidence, or credible authorities present conflicting findings.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Quiet Navigation Bar */}
      <div className="flex items-center justify-between pt-8 border-t border-white/[0.08]">
        <button
          onClick={() => onNavigate('talk')}
          className="text-xs font-mono text-brand-teal-bright hover:underline flex items-center gap-1"
        >
          <span>Open Talk Room</span>
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </button>
        <button
          onClick={() => onNavigate('chat')}
          className="text-xs font-mono text-text-secondary hover:text-text-primary flex items-center gap-1"
        >
          <span>Open Chat & Research</span>
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};
