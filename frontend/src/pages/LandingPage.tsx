import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { AcousticCore } from '../components/voice/AcousticCore';
import { VerdictBadge } from '../components/ui/VerdictBadge';
import { AcousticAnchor } from '../components/brand/AcousticAnchor';
import { AppView } from '../types';

interface LandingPageProps {
  onNavigate: (view: AppView) => void;
  onSelectSampleClaim?: (claim: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onSelectSampleClaim,
}) => {
  const [pipelineExpanded, setPipelineExpanded] = useState(false);
  const [demoState, setDemoState] = useState<'IDLE' | 'LISTENING' | 'CHECKING' | 'RESPONDING'>('RESPONDING');

  const handleSampleClick = (claim: string) => {
    if (onSelectSampleClaim) {
      onSelectSampleClaim(claim);
    }
    onNavigate('chat');
  };

  return (
    <div className="flex flex-col gap-24 md:gap-36 pb-24 pt-8 md:pt-16">
      {/* 1. HERO SECTION */}
      <section className="px-4 md:px-8 max-w-[1280px] mx-auto w-full flex flex-col items-center text-center gap-8 md:gap-12">
        <div className="max-w-4xl flex flex-col items-center gap-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container border border-border-subtle text-xs font-mono uppercase tracking-widest text-text-secondary animate-fade-up">
            <AcousticAnchor size={12} pulse />
            <span>Voice-First Evidence Verification</span>
          </div>

          <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-text-primary leading-[1.1] max-w-[960px]">
            Not everything you hear deserves to be believed.
          </h1>

          <p className="font-sans text-base sm:text-lg md:text-xl text-text-secondary max-w-2xl leading-relaxed">
            Talk to VeriVoice. We’ll check the evidence. A precision verification instrument built for an era of synthetic noise.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-2 w-full max-w-md">
            <Button
              variant="teal"
              size="lg"
              onClick={() => onNavigate('talk')}
              className="w-full sm:w-auto min-w-[200px]"
              icon={<span className="material-symbols-outlined text-[20px]">mic</span>}
            >
              Talk to VeriVoice
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => onNavigate('chat')}
              className="w-full sm:w-auto min-w-[200px]"
              icon={<span className="material-symbols-outlined text-[20px]">search</span>}
            >
              Check a Claim
            </Button>
          </div>
        </div>

        {/* 2. INTERACTIVE PRODUCT PREVIEW CANVAS */}
        <div className="w-full max-w-5xl relative mx-auto mt-4">
          <div className="bg-surface-elevated border border-border-subtle rounded-2xl p-6 md:p-10 shadow-2xl relative overflow-hidden flex flex-col items-center gap-8">
            {/* Top Preview Controls */}
            <div className="w-full flex items-center justify-between border-b border-border-subtle pb-4 text-xs font-mono text-text-muted">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-verdict-true" />
                <span className="uppercase tracking-wider">Interactive Voice Canvas Preview</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDemoState('IDLE')}
                  className={`px-2 py-1 rounded text-[10px] uppercase font-mono ${demoState === 'IDLE' ? 'bg-brand-teal text-white' : 'hover:bg-surface-container'}`}
                >
                  Idle
                </button>
                <button
                  onClick={() => setDemoState('LISTENING')}
                  className={`px-2 py-1 rounded text-[10px] uppercase font-mono ${demoState === 'LISTENING' ? 'bg-brand-teal text-white' : 'hover:bg-surface-container'}`}
                >
                  Listening
                </button>
                <button
                  onClick={() => setDemoState('CHECKING')}
                  className={`px-2 py-1 rounded text-[10px] uppercase font-mono ${demoState === 'CHECKING' ? 'bg-brand-teal text-white' : 'hover:bg-surface-container'}`}
                >
                  Checking
                </button>
                <button
                  onClick={() => setDemoState('RESPONDING')}
                  className={`px-2 py-1 rounded text-[10px] uppercase font-mono ${demoState === 'RESPONDING' ? 'bg-brand-teal text-white' : 'hover:bg-surface-container'}`}
                >
                  Verdict
                </button>
              </div>
            </div>

            {/* Central Acoustic Core */}
            <AcousticCore
              state={demoState}
              volumeLevel={demoState === 'LISTENING' ? 0.65 : 0}
              size="lg"
              onClick={() => {
                const nextState =
                  demoState === 'IDLE' ? 'LISTENING' :
                  demoState === 'LISTENING' ? 'CHECKING' :
                  demoState === 'CHECKING' ? 'RESPONDING' : 'IDLE';
                setDemoState(nextState);
              }}
            />

            {/* Verification Dossier Result */}
            <div className="w-full max-w-3xl flex flex-col gap-4 text-left">
              {/* User Query */}
              <div className="flex justify-end">
                <div className="bg-surface-container-high px-5 py-3.5 rounded-xl border border-border-subtle text-text-primary text-sm sm:text-base font-sans">
                  "Is the Earth flat?"
                </div>
              </div>

              {/* System Processing & Result */}
              {demoState === 'CHECKING' && (
                <div className="flex flex-col gap-2 p-4 bg-surface-container rounded-lg border border-border-subtle">
                  <div className="flex justify-between items-center text-xs font-mono text-brand-teal-bright">
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                      Scanning WHO, NASA & USGS repositories...
                    </span>
                    <span>1.2s</span>
                  </div>
                  <div className="w-full h-1 bg-surface-base rounded-full overflow-hidden">
                    <div className="h-full bg-brand-teal-bright animate-pulse w-3/4 rounded-full" />
                  </div>
                </div>
              )}

              {demoState === 'RESPONDING' && (
                <div className="bg-surface-container-low p-6 rounded-xl border-l-4 border-l-verdict-false border border-border-subtle shadow-lg flex flex-col gap-4 animate-fade-up">
                  <div className="flex items-center justify-between">
                    <VerdictBadge verdict="FALSE" size="md" />
                    <span className="text-xs font-mono text-brand-navy-light bg-surface-container px-2.5 py-1 rounded border border-border-subtle">
                      CONFIDENCE: 99.9%
                    </span>
                  </div>

                  <p className="font-editorial text-base sm:text-lg text-text-primary leading-relaxed">
                    Strong Empirical Evidence. Contradicted by NASA, USGS satellite geodesy, and international scientific consensus.
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border-subtle">
                    <span className="text-[11px] font-mono uppercase text-text-muted">Cited Authorities:</span>
                    <a
                      href="https://www.nasa.gov"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-surface-container hover:bg-surface-container-high text-brand-teal-bright text-xs font-mono rounded border border-border-subtle flex items-center gap-1"
                    >
                      <span>NASA.GOV</span>
                      <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                    </a>
                    <a
                      href="https://www.usgs.gov"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-surface-container hover:bg-surface-container-high text-brand-teal-bright text-xs font-mono rounded border border-border-subtle flex items-center gap-1"
                    >
                      <span>USGS</span>
                      <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. TECHNICAL ARCHITECTURE SECTION (Judges & Technical Transparency) */}
      <section className="px-4 md:px-8 max-w-[1200px] mx-auto w-full">
        <div className="flex flex-col gap-8">
          <div className="text-left max-w-2xl">
            <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-text-primary mb-3">
              Technical Architecture
            </h2>
            <p className="text-text-secondary font-sans text-base">
              A rigorous, 5-stage validation pipeline prioritizing verifiable source authority over probabilistic generation.
            </p>
          </div>

          <div className="bg-surface-container-lowest border border-border-subtle rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => setPipelineExpanded(!pipelineExpanded)}
              className="w-full p-6 cursor-pointer flex justify-between items-center font-mono uppercase tracking-wider text-xs sm:text-sm text-text-primary hover:bg-surface-container transition-colors select-none"
            >
              <span className="flex items-center gap-3">
                <span className="material-symbols-outlined text-brand-teal-bright text-[22px]">account_tree</span>
                <span>View Full Pipeline Sequence (5 Stages)</span>
              </span>
              <span className={`material-symbols-outlined transform transition-transform duration-300 ${pipelineExpanded ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>

            {pipelineExpanded && (
              <div className="p-6 md:p-8 border-t border-border-subtle bg-surface-container-low grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 animate-fade-up">
                {/* Stage 1 */}
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-mono text-brand-teal-bright pb-2 border-b border-border-subtle">01. INGEST</span>
                  <ul className="text-xs text-text-secondary font-sans space-y-2">
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-border-variant" /> Groq Whisper ASR</li>
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-border-variant" /> Language Detection</li>
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-border-variant" /> Intent & Domain Filter</li>
                  </ul>
                </div>

                {/* Stage 2 */}
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-mono text-brand-teal-bright pb-2 border-b border-border-subtle">02. QUERY</span>
                  <ul className="text-xs text-text-secondary font-sans space-y-2">
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-border-variant" /> Query Strategy</li>
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-border-variant" /> Offline Knowledge Base</li>
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-border-variant" /> Live Google Web Search</li>
                  </ul>
                </div>

                {/* Stage 3 */}
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-mono text-brand-teal-bright pb-2 border-b border-border-subtle">03. EVALUATE</span>
                  <ul className="text-xs text-text-secondary font-sans space-y-2">
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-border-variant" /> Domain Authority Tier</li>
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-border-variant" /> Wire Copy Deduplication</li>
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-border-variant" /> Evidence Strength Score</li>
                  </ul>
                </div>

                {/* Stage 4 */}
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-mono text-brand-teal-bright pb-2 border-b border-border-subtle">04. VERIFY</span>
                  <ul className="text-xs text-text-secondary font-sans space-y-2">
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-border-variant" /> Delimited Prompt Isolation</li>
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-border-variant" /> Llama 3.3 70B Grounding</li>
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-border-variant" /> Citation URL Whitelisting</li>
                  </ul>
                </div>

                {/* Stage 5 */}
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-mono text-brand-teal-bright pb-2 border-b border-border-subtle">05. OUTPUT</span>
                  <ul className="text-xs text-text-secondary font-sans space-y-2">
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-border-variant" /> Verdict & Confidence</li>
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-border-variant" /> Edge Neural TTS Synthesis</li>
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-border-variant" /> Contextual Evidence Rail</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. MULTILINGUAL STORYTELLING SECTION */}
      <section className="px-4 md:px-8 max-w-[1200px] mx-auto w-full">
        <div className="text-left mb-10">
          <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-text-primary mb-3">
            Global Truth, Universal Access
          </h2>
          <p className="text-text-secondary font-sans text-base max-w-xl">
            Seamlessly navigating dialects and languages to verify claims across borders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* English Card */}
          <div
            onClick={() => handleSampleClick('Is climate change real?')}
            className="bg-surface-elevated p-6 rounded-xl border border-border-subtle border-t-2 border-t-brand-navy-light hover:border-border-variant transition-tactile cursor-pointer flex flex-col justify-between gap-6"
          >
            <div className="flex justify-between items-center">
              <span className="font-mono text-[10px] text-text-muted border border-border-subtle px-2 py-0.5 rounded">EN</span>
              <span className="material-symbols-outlined text-brand-navy-light text-[20px]">graphic_eq</span>
            </div>
            <p className="font-editorial text-lg italic text-text-primary">
              "Is climate change real?"
            </p>
            <div className="pt-4 border-t border-border-subtle flex items-center justify-between">
              <VerdictBadge verdict="TRUE" size="sm" />
              <span className="text-xs font-mono text-brand-teal-bright">Tap to check</span>
            </div>
          </div>

          {/* Urdu Card (RTL) */}
          <div
            dir="rtl"
            onClick={() => handleSampleClick('کیا پولیو کے قطرے بچوں کے لیے محفوظ ہیں؟')}
            className="bg-surface-elevated p-6 rounded-xl border border-border-subtle border-t-2 border-t-brand-teal-bright hover:border-border-variant transition-tactile cursor-pointer flex flex-col justify-between gap-6"
          >
            <div className="flex justify-between items-center" dir="ltr">
              <span className="material-symbols-outlined text-brand-teal-bright text-[20px]">graphic_eq</span>
              <span className="font-mono text-[10px] text-text-muted border border-border-subtle px-2 py-0.5 rounded">UR</span>
            </div>
            <p className="font-urdu text-xl text-text-primary leading-relaxed text-right">
              "کیا پولیو کے قطرے بچوں کے لیے محفوظ ہیں؟"
            </p>
            <div className="pt-4 border-t border-border-subtle flex items-center justify-between" dir="ltr">
              <VerdictBadge verdict="TRUE" size="sm" />
              <span className="text-xs font-mono text-brand-teal-bright">تصدیق کریں</span>
            </div>
          </div>

          {/* Spanish Card */}
          <div
            onClick={() => handleSampleClick('¿Las vacunas causan autismo?')}
            className="bg-surface-elevated p-6 rounded-xl border border-border-subtle border-t-2 border-t-text-muted hover:border-border-variant transition-tactile cursor-pointer flex flex-col justify-between gap-6"
          >
            <div className="flex justify-between items-center">
              <span className="font-mono text-[10px] text-text-muted border border-border-subtle px-2 py-0.5 rounded">ES</span>
              <span className="material-symbols-outlined text-text-muted text-[20px]">graphic_eq</span>
            </div>
            <p className="font-editorial text-lg italic text-text-primary">
              "¿Las vacunas causan autismo?"
            </p>
            <div className="pt-4 border-t border-border-subtle flex items-center justify-between">
              <VerdictBadge verdict="FALSE" size="sm" />
              <span className="text-xs font-mono text-brand-teal-bright">Verificar</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. NAVIGATING UNCERTAINTY (Honesty & Trust Feature) */}
      <section className="px-4 md:px-8 max-w-[1200px] mx-auto w-full">
        <div className="text-left mb-10">
          <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-text-primary mb-3">
            Navigating Uncertainty
          </h2>
          <p className="text-text-secondary font-sans text-base max-w-2xl">
            When evidence is conflicting or insufficient, we explicitly report an 'Uncertain' state. It is a feature of trust, not a bug.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* True Example */}
          <div className="bg-surface-elevated p-6 rounded-xl border border-border-subtle border-l-4 border-l-verdict-true flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <VerdictBadge verdict="TRUE" size="sm" />
              <span className="text-xs font-mono text-text-muted">High Confidence</span>
            </div>
            <p className="font-editorial text-base text-text-primary">"Water boils at 100°C at sea level."</p>
            <p className="text-xs text-text-secondary leading-relaxed">
              Empirically verified by thermodynamic consensus and NIST international physical standards.
            </p>
          </div>

          {/* Uncertain Example */}
          <div className="bg-surface-elevated p-6 rounded-xl border border-border-subtle border-l-4 border-l-verdict-uncertain flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <VerdictBadge verdict="UNCERTAIN" size="sm" />
              <span className="text-xs font-mono text-text-muted">Insufficient Consensus</span>
            </div>
            <p className="font-editorial text-base text-text-primary">"Will human-level AGI arrive by 2028?"</p>
            <p className="text-xs text-text-secondary leading-relaxed">
              Insufficient consensus. Empirical evidence is speculative and debated among leading institutions.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
