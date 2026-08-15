import React from 'react';
import { Card } from '../components/ui/Card';
import { AcousticAnchor } from '../components/brand/AcousticAnchor';
import { AppView } from '../types';

interface MethodologyPageProps {
  onNavigate: (view: AppView) => void;
}

export const MethodologyPage: React.FC<MethodologyPageProps> = ({
  onNavigate,
}) => {
  return (
    <div className="flex flex-col gap-12 max-w-4xl mx-auto px-4 py-8 md:py-12 text-left">
      {/* Header */}
      <div className="space-y-3 border-b border-border-subtle pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container border border-border-subtle text-xs font-mono uppercase tracking-widest text-text-secondary">
          <AcousticAnchor size={12} />
          <span>Trust, Safety & Verification Methodology</span>
        </div>
        <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-semibold text-text-primary">
          How VeriVoice Checks Truth
        </h1>
        <p className="text-text-secondary font-sans text-base leading-relaxed">
          VeriVoice is engineered for strict evidence-grounding. Built specifically for UNESCO infodemic mitigation, our architecture eliminates generative hallucinations through deterministic guardrails.
        </p>
      </div>

      {/* 4 Core Pillars */}
      <div className="grid sm:grid-cols-2 gap-6">
        {/* Pillar 1 */}
        <Card surface="elevated" accent="teal" padding="md" className="space-y-2">
          <div className="flex items-center gap-2 text-brand-teal-bright">
            <span className="material-symbols-outlined text-[20px]">shield</span>
            <h3 className="font-editorial font-semibold text-base">1. Delimited Prompt Isolation</h3>
          </div>
          <p className="text-xs text-text-secondary font-sans leading-relaxed">
            Untrusted user transcripts and retrieved web data are wrapped strictly within isolated XML tags (<code className="text-brand-teal-bright">&lt;USER_CLAIM&gt;</code> and <code className="text-brand-teal-bright">&lt;EVIDENCE&gt;</code>), rendering prompt injection attacks completely inert.
          </p>
        </Card>

        {/* Pillar 2 */}
        <Card surface="elevated" accent="teal" padding="md" className="space-y-2">
          <div className="flex items-center gap-2 text-brand-teal-bright">
            <span className="material-symbols-outlined text-[20px]">verified</span>
            <h3 className="font-editorial font-semibold text-base">2. Citation Allow-Listing</h3>
          </div>
          <p className="text-xs text-text-secondary font-sans leading-relaxed">
            Our <code className="text-brand-teal-bright">CitationValidator</code> audits every output URL. If a language model fabricates a citation or references an unsupplied source, the verification is immediately aborted and reverted to safe uncertainty.
          </p>
        </Card>

        {/* Pillar 3 */}
        <Card surface="elevated" accent="teal" padding="md" className="space-y-2">
          <div className="flex items-center gap-2 text-brand-teal-bright">
            <span className="material-symbols-outlined text-[20px]">domain</span>
            <h3 className="font-editorial font-semibold text-base">3. Authority Tiering</h3>
          </div>
          <p className="text-xs text-text-secondary font-sans leading-relaxed">
            Sources are ranked deterministically: Primary Institutional Authorities (WHO, PAHO, NASA, WMO, USGS, NDMA) take absolute precedence over syndicated wire copy or secondary web articles.
          </p>
        </Card>

        {/* Pillar 4 */}
        <Card surface="elevated" accent="teal" padding="md" className="space-y-2">
          <div className="flex items-center gap-2 text-brand-teal-bright">
            <span className="material-symbols-outlined text-[20px]">help_outline</span>
            <h3 className="font-editorial font-semibold text-base">4. Honest Uncertainty</h3>
          </div>
          <p className="text-xs text-text-secondary font-sans leading-relaxed">
            When evidence is sparse, missing, or contradictory, VeriVoice delivers an explicit <code className="text-verdict-uncertain">UNCERTAIN</code> verdict rather than generating an ungrounded guess. Honest uncertainty is a foundational feature of trust.
          </p>
        </Card>
      </div>

      {/* Detailed Verification Policy */}
      <div className="bg-surface-container-low border border-border-subtle rounded-xl p-6 md:p-8 space-y-6">
        <h2 className="font-editorial text-2xl font-semibold text-text-primary">
          Verification Verdict Taxonomy
        </h2>

        <div className="space-y-4 text-xs font-sans">
          <div className="flex items-start gap-3 p-3 rounded bg-surface-elevated border-l-4 border-l-verdict-true">
            <strong className="font-mono text-verdict-true w-20 flex-shrink-0 uppercase">TRUE</strong>
            <p className="text-text-secondary">
              The claim is fully substantiated by peer-reviewed evidence or explicit consensus guidelines from primary authorities.
            </p>
          </div>

          <div className="flex items-start gap-3 p-3 rounded bg-surface-elevated border-l-4 border-l-verdict-false">
            <strong className="font-mono text-verdict-false w-20 flex-shrink-0 uppercase">FALSE</strong>
            <p className="text-text-secondary">
              The claim directly contradicts established scientific or empirical facts established by verified public health or scientific bodies.
            </p>
          </div>

          <div className="flex items-start gap-3 p-3 rounded bg-surface-elevated border-l-4 border-l-verdict-mixed">
            <strong className="font-mono text-verdict-mixed w-20 flex-shrink-0 uppercase">MIXED</strong>
            <p className="text-text-secondary">
              The claim contains elements of truth but omits critical medical context, presents outdated data, or overgeneralizes a specific finding.
            </p>
          </div>

          <div className="flex items-start gap-3 p-3 rounded bg-surface-elevated border-l-4 border-l-verdict-uncertain">
            <strong className="font-mono text-verdict-uncertain w-20 flex-shrink-0 uppercase">UNCERTAIN</strong>
            <p className="text-text-secondary">
              Available reliable evidence is insufficient to verify the claim with high confidence, or credible authorities present conflicting conclusions.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-surface-elevated border border-border-subtle rounded-xl">
        <div>
          <h4 className="font-editorial text-lg font-medium text-text-primary">Ready to verify a claim?</h4>
          <p className="text-xs text-text-secondary font-sans">Experience voice-first evidence verification in action.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('talk')}
            className="px-4 py-2 bg-brand-teal text-white rounded text-xs font-mono uppercase tracking-wider hover:bg-brand-teal-dim transition-tactile"
          >
            Open Talk Room
          </button>
          <button
            onClick={() => onNavigate('chat')}
            className="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-text-primary border border-border-subtle rounded text-xs font-mono uppercase tracking-wider transition-tactile"
          >
            Open Chat
          </button>
        </div>
      </div>
    </div>
  );
};
