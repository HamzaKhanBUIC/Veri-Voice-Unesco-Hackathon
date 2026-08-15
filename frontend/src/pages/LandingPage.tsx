import React from 'react';
import { Button } from '../components/ui/Button';
import { VerdictBadge } from '../components/ui/VerdictBadge';
import { AcousticAnchor } from '../components/brand/AcousticAnchor';
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

  // Reorder sample claims so the active language is prioritized first
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

  const discordInviteUrl = 'https://discord.com/api/oauth2/authorize?client_id=1537205576809840702&permissions=3147776&scope=bot%20applications.commands';

  return (
    <div className="flex flex-col gap-16 md:gap-24 pb-20 pt-6 md:pt-12">
      {/* 1. HERO SECTION */}
      <section className="px-4 md:px-8 max-w-[1280px] mx-auto w-full flex flex-col items-center text-center gap-6 md:gap-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container border border-border-subtle text-xs font-mono uppercase tracking-widest text-text-secondary animate-fade-up">
          <AcousticAnchor size={12} pulse />
          <span>{t.hero.tagline}</span>
        </div>

        <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-text-primary leading-[1.1] max-w-[980px]">
          {t.hero.headline}
        </h1>

        <p className="font-sans text-base sm:text-lg md:text-xl text-text-secondary max-w-2xl leading-relaxed">
          {t.hero.subheadline}
        </p>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-2 w-full max-w-lg">
          <Button
            variant="teal"
            size="lg"
            onClick={() => onNavigate('talk')}
            className="w-full sm:w-auto min-w-[180px]"
            icon={<span className="material-symbols-outlined text-[20px]">mic</span>}
          >
            {t.hero.startTalk}
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={() => onNavigate('chat')}
            className="w-full sm:w-auto min-w-[180px]"
            icon={<span className="material-symbols-outlined text-[20px]">search</span>}
          >
            {t.hero.searchResearch}
          </Button>

          <a
            href={discordInviteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#5865F2]/15 hover:bg-[#5865F2]/25 text-[#7983F5] hover:text-white border border-[#5865F2]/40 text-sm font-mono uppercase tracking-wider transition-all w-full sm:w-auto"
          >
            <span className="material-symbols-outlined text-[18px]">forum</span>
            <span>{t.hero.discordBot}</span>
          </a>
        </div>
      </section>

      {/* 2. HOW TO USE VERIVOICE (Clear 3-Step Practical Guide) */}
      <section className="px-4 md:px-8 max-w-[1200px] mx-auto w-full">
        <div className="text-center mb-8">
          <span className="text-xs font-mono uppercase tracking-widest text-brand-teal-bright">{t.quickStart.badge}</span>
          <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-text-primary mt-1">
            {t.quickStart.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1: Voice Room */}
          <div
            onClick={() => onNavigate('talk')}
            className="bg-surface-elevated hover:bg-surface-container p-6 sm:p-8 rounded-2xl border border-border-subtle hover:border-brand-teal/50 transition-all cursor-pointer flex flex-col justify-between gap-6 group"
          >
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-navy/60 border border-brand-teal/30 flex items-center justify-center text-brand-teal-bright group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[24px]">mic</span>
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase text-brand-teal-bright font-semibold">{t.quickStart.step1Tag}</span>
                <h3 className="font-editorial text-xl font-semibold text-text-primary mt-0.5">{t.quickStart.step1Title}</h3>
              </div>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                {t.quickStart.step1Desc}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-brand-teal-bright group-hover:translate-x-1 transition-transform">
              <span>{t.quickStart.step1Btn}</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </div>
          </div>

          {/* Step 2: Chat & Evidence Rail */}
          <div
            onClick={() => onNavigate('chat')}
            className="bg-surface-elevated hover:bg-surface-container p-6 sm:p-8 rounded-2xl border border-border-subtle hover:border-brand-teal/50 transition-all cursor-pointer flex flex-col justify-between gap-6 group"
          >
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-navy/60 border border-brand-teal/30 flex items-center justify-center text-brand-teal-bright group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[24px]">manage_search</span>
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase text-brand-teal-bright font-semibold">{t.quickStart.step2Tag}</span>
                <h3 className="font-editorial text-xl font-semibold text-text-primary mt-0.5">{t.quickStart.step2Title}</h3>
              </div>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                {t.quickStart.step2Desc}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-brand-teal-bright group-hover:translate-x-1 transition-transform">
              <span>{t.quickStart.step2Btn}</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </div>
          </div>

          {/* Step 3: Discord Bot */}
          <a
            href={discordInviteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-surface-elevated hover:bg-surface-container p-6 sm:p-8 rounded-2xl border border-border-subtle hover:border-[#5865F2]/50 transition-all cursor-pointer flex flex-col justify-between gap-6 group"
          >
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#5865F2]/20 border border-[#5865F2]/40 flex items-center justify-center text-[#7983F5] group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[24px]">forum</span>
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase text-[#7983F5] font-semibold">{t.quickStart.step3Tag}</span>
                <h3 className="font-editorial text-xl font-semibold text-text-primary mt-0.5">{t.quickStart.step3Title}</h3>
              </div>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                {t.quickStart.step3Desc}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-[#7983F5] group-hover:translate-x-1 transition-transform">
              <span>{t.quickStart.step3Btn}</span>
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            </div>
          </a>
        </div>
      </section>

      {/* 3. ONE-CLICK SAMPLE INQUIRIES */}
      <section className="px-4 md:px-8 max-w-[1200px] mx-auto w-full">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-text-secondary flex items-center gap-2">
              <span className="material-symbols-outlined text-brand-teal-bright text-[16px]">touch_app</span>
              <span>{t.samples.title}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeLanguageClaims.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSampleClick(item.text)}
                dir={item.isRtl ? 'rtl' : 'ltr'}
                className="bg-surface-elevated hover:bg-surface-container border border-border-subtle hover:border-brand-teal-bright/40 p-4 rounded-xl text-left transition-all flex flex-col justify-between gap-3 group"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-mono text-[10px] uppercase text-text-muted bg-surface-container px-2 py-0.5 rounded border border-border-subtle">
                    {item.lang}
                  </span>
                  <VerdictBadge verdict={item.verdict} size="sm" />
                </div>
                <p className={`text-sm text-text-primary leading-snug group-hover:text-brand-teal-bright transition-colors ${item.isRtl ? 'font-urdu text-base' : 'font-editorial'}`}>
                  "{item.text}"
                </p>
                <div className="flex items-center gap-1 text-[11px] font-mono text-text-muted group-hover:text-brand-teal-bright transition-colors" dir="ltr">
                  <span>Verify Claim</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 4. DISCORD BOT COMMUNITY BANNER */}
      <section className="px-4 md:px-8 max-w-[1200px] mx-auto w-full">
        <div className="bg-gradient-to-r from-surface-elevated to-[#5865F2]/10 border border-[#5865F2]/30 rounded-2xl p-6 sm:p-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex flex-col gap-3 max-w-xl text-left">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase text-[#7983F5]">
              <span className="w-2 h-2 rounded-full bg-verdict-true animate-pulse" />
              <span>VeriVoice Discord Bot · Online & Verified</span>
            </div>
            <h3 className="font-editorial text-2xl sm:text-3xl font-semibold text-text-primary">
              Fact-check directly in your Discord community.
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Equip your community with automated rumor checking. Send voice attachments or run <span className="font-mono text-text-primary">/verify</span>, <span className="font-mono text-text-primary">/research</span>, or <span className="font-mono text-text-primary">/voice</span> commands.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <a
              href={discordInviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-sm font-mono font-medium shadow-lg hover:shadow-[#5865F2]/25 transition-all w-full sm:w-auto"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span>Add VeriVoice to Discord</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
