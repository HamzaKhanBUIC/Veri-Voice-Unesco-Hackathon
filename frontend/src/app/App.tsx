import React, { useState, useEffect } from 'react';
import { TopNavBar } from '../components/navigation/TopNavBar';
import { LandingPage } from '../pages/LandingPage';
import { TalkPage } from '../pages/TalkPage';
import { ChatPage } from '../pages/ChatPage';
import { MethodologyPage } from '../pages/MethodologyPage';
import { apiClient } from '../services/api/ApiClient';
import { AppView } from '../types';
import { SUPPORTED_LANGUAGES } from '../components/navigation/LanguageSelector';

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>('landing');
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [selectedClaim, setSelectedClaim] = useState<string>('');
  const [systemStatus, setSystemStatus] = useState<'online' | 'checking' | 'warning' | 'offline'>('checking');
  const [dismissWarmupBanner, setDismissWarmupBanner] = useState(false);
  const [showWarmupNotice, setShowWarmupNotice] = useState(false);

  // Set HTML dir attribute when language changes (RTL for Urdu/Arabic)
  useEffect(() => {
    const langConfig = SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage);
    const direction = langConfig?.dir || 'ltr';
    document.documentElement.dir = direction;
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  // Ping backend /health on initial mount to wake up Render instance
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const checkBackend = async () => {
      setSystemStatus('checking');
      timer = setTimeout(() => {
        setShowWarmupNotice(true);
      }, 1500);

      const health = await apiClient.checkHealth();
      clearTimeout(timer);
      if (health && health.status === 'ok') {
        setSystemStatus('online');
        setShowWarmupNotice(false);
      } else {
        setSystemStatus('offline');
        setShowWarmupNotice(false);
      }
    };
    checkBackend();

    // Check periodically every 60s
    const interval = setInterval(checkBackend, 60000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

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
        systemStatus={systemStatus}
      />

      {/* Dynamic Server Warm-Up Toast / Banner */}
      {showWarmupNotice && !dismissWarmupBanner && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-brand-navy-deep/95 backdrop-blur-xl border-b border-brand-teal/30 px-4 py-2.5 text-xs font-mono text-text-primary shadow-xl animate-fade-up">
          <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-brand-teal-bright animate-ping" />
              <span className="text-brand-teal-bright font-semibold">Engine Warming Up:</span>
              <span className="text-text-secondary hidden sm:inline">
                Cloud verification instance is waking up from standby (~15s on cold start). Verification & voice tools will be ready momentarily.
              </span>
              <span className="text-text-secondary sm:hidden">
                Cloud instance waking up (~15s)...
              </span>
            </div>
            <button
              onClick={() => setDismissWarmupBanner(true)}
              className="p-1 hover:bg-surface-container rounded-lg text-text-muted hover:text-text-primary transition-colors"
              aria-label="Dismiss banner"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
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
          />
        )}

        {activeView === 'chat' && (
          <ChatPage
            initialClaim={selectedClaim}
            currentLanguage={currentLanguage}
            onNavigate={setActiveView}
          />
        )}

        {activeView === 'methodology' && (
          <MethodologyPage
            onNavigate={setActiveView}
          />
        )}
      </main>

      {/* Persistent Clean Footer (Stitch C3) */}
      <footer className="border-t border-border-subtle bg-surface-container-lowest py-8 px-4 md:px-8 mt-auto text-xs font-mono text-text-muted">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[14px]">shield</span>
            <span>VeriVoice © 2026 · UNESCO Infodemic Mitigation Initiative</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveView('methodology')}
              className="hover:text-text-primary transition-colors uppercase"
            >
              Methodology
            </button>
            <a
              href="https://discord.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-text-primary transition-colors uppercase"
            >
              Discord Bot
            </a>
            <a
              href="https://github.com"
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
