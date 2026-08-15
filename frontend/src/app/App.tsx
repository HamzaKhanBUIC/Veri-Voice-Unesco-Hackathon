import React, { useState, useEffect } from 'react';
import { TopNavBar } from '../components/navigation/TopNavBar';
import { LandingPage } from '../pages/LandingPage';
import { TalkPage } from '../pages/TalkPage';
import { ChatPage } from '../pages/ChatPage';
import { MethodologyPage } from '../pages/MethodologyPage';
import { apiClient } from '../services/api/ApiClient';
import { SUPPORTED_LANGUAGES } from '../components/navigation/LanguageSelector';
import { getTranslation } from '../i18n/translations';
import { AppView } from '../types';

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>('landing');
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [selectedClaim, setSelectedClaim] = useState<string>('');
  
  // Server Health & Cold-Start Waking State
  const [serverState, setServerState] = useState<'CHECKING' | 'WAKING' | 'READY'>('CHECKING');
  const [showReadyToast, setShowReadyToast] = useState(false);
  const [dismissNotice, setDismissNotice] = useState(false);

  const t = getTranslation(currentLanguage);

  // Set HTML dir attribute when language changes (RTL for Urdu)
  useEffect(() => {
    const langConfig = SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage);
    const direction = langConfig?.dir || 'ltr';
    document.documentElement.dir = direction;
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  // Robust Server Health & Active Cold-Start Poller
  useEffect(() => {
    let isMounted = true;
    let pollInterval: ReturnType<typeof setInterval> | null = null;
    let warmupTimeout: ReturnType<typeof setTimeout> | null = null;

    const probeServer = async () => {
      // If server takes longer than 1200ms to respond, mark as WAKING
      warmupTimeout = setTimeout(() => {
        if (isMounted && serverState !== 'READY') {
          setServerState('WAKING');
        }
      }, 1200);

      const health = await apiClient.checkHealth();
      if (warmupTimeout) clearTimeout(warmupTimeout);

      if (!isMounted) return;

      if (health && health.status === 'ok') {
        setServerState((prev) => {
          if (prev === 'WAKING') {
            setShowReadyToast(true);
            setTimeout(() => {
              if (isMounted) setShowReadyToast(false);
            }, 3500);
          }
          return 'READY';
        });
        if (pollInterval) {
          clearInterval(pollInterval);
          pollInterval = null;
        }
      } else {
        setServerState('WAKING');
        // Start high-frequency retry polling every 2.5s until alive
        if (!pollInterval) {
          pollInterval = setInterval(async () => {
            const retryHealth = await apiClient.checkHealth();
            if (!isMounted) return;
            if (retryHealth && retryHealth.status === 'ok') {
              setServerState('READY');
              setShowReadyToast(true);
              setTimeout(() => {
                if (isMounted) setShowReadyToast(false);
              }, 3500);
              if (pollInterval) clearInterval(pollInterval);
            }
          }, 2500);
        }
      }
    };

    probeServer();

    return () => {
      isMounted = false;
      if (warmupTimeout) clearTimeout(warmupTimeout);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []);

  const isServerReady = serverState === 'READY';

  return (
    <div className="min-h-screen bg-surface-base text-text-primary flex flex-col font-sans selection:bg-brand-navy selection:text-brand-teal-bright">
      {/* Fixed Glass Navigation Bar */}
      <TopNavBar
        activeView={activeView}
        onViewChange={(view) => {
          setActiveView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
      />

      {/* 1. SERVER WAKING UP MODAL BANNER */}
      {serverState === 'WAKING' && !dismissNotice && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-[#14161F]/95 backdrop-blur-xl border-b border-brand-teal-bright/40 px-4 md:px-8 py-3 text-xs font-mono shadow-2xl animate-fade-up">
          <div className="max-w-[1360px] mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping flex-shrink-0" />
              <div className="text-left space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-semibold uppercase tracking-wider text-[11px]">
                    {t.serverNotice.wakingTitle}
                  </span>
                  <span className="text-text-muted text-[10px] hidden sm:inline">• Cold Start (~15–30s)</span>
                </div>
                <p className="text-text-secondary font-sans text-xs max-w-2xl leading-normal">
                  {t.serverNotice.wakingDesc}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="hidden md:flex items-center gap-2 text-brand-teal-bright">
                <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                <span className="text-[11px] font-mono">Connecting...</span>
              </div>
              <button
                onClick={() => setDismissNotice(true)}
                className="p-1.5 hover:bg-white/[0.08] rounded-lg text-text-muted hover:text-text-primary transition-colors"
                aria-label="Dismiss server waking notice"
                title="Dismiss notice"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          </div>

          {/* Subtly animated connection progress bar */}
          <div className="w-full h-0.5 bg-white/[0.06] mt-2 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-400 via-brand-teal-bright to-amber-400 w-1/2 rounded-full animate-pulse" />
          </div>
        </div>
      )}

      {/* 2. SERVER AWAKE & READY TOAST */}
      {showReadyToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#10221A] border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-mono flex items-center gap-2.5 animate-fade-up backdrop-blur-md">
          <span className="material-symbols-outlined text-[18px] text-emerald-400">check_circle</span>
          <div className="text-left">
            <strong className="block font-semibold">{t.serverNotice.readyTitle}</strong>
            <span className="text-[11px] text-emerald-200/80">{t.serverNotice.readyDesc}</span>
          </div>
        </div>
      )}

      {/* Main Content Router */}
      <main className="flex-1 pt-16 flex flex-col">
        {activeView === 'landing' && (
          <LandingPage
            onNavigate={(view) => {
              setActiveView(view);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            currentLanguage={currentLanguage}
            onSelectSampleClaim={(claim) => {
              setSelectedClaim(claim);
              setActiveView('chat');
            }}
          />
        )}

        {activeView === 'talk' && (
          <TalkPage
            onNavigate={setActiveView}
            currentLanguage={currentLanguage}
            isServerReady={isServerReady}
          />
        )}

        {activeView === 'chat' && (
          <ChatPage
            initialClaim={selectedClaim}
            currentLanguage={currentLanguage}
            onNavigate={setActiveView}
            isServerReady={isServerReady}
          />
        )}

        {activeView === 'methodology' && (
          <MethodologyPage
            onNavigate={setActiveView}
            currentLanguage={currentLanguage}
          />
        )}
      </main>

      {/* Persistent Clean Footer */}
      <footer className="border-t border-white/[0.06] bg-[#0E0E0E] py-8 px-6 md:px-12 mt-auto text-xs font-mono text-text-muted">
        <div className="max-w-[1360px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[14px]">shield</span>
            <span>{t.footer.copyright}</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveView('methodology')}
              className="hover:text-text-primary transition-colors uppercase"
            >
              {t.footer.methodology}
            </button>
            <a
              href="https://discord.com/api/oauth2/authorize?client_id=1537205576809840702&permissions=3147776&scope=bot%20applications.commands"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-text-primary transition-colors uppercase"
            >
              {t.footer.discordBot}
            </a>
            <a
              href="https://github.com/HamzaKhanBUIC/Veri-Voice-Unesco-Hackathon"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-text-primary transition-colors uppercase"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
