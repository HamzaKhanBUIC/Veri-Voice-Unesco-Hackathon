import React, { useState } from 'react';
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
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      onNavigate('chat');
      return;
    }
    if (onSelectSampleClaim) {
      onSelectSampleClaim(searchQuery.trim());
    }
    onNavigate('chat');
  };

  const discordInviteUrl =
    'https://discord.com/api/oauth2/authorize?client_id=1537205576809840702&permissions=3147776&scope=bot%20applications.commands';

  return (
    <div className="flex flex-col w-full text-text-primary">
      {/* 1. HERO SECTION: BESPOKE, SPACIOUS, PRODUCT-FOCUSED */}
      <section className="relative px-6 md:px-12 lg:px-16 pt-12 md:pt-20 pb-20 max-w-[1280px] mx-auto w-full flex flex-col items-center text-center">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-teal/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

        {/* Category Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.1] text-xs font-mono tracking-wider text-brand-teal-bright mb-6 backdrop-blur-md">
          <AcousticAnchor size={12} pulse />
          <span className="font-medium">UNESCO #GlobalMILWeek2026 · Voice-First Media Literacy</span>
        </div>

        {/* Main Headline */}
        <h1 className="font-editorial text-5xl sm:text-6xl md:text-7xl lg:text-[76px] font-normal tracking-tight text-white leading-[1.05] max-w-[900px] mb-6">
          Voice. Verify. Empower.
        </h1>

        {/* Subtitle */}
        <p className="font-sans text-base sm:text-lg md:text-xl text-text-secondary max-w-[680px] leading-relaxed font-light mb-10">
          Instant, spoken claim verification in Urdu, English, Spanish, and Indonesian. Grounded in real-time against WHO, NASA, IPCC, and UNESCO archives.
        </p>

        {/* UNIFIED INTERACTIVE VERIFICATION CONSOLE */}
        <div className="w-full max-w-[720px] mb-6">
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-2 p-2 rounded-2xl bg-[#15171E] border border-white/[0.12] hover:border-brand-teal/50 focus-within:border-brand-teal-bright focus-within:ring-4 focus-within:ring-brand-teal/10 shadow-2xl transition-all"
          >
            <div className="flex items-center pl-3 text-text-muted">
              <span className="material-symbols-outlined text-[22px]">search</span>
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type or ask any claim (e.g. 'Are polio drops safe?')..."
              className="flex-1 bg-transparent border-none text-white placeholder:text-text-muted text-sm sm:text-base font-sans focus:outline-none px-2 py-2"
            />

            <button
              type="submit"
              className="px-5 py-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white font-mono text-xs uppercase tracking-wider font-medium transition-tactile hidden sm:flex items-center gap-1.5"
            >
              <span>Verify</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('talk')}
              className="px-5 py-3 rounded-xl bg-brand-teal hover:bg-brand-teal-dim text-white font-mono text-xs uppercase tracking-wider font-semibold transition-tactile flex items-center gap-2 shadow-lg shadow-brand-teal/25"
            >
              <span className="material-symbols-outlined text-[18px]">mic</span>
              <span>Live Voice</span>
            </button>
          </form>

          {/* Quick Demo Inquiries */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider mr-1">
              Try Demo:
            </span>
            {activeLanguageClaims.slice(0, 4).map((claim, idx) => (
              <button
                key={idx}
                onClick={() => handleSampleClick(claim.text)}
                className="px-3 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-brand-teal/40 text-text-secondary hover:text-white text-xs font-sans transition-tactile flex items-center gap-1.5 group"
              >
                <span className="font-mono text-[10px] text-brand-teal-bright uppercase font-medium">
                  {claim.lang}
                </span>
                <span className="truncate max-w-[170px]">{claim.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Hub Actions */}
        <div className="flex items-center gap-4 text-xs font-mono text-text-secondary">
          <button
            onClick={() => onNavigate('chat')}
            className="hover:text-brand-teal-bright transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">menu_book</span>
            <span>Evidence Research Explorer</span>
          </button>
          <span>•</span>
          <a
            href={discordInviteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#7983F5] transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">forum</span>
            <span>24/7 Discord Community Bot</span>
          </a>
        </div>
      </section>

      {/* 2. FULL-WIDTH TRUST & CONSENSUS TELEMETRY STRIP */}
      <section className="w-full border-y border-white/[0.08] bg-[#111319]/80 backdrop-blur-lg py-6 px-6 md:px-12 lg:px-16">
        <div className="max-w-[1280px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center text-brand-teal-bright flex-shrink-0">
              <span className="material-symbols-outlined text-[20px]">bolt</span>
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-text-muted">Latency</div>
              <div className="text-sm font-semibold text-text-primary">&lt;1.8s Spoken Audio</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center text-brand-teal-bright flex-shrink-0">
              <span className="material-symbols-outlined text-[20px]">account_balance</span>
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-text-muted">Consensus</div>
              <div className="text-sm font-semibold text-text-primary">WHO · NASA · IPCC · UN</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center text-brand-teal-bright flex-shrink-0">
              <span className="material-symbols-outlined text-[20px]">verified_user</span>
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-text-muted">Bound</div>
              <div className="text-sm font-semibold text-text-primary">0% Hallucination Rate</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center text-brand-teal-bright flex-shrink-0">
              <span className="material-symbols-outlined text-[20px]">translate</span>
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-text-muted">Multilingual</div>
              <div className="text-sm font-semibold text-text-primary">Urdu · English · ES · ID</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE 2-SIDED STUDIO: ACOUSTIC SANCTUARY + ARCHITECTURE */}
      <section className="px-6 md:px-12 lg:px-16 py-20 max-w-[1280px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Live Acoustic Sanctuary */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div
              onClick={() => onNavigate('talk')}
              className="w-full max-w-[460px] p-8 rounded-3xl bg-[#14161F] border border-white/[0.1] hover:border-brand-teal/50 shadow-2xl transition-all cursor-pointer flex flex-col items-center gap-6 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-navy/30 via-brand-teal/15 to-transparent rounded-3xl blur-2xl -z-10 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-center justify-between w-full text-xs font-mono text-text-secondary border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 font-semibold uppercase tracking-wider text-xs">Live Voice Sanctuary</span>
                </div>
                <span className="text-text-muted">Hands-Free</span>
              </div>

              <div className="py-4">
                <AcousticCore state="IDLE" size="lg" onClick={() => onNavigate('talk')} />
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate('talk');
                }}
                className="w-full py-4 px-6 rounded-xl bg-brand-teal hover:bg-brand-teal-dim text-white transition-tactile flex items-center justify-center gap-2.5 text-xs font-mono uppercase tracking-wider font-semibold shadow-xl shadow-brand-teal/20"
              >
                <span className="material-symbols-outlined text-[20px]">mic</span>
                <span>Enter Spoken Dialogue Studio</span>
              </button>

              <span className="text-[11px] font-mono text-text-muted">
                Powered by Groq Whisper LPU + ElevenLabs Neural Speech
              </span>
            </div>
          </div>

          {/* Right Column: Key Principles & MIL Value */}
          <div className="lg:col-span-6 flex flex-col text-left gap-6 lg:pl-6">
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-brand-teal-bright">
                Voice-First Equity
              </span>
              <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-medium text-white leading-tight">
                Designed for low-literacy communities.
              </h2>
              <p className="font-sans text-sm sm:text-base text-text-secondary leading-relaxed">
                Over 700 million individuals across the Global South encounter viral disinformation through voice notes on WhatsApp. Traditional text fact-checking articles do not reach them. VeriVoice bridges this gap by receiving spoken questions and returning authoritative spoken verdicts in native languages.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
                <span className="font-mono text-xs text-brand-teal-bright font-semibold">01 / Universal Access</span>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Zero reading required. Listen to spoken verdicts and plain-language explanations.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
                <span className="font-mono text-xs text-brand-teal-bright font-semibold">02 / 12 Fact Domains</span>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Health, climate, planetary science, disaster alerts, and debunked viral hoaxes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS (DW AKADEMIE MIL THREE-PILLAR PIPELINE) */}
      <section className="w-full bg-[#11131A] border-y border-white/[0.08] py-20 px-6 md:px-12 lg:px-16 text-left">
        <div className="max-w-[1280px] mx-auto w-full">
          <div className="max-w-2xl mb-14">
            <span className="text-xs font-mono uppercase tracking-widest text-brand-teal-bright">
              {t.quickStart.badge}
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-medium text-white mt-2">
              {t.quickStart.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1: ACCESS */}
            <div
              onClick={() => onNavigate('talk')}
              className="p-8 rounded-3xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.08] hover:border-brand-teal-bright/40 transition-all cursor-pointer flex flex-col justify-between gap-6 group"
            >
              <div className="space-y-3">
                <span className="font-mono text-xs text-brand-teal-bright font-bold uppercase tracking-wider">
                  01 / {t.quickStart.step1Tag}
                </span>
                <h3 className="font-editorial text-2xl text-white group-hover:text-brand-teal-bright transition-colors">
                  {t.quickStart.step1Title}
                </h3>
                <p className="font-sans text-sm text-text-secondary leading-relaxed font-light">
                  {t.quickStart.step1Desc}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-brand-teal-bright pt-4 border-t border-white/[0.06]">
                <span>{t.quickStart.step1Btn}</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </div>

            {/* Step 2: ANALYZE */}
            <div
              onClick={() => onNavigate('chat')}
              className="p-8 rounded-3xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.08] hover:border-brand-teal-bright/40 transition-all cursor-pointer flex flex-col justify-between gap-6 group"
            >
              <div className="space-y-3">
                <span className="font-mono text-xs text-brand-teal-bright font-bold uppercase tracking-wider">
                  02 / {t.quickStart.step2Tag}
                </span>
                <h3 className="font-editorial text-2xl text-white group-hover:text-brand-teal-bright transition-colors">
                  {t.quickStart.step2Title}
                </h3>
                <p className="font-sans text-sm text-text-secondary leading-relaxed font-light">
                  {t.quickStart.step2Desc}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-brand-teal-bright pt-4 border-t border-white/[0.06]">
                <span>{t.quickStart.step2Btn}</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </div>

            {/* Step 3: ACT */}
            <a
              href={discordInviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-8 rounded-3xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.08] hover:border-[#7983F5]/60 transition-all cursor-pointer flex flex-col justify-between gap-6 group"
            >
              <div className="space-y-3">
                <span className="font-mono text-xs text-[#7983F5] font-bold uppercase tracking-wider">
                  03 / {t.quickStart.step3Tag}
                </span>
                <h3 className="font-editorial text-2xl text-white group-hover:text-[#7983F5] transition-colors">
                  {t.quickStart.step3Title}
                </h3>
                <p className="font-sans text-sm text-text-secondary leading-relaxed font-light">
                  {t.quickStart.step3Desc}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#7983F5] pt-4 border-t border-white/[0.06]">
                <span>{t.quickStart.step3Btn}</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                  open_in_new
                </span>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* 5. 3D EVIDENCE CONSTELLATION SHOWCASE */}
      <section className="px-6 md:px-12 lg:px-16 py-20 max-w-[1280px] mx-auto w-full text-left">
        <div className="flex flex-col gap-8">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-brand-teal-bright">
              Mathematical Evidence Architecture
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-medium text-white">
              Multi-source evidence convergence.
            </h2>
            <p className="font-sans text-sm sm:text-base text-text-secondary leading-relaxed font-light">
              VeriVoice queries international peer-reviewed consensus and authoritative institutional databases in parallel. Real-time citations converge into deterministic verdicts with 0% hallucination.
            </p>
          </div>

          <div className="w-full bg-[#12141C] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl">
            <EvidenceConstellation3D />
          </div>
        </div>
      </section>

      {/* 6. CURATED SAMPLE CLAIMS */}
      <section className="px-6 md:px-12 lg:px-16 py-12 max-w-[1280px] mx-auto w-full text-left">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-8">
          <span className="text-xs font-mono uppercase tracking-widest text-text-secondary">
            {t.samples.title}
          </span>
          <span className="text-xs font-mono text-text-muted">One-click live verification</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {activeLanguageClaims.map((item, idx) => (
            <div
              key={idx}
              onClick={() => handleSampleClick(item.text)}
              dir={item.isRtl ? 'rtl' : 'ltr'}
              className="p-6 border border-white/[0.08] hover:border-brand-teal-bright/40 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer flex flex-col justify-between gap-4 group shadow-md"
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-mono text-[10px] uppercase text-text-muted px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
                  {item.lang}
                </span>
                <VerdictBadge verdict={item.verdict} size="sm" />
              </div>

              <p
                className={`text-white leading-snug group-hover:text-brand-teal-bright transition-colors ${
                  item.isRtl ? 'font-urdu text-lg leading-loose' : 'font-editorial text-base'
                }`}
              >
                "{item.text}"
              </p>

              <div
                className="flex items-center gap-1.5 text-xs font-mono text-text-muted group-hover:text-brand-teal-bright transition-colors pt-3 border-t border-white/[0.04]"
                dir="ltr"
              >
                <span>Verify Claim</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. DISCORD COMMUNITY FOOTER BANNER */}
      <section className="w-full bg-[#10121A] border-t border-white/[0.08] py-16 px-6 md:px-12 lg:px-16 mt-8">
        <div className="max-w-[1280px] mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-8 text-left">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-mono uppercase text-[#7983F5] font-semibold">Community Intelligence</span>
            <h3 className="font-editorial text-2xl sm:text-3xl text-white">
              Verify rumors directly on Discord.
            </h3>
            <p className="font-sans text-xs sm:text-sm text-text-secondary leading-relaxed font-light">
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
