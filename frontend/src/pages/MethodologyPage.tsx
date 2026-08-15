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
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('landing')}
            className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-mono text-text-secondary hover:text-text-primary transition-tactile flex items-center gap-1"
            title="Back to Overview"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Home</span>
          </button>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono uppercase tracking-widest text-text-secondary">
            <AcousticAnchor size={12} />
            <span>MIL Framework & Engineering Standard</span>
          </div>
        </div>
        <h1 className="font-editorial text-4xl sm:text-5xl font-medium text-text-primary tracking-tight">
          {t.methodology.title}
        </h1>
        <p className="text-text-secondary font-sans text-base sm:text-lg leading-relaxed max-w-2xl">
          {t.methodology.subtitle}
        </p>
      </div>

      {/* 1. UNESCO & DW Akademie Media and Information Literacy (MIL) Alignment */}
      <div className="space-y-8 bg-white/[0.02] border border-white/[0.08] rounded-3xl p-6 sm:p-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-brand-teal-bright">
            <span className="material-symbols-outlined text-[22px]">psychology</span>
            <h2 className="font-editorial text-2xl font-medium text-text-primary">
              UNESCO Media & Information Literacy (MIL) Alignment
            </h2>
          </div>
          <p className="text-xs font-sans text-text-secondary leading-relaxed">
            VeriVoice is engineered in alignment with the global Media and Information Literacy (MIL) framework developed by UNESCO and DW Akademie, empowering communities to transition from passive media consumers to critical evaluators.
          </p>
        </div>

        {/* The 5 Pillars of MIL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1.5">
            <span className="text-[10px] font-mono text-brand-teal-bright uppercase tracking-wider block font-semibold">1. Access</span>
            <h4 className="font-editorial text-sm font-medium text-text-primary">Direct Institutional Sourcing</h4>
            <p className="text-xs text-text-muted leading-relaxed">Connects directly to primary scientific and public health repositories, bypassing algorithmic echo chambers.</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1.5">
            <span className="text-[10px] font-mono text-brand-teal-bright uppercase tracking-wider block font-semibold">2. Analyze</span>
            <h4 className="font-editorial text-sm font-medium text-text-primary">Rigorous Claim Deconstruction</h4>
            <p className="text-xs text-text-muted leading-relaxed">Deconstructs viral rumors against peer-reviewed consensus and institutional evidence.</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1.5">
            <span className="text-[10px] font-mono text-brand-teal-bright uppercase tracking-wider block font-semibold">3. Reflect</span>
            <h4 className="font-editorial text-sm font-medium text-text-primary">Cognitive Pause & Uncertainty</h4>
            <p className="text-xs text-text-muted leading-relaxed">Enforces honesty: when evidence is lacking or inconclusive, the system declares explicit uncertainty.</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1.5">
            <span className="text-[10px] font-mono text-brand-teal-bright uppercase tracking-wider block font-semibold">4. Create</span>
            <h4 className="font-editorial text-sm font-medium text-text-primary">Multilingual Synthesis</h4>
            <p className="text-xs text-text-muted leading-relaxed">Synthesizes evidence into accessible, spoken voice explanations in the user's native language.</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1.5">
            <span className="text-[10px] font-mono text-brand-teal-bright uppercase tracking-wider block font-semibold">5. Act</span>
            <h4 className="font-editorial text-sm font-medium text-text-primary">Responsible Community Sharing</h4>
            <p className="text-xs text-text-muted leading-relaxed">Empowers users with verifiable citations to stop infodemic propagation in messaging groups.</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1.5">
            <span className="text-[10px] font-mono text-brand-teal-bright uppercase tracking-wider block font-semibold">Standard</span>
            <h4 className="font-editorial text-sm font-medium text-text-primary">Authority ≠ Truth</h4>
            <p className="text-xs text-text-muted leading-relaxed">Sources are evaluated on empirical merit, methodological directness, and consensus—not mere prestige.</p>
          </div>
        </div>
      </div>

      {/* 2. Institutional Source Taxonomy & Epistemic Hierarchy */}
      <div className="space-y-6">
        <h2 className="font-editorial text-2xl font-medium text-text-primary">
          Granular Source Authority Hierarchy
        </h2>
        <p className="text-sm font-sans text-text-secondary leading-relaxed max-w-2xl">
          VeriVoice categorizes evidence sources according to their distinct epistemic roles rather than applying flat numeric weights:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-teal-bright" />
              <strong className="font-mono text-brand-teal-bright uppercase">Primary Institutional</strong>
            </div>
            <p className="text-text-muted leading-relaxed">Intergovernmental charter bodies establishing global standards (WHO, WMO, UNESCO, PAHO, UNICEF).</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <strong className="font-mono text-cyan-300 uppercase">Primary Scientific Data</strong>
            </div>
            <p className="text-text-muted leading-relaxed">Raw empirical observation, satellite telemetry, and planetary research bodies (NASA, NOAA, USGS, ESA).</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <strong className="font-mono text-emerald-300 uppercase">Official Government</strong>
            </div>
            <p className="text-text-muted leading-relaxed">National health ministries and emergency management authorities (CDC, NDMA, Kemenkes RI, NIH).</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <strong className="font-mono text-sky-300 uppercase">Scientific Review</strong>
            </div>
            <p className="text-text-muted leading-relaxed">Peer-reviewed scientist panels analyzing public claims and media coverage (Climate Feedback, Science Feedback).</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <strong className="font-mono text-amber-300 uppercase">Fact-Checking Networks</strong>
            </div>
            <p className="text-text-muted leading-relaxed">IFCN-signatory investigative verification journalism across 20+ languages (AFP Fact Check, Reuters Fact Check).</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <strong className="font-mono text-indigo-300 uppercase">Research Observatories</strong>
            </div>
            <p className="text-text-muted leading-relaxed">Observatories investigating cross-border disinformation, synthetic media, and deepfakes (EDMO).</p>
          </div>
        </div>
      </div>

      {/* 3. The 7-Layer Engineering Pipeline */}
      <div className="space-y-6">
        <h2 className="font-editorial text-2xl font-medium text-text-primary">
          The 7-Layer Engineering Verification Pipeline
        </h2>

        <div className="space-y-4">
          <div className="space-y-1.5 border-b border-white/[0.06] pb-4">
            <span className="text-[11px] font-mono text-brand-teal-bright uppercase tracking-wider block">Layer 1 & 2 • Acoustic Ingestion & Semantic Routing</span>
            <h4 className="font-editorial text-base font-medium text-text-primary">Multilingual Whisper ASR & NLU</h4>
            <p className="text-xs text-text-secondary font-sans leading-relaxed">
              Streams raw voice audio, decodes regional dialects in Urdu, English, Spanish, and Indonesian, and determines user intent (Claim Verification vs. Educational Research) across 14 knowledge domains.
            </p>
          </div>

          <div className="space-y-1.5 border-b border-white/[0.06] pb-4">
            <span className="text-[11px] font-mono text-brand-teal-bright uppercase tracking-wider block">Layer 3 & 4 • Retrieval & Authority Filtering</span>
            <h4 className="font-editorial text-base font-medium text-text-primary">Targeted Institutional Grounding</h4>
            <p className="text-xs text-text-secondary font-sans leading-relaxed">
              Generates scoped search queries targeting primary domains (e.g. <code className="font-mono text-brand-teal-bright">site:who.int</code>, <code className="font-mono text-brand-teal-bright">site:noaa.gov</code>, <code className="font-mono text-brand-teal-bright">site:edmo.eu</code>). Deduplicates syndicated wire reporting to ensure source independence.
            </p>
          </div>

          <div className="space-y-1.5 border-b border-white/[0.06] pb-4">
            <span className="text-[11px] font-mono text-brand-teal-bright uppercase tracking-wider block">Layer 5 & 6 • Bounded LLM Reasoning & Citation Guardrails</span>
            <h4 className="font-editorial text-base font-medium text-text-primary">XML-Isolated Reasoning & Strict Allowlisting</h4>
            <p className="text-xs text-text-secondary font-sans leading-relaxed">
              Evaluates claims inside XML data boundaries with temperature 0.1 on Groq LPUs. Citation allowlisting guarantees the model cannot invent fake URLs or hallucinate references.
            </p>
          </div>

          <div className="space-y-1.5 pb-2">
            <span className="text-[11px] font-mono text-brand-teal-bright uppercase tracking-wider block">Layer 7 • Acoustic Response</span>
            <h4 className="font-editorial text-base font-medium text-text-primary">Neural Voice Synthesis & Transparency</h4>
            <p className="text-xs text-text-secondary font-sans leading-relaxed">
              Delivers spoken explanations via natural neural voices (Uzma Neural for Urdu, Gadis Neural for Indonesian, Elvira for Spanish, Jenny for English) alongside interactive evidence cards.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Verification Verdict Taxonomy */}
      <div className="space-y-6 pt-4 border-t border-white/[0.08]">
        <h2 className="font-editorial text-2xl font-medium text-text-primary">
          Verification Verdict Taxonomy
        </h2>

        <div className="space-y-4 text-xs font-sans">
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6 border-b border-white/[0.04] pb-3">
            <span className="font-mono font-bold text-verdict-true text-sm w-32 flex-shrink-0">
              TRUE
            </span>
            <p className="text-text-secondary leading-relaxed">
              The claim is directly confirmed and supported by established peer-reviewed consensus and primary institutional evidence.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6 border-b border-white/[0.04] pb-3">
            <span className="font-mono font-bold text-verdict-false text-sm w-32 flex-shrink-0">
              FALSE
            </span>
            <p className="text-text-secondary leading-relaxed">
              The claim is scientifically disproven, contradicted by primary empirical data, or identified as a dangerous viral rumor.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6 border-b border-white/[0.04] pb-3">
            <span className="font-mono font-bold text-verdict-mixed text-sm w-32 flex-shrink-0">
              MIXED
            </span>
            <p className="text-text-secondary leading-relaxed">
              The assertion contains an element of factual truth but is presented with misleading exaggeration or missing context.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6 border-b border-white/[0.04] pb-3">
            <span className="font-mono font-bold text-verdict-uncertain text-sm w-32 flex-shrink-0">
              UNCERTAIN
            </span>
            <p className="text-text-secondary leading-relaxed">
              Current scientific evidence is inconclusive, emerging, or insufficient to render a responsible determination.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6 pb-3">
            <span className="font-mono font-bold text-brand-teal-bright text-sm w-32 flex-shrink-0">
              RESEARCH RESPONSE
            </span>
            <p className="text-text-secondary leading-relaxed">
              Synthesized educational response for open-ended inquiries (e.g., explaining disease mechanisms or climate observation data).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
