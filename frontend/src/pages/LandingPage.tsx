import React from 'react';
import { VerdictBadge } from '../components/ui/VerdictBadge';
import { AcousticAnchor } from '../components/brand/AcousticAnchor';
import { AcousticCore } from '../components/voice/AcousticCore';
import { EvidenceConstellation3D } from '../components/evidence/EvidenceConstellation3D';
import { getTranslation } from '../i18n/translations';
import { AppView } from '../types';

interface LandingPageProps {
  onNavigate: (view: AppView) => void;
  onSelectSampleClaim?: (claim: string) => void;
  currentLanguage?: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onSelectSampleClaim,
  currentLanguage = 'en',
}) => {
  const t = getTranslation(currentLanguage);

  const sampleClaims = [
    { text: 'Are polio drops safe for infants?', lang: 'EN', verdict: 'TRUE' as const },
    { text: 'کیا پولیو کے قطرے بچوں کے لیے محفوظ ہیں؟', lang: 'UR', verdict: 'TRUE' as const, isRtl: true },
    { text: '¿Las vacunas causan autismo?', lang: 'ES', verdict: 'FALSE' as const },
    { text: 'Apakah bawang putih menyembuhkan virus corona?', lang: 'ID', verdict: 'FALSE' as const },
    { text: 'What causes dengue fever and how is it transmitted?', lang: 'EN', verdict: 'RESEARCH_RESPONSE' as const },
  ];

  // Prioritize active language claims
  const activeLanguageClaims = [...sampleClaims].sort((a, b) => {
    if (a.lang.toLowerCase() === currentLanguage.toLowerCase()) return -1;
    if (b.lang.toLowerCase() === currentLanguage.toLowerCase()) return 1;
    return 0;
  });

  const handleSampleClick = (claim: string) => {
    if (onSelectSampleClaim) {
      onSelectSampleClaim(claim);
    }
    onNavigate('chat');
  };

  const discordInviteUrl =
    'https://discord.com/api/oauth2/authorize?client_id=1537205576809840702&permissions=3147776&scope=bot%20applications.commands';

  return (
    <div className="flex flex-col w-full">
      {/* 1. EDITORIAL ASYMMETRIC HERO */}
      <section className="relative px-6 md:px-12 lg:px-16 pt-10 md:pt-18 pb-20 max-w-[1360px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Left Column: Authoritative Editorial Statement */}
          <div className="lg:col-span-7 flex flex-col items-start text-left gap-6">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-brand-teal/10 border border-brand-teal/30 text-xs font-mono uppercase tracking-wider text-brand-teal-bright backdrop-blur-md">
              <AcousticAnchor size={12} pulse />
              <span>{t.hero.tagline}</span>
            </div>

            <h1 className="font-editorial text-5xl sm:text-6xl lg:text-[68px] font-normal tracking-tight text-white leading-[1.08] max-w-[720px]">
              {t.hero.headline}
            </h1>

            <p className="font-sans text-base sm:text-lg text-text-secondary max-w-[600px] leading-relaxed font-light">
              {t.hero.subheadline}
            </p>

            {/* Action CTAs (Tactile & Prominent) */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2 w-full">
              <button
                onClick={() => onNavigate('talk')}
                className="px-7 py-3.5 rounded-xl bg-brand-teal hover:bg-brand-teal-dim text-white font-mono text-xs uppercase tracking-wider font-semibold transition-tactile flex items-center gap-2.5 shadow-xl shadow-brand-teal/25 hover:shadow-brand-teal/40 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[20px]">mic</span>
                <span>{t.hero.startTalk}</span>
              </button>

              <button
                onClick={() => onNavigate('chat')}
                className="px-6 py-3.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-text-primary border border-white/[0.12] hover:border-white/[0.2] font-mono text-xs uppercase tracking-wider font-medium transition-tactile flex items-center gap-2 backdrop-blur-sm hover:scale-[1.01]"
              >
                <span className="material-symbols-outlined text-[18px] text-text-secondary">search</span>
                <span>{t.hero.searchResearch}</span>
              </button>

              <a
                href={discordInviteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3.5 rounded-xl bg-[#5865F2]/10 hover:bg-[#5865F2]/20 text-[#7983F5] hover:text-white border border-[#5865F2]/30 font-mono text-xs uppercase tracking-wider transition-tactile flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">forum</span>
                <span>Discord</span>
              </a>
            </div>

            {/* Quick One-Tap Demo Inquiries */}
            <div className="flex flex-col gap-2 pt-1 w-full max-w-[620px]">
              <span className="text-[11px] font-mono uppercase tracking-widest text-text-muted">
                ⚡ Quick Demo Inquiries (Tap to Test)
              </span>
              <div className="flex flex-wrap gap-2">
                {activeLanguageClaims.slice(0, 4).map((claim, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSampleClick(claim.text)}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-brand-teal/50 text-text-secondary hover:text-white text-xs font-sans transition-tactile flex items-center gap-1.5 group"
                  >
                    <span className="font-mono text-[10px] text-brand-teal-bright uppercase">{claim.lang}</span>
                    <span className="truncate max-w-[190px]">{claim.text}</span>
                    <span className="material-symbols-outlined text-[12px] text-text-muted group-hover:text-brand-teal-bright transition-colors">arrow_forward</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Clean 4-Card Trust & Telemetry Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/[0.08] w-full max-w-[620px]">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col text-left">
                <span className="text-[10px] font-mono uppercase text-brand-teal-bright">⚡ Latency</span>
                <span className="text-xs font-medium text-text-primary mt-0.5">&lt;1.8s Spoken</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col text-left">
                <span className="text-[10px] font-mono uppercase text-brand-teal-bright">🏛️ Consensus</span>
                <span className="text-xs font-medium text-text-primary mt-0.5">WHO · NASA · UN</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col text-left">
                <span className="text-[10px] font-mono uppercase text-brand-teal-bright">🔒 Bounded</span>
                <span className="text-xs font-medium text-text-primary mt-0.5">0% Hallucination</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col text-left">
                <span className="text-[10px] font-mono uppercase text-brand-teal-bright">🌐 Languages</span>
                <span className="text-xs font-medium text-text-primary mt-0.5">UR · EN · ES · ID</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Acoustic Core (Interactive Glass Sanctuary Card) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            <div
              onClick={() => onNavigate('talk')}
              className="w-full max-w-[420px] p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.1] hover:border-brand-teal/50 shadow-2xl backdrop-blur-xl transition-tactile cursor-pointer flex flex-col items-center gap-5 group relative overflow-hidden"
            >
              {/* Ambient radial glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-navy/30 via-brand-teal/15 to-transparent rounded-3xl blur-2xl -z-10 group-hover:opacity-100 transition-opacity" />

              {/* Status Header */}
              <div className="flex items-center justify-between w-full text-xs font-mono text-text-secondary border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-emerald-400 font-semibold uppercase tracking-wider text-[10px]">Acoustic Sanctuary</span>
                </div>
                <span className="text-[11px] text-text-muted font-mono">Live Ready</span>
              </div>

              {/* Visual Core */}
              <div className="relative py-2 flex items-center justify-center">
                <AcousticCore
                  state="IDLE"
                  size="md"
                  onClick={() => onNavigate('talk')}
                />
              </div>

              {/* Action Button Inside Card */}
              <div className="w-full py-3 px-4 rounded-xl bg-brand-teal/10 border border-brand-teal/30 group-hover:bg-brand-teal group-hover:text-white text-brand-teal-bright transition-all flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-wider font-semibold shadow-lg shadow-brand-teal/10">
                <span className="material-symbols-outlined text-[18px]">mic</span>
                <span>Tap Core to Speak Now</span>
              </div>

              {/* Audio Tech Spec */}
              <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
                Groq Whisper LPU + ElevenLabs Neural Speech
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS (Full-Bleed Tone Shift: Editorial Linear Rhythm, Zero Card Overload) */}
      <section className="w-full bg-[#12141A] border-y border-white/[0.06] py-16 md:py-24 px-6 md:px-12 lg:px-16">
        <div className="max-w-[1360px] mx-auto w-full">
          <div className="max-w-2xl mb-12 text-left">
            <span className="text-xs font-mono uppercase tracking-widest text-brand-teal-bright">
              {t.quickStart.badge}
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl font-medium text-text-primary mt-2">
              {t.quickStart.title}
            </h2>
          </div>

          {/* 3 Asymmetric Column Flow with subtle hairline dividers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-left">
            {/* Step 1 */}
            <div
              onClick={() => onNavigate('talk')}
              className="flex flex-col justify-between group cursor-pointer border-t border-white/[0.08] pt-6 hover:border-brand-teal-bright transition-colors"
            >
              <div className="space-y-3">
                <span className="font-mono text-sm text-brand-teal-bright font-semibold">01 / {t.quickStart.step1Tag}</span>
                <h3 className="font-editorial text-xl text-text-primary group-hover:text-brand-teal-bright transition-colors">
                  {t.quickStart.step1Title}
                </h3>
                <p className="font-sans text-xs sm:text-sm text-text-secondary leading-relaxed">
                  {t.quickStart.step1Desc}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-brand-teal-bright pt-6">
                <span>{t.quickStart.step1Btn}</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </div>

            {/* Step 2 */}
            <div
              onClick={() => onNavigate('chat')}
              className="flex flex-col justify-between group cursor-pointer border-t border-white/[0.08] pt-6 hover:border-brand-teal-bright transition-colors"
            >
              <div className="space-y-3">
                <span className="font-mono text-sm text-brand-teal-bright font-semibold">02 / {t.quickStart.step2Tag}</span>
                <h3 className="font-editorial text-xl text-text-primary group-hover:text-brand-teal-bright transition-colors">
                  {t.quickStart.step2Title}
                </h3>
                <p className="font-sans text-xs sm:text-sm text-text-secondary leading-relaxed">
                  {t.quickStart.step2Desc}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-brand-teal-bright pt-6">
                <span>{t.quickStart.step2Btn}</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </div>

            {/* Step 3 */}
            <a
              href={discordInviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col justify-between group cursor-pointer border-t border-white/[0.08] pt-6 hover:border-[#7983F5] transition-colors"
            >
              <div className="space-y-3">
                <span className="font-mono text-sm text-[#7983F5] font-semibold">03 / {t.quickStart.step3Tag}</span>
                <h3 className="font-editorial text-xl text-text-primary group-hover:text-[#7983F5] transition-colors">
                  {t.quickStart.step3Title}
                </h3>
                <p className="font-sans text-xs sm:text-sm text-text-secondary leading-relaxed">
                  {t.quickStart.step3Desc}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-[#7983F5] pt-6">
                <span>{t.quickStart.step3Btn}</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                  open_in_new
                </span>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* 3. 3D EVIDENCE CONSTELLATION SECTION (Full-Width Architectural Showcase) */}
      <section className="px-6 md:px-12 lg:px-16 py-16 md:py-24 max-w-[1360px] mx-auto w-full text-left">
        <div className="flex flex-col gap-8">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-brand-teal-bright">
              Mathematical Verification Architecture
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-medium text-text-primary">
              Multi-source evidence convergence.
            </h2>
            <p className="font-sans text-sm sm:text-base text-text-secondary leading-relaxed">
              VeriVoice queries international peer-reviewed consensus and authoritative government databases in parallel. When a spoken query is received, disparate sources converge in real-time to validate or refute claims with zero hallucination.
            </p>
          </div>

          <div className="w-full bg-[#12141C] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
            <EvidenceConstellation3D />
          </div>
        </div>
      </section>

      {/* 4. CURATED SAMPLE CLAIMS (Clean Editorial Stream) */}
      <section className="px-6 md:px-12 lg:px-16 py-12 max-w-[1360px] mx-auto w-full text-left">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-6">
          <span className="text-xs font-mono uppercase tracking-widest text-text-secondary">
            {t.samples.title}
          </span>
          <span className="text-xs font-mono text-text-muted">One-click live verification</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeLanguageClaims.map((item, idx) => (
            <div
              key={idx}
              onClick={() => handleSampleClick(item.text)}
              dir={item.isRtl ? 'rtl' : 'ltr'}
              className="p-5 border border-white/[0.06] hover:border-brand-teal-bright/40 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-tactile cursor-pointer flex flex-col justify-between gap-4 group"
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-mono text-[10px] uppercase text-text-muted px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">
                  {item.lang}
                </span>
                <VerdictBadge verdict={item.verdict} size="sm" />
              </div>

              <p
                className={`text-text-primary leading-snug group-hover:text-brand-teal-bright transition-colors ${
                  item.isRtl ? 'font-urdu text-lg leading-loose' : 'font-editorial text-base'
                }`}
              >
                "{item.text}"
              </p>

              <div
                className="flex items-center gap-1 text-[11px] font-mono text-text-muted group-hover:text-brand-teal-bright transition-colors pt-2 border-t border-white/[0.04]"
                dir="ltr"
              >
                <span>Verify Claim</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. DISCORD COMMUNITY FOOTER BANNER */}
      <section className="w-full bg-[#10121A] border-t border-white/[0.06] py-16 px-6 md:px-12 lg:px-16 mt-8">
        <div className="max-w-[1360px] mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-8 text-left">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-mono uppercase text-[#7983F5]">Community Intelligence</span>
            <h3 className="font-editorial text-2xl sm:text-3xl text-text-primary">
              Verify rumors directly on Discord.
            </h3>
            <p className="font-sans text-xs sm:text-sm text-text-secondary leading-relaxed">
              Equip your servers with instantaneous voice and text rumor debunking using <code className="text-brand-teal-bright font-mono">/verify</code> and <code className="text-brand-teal-bright font-mono">/voice</code> commands.
            </p>
          </div>

          <a
            href={discordInviteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-mono text-xs uppercase tracking-wider font-semibold transition-tactile flex items-center gap-2 shadow-lg shadow-[#5865F2]/20 flex-shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Add VeriVoice to Discord</span>
          </a>
        </div>
      </section>
    </div>
  );
};
