import React, { useState, useEffect, useCallback } from 'react';
import { TopNavBar } from '../components/navigation/TopNavBar';
import { LandingPage } from '../pages/LandingPage';
import { TalkPage } from '../pages/TalkPage';
import { ChatPage } from '../pages/ChatPage';
import { MethodologyPage } from '../pages/MethodologyPage';
import { UserSettingsModal, UserSettings } from '../components/settings/UserSettingsModal';
import { apiClient } from '../services/api/ApiClient';
import { SUPPORTED_LANGUAGES } from '../components/navigation/LanguageSelector';
import { getTranslation } from '../i18n/translations';
import { AppView } from '../types';

const DEFAULT_SETTINGS: UserSettings = {
  autoPlayAudio: true,
  strictPrimaryAuthorityOnly: false,
  voiceSpeed: 'normal',
  highContrast: false,
};

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>('landing');
  const [currentLanguage, setCurrentLanguage] = useState<string>(() => {
    return localStorage.getItem('verivoice_lang') || 'en';
  });
  const [selectedClaim, setSelectedClaim] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // User Settings State with LocalStorage persistence
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem('verivoice_user_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const handleUpdateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('verivoice_user_settings', JSON.stringify(updated));
      return updated;
    });
  };

  const handleLanguageChange = (lang: string) => {
    setCurrentLanguage(lang);
    localStorage.setItem('verivoice_lang', lang);
  };

  const handleClearHistory = () => {
    localStorage.removeItem('verivoice_recent_queries');
    setSelectedClaim('');
  };

  // Server Health State
  const [serverState, setServerState] = useState<'CHECKING' | 'WAKING' | 'READY' | 'OFFLINE_READY'>('CHECKING');
  const [dismissNotice, setDismissNotice] = useState(false);
  const [wakingSeconds, setWakingSeconds] = useState(0);

  const t = getTranslation(currentLanguage);

  // Set HTML dir attribute when language changes (RTL for Urdu)
  useEffect(() => {
    const langConfig = SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage);
    const direction = langConfig?.dir || 'ltr';
    document.documentElement.dir = direction;
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  // Robust Server Health & Active Poller
  const checkHealthStatus = useCallback(async () => {
    const health = await apiClient.checkHealth();
    if (health && health.status === 'ok') {
      setServerState('READY');
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    let isMounted = true;
    let pollInterval: ReturnType<typeof setInterval> | null = null;
    let timerInterval: ReturnType<typeof setInterval> | null = null;

    const probeServer = async () => {
      const isAlive = await checkHealthStatus();
      if (!isMounted) return;

      if (!isAlive) {
        setServerState('WAKING');

        // Track seconds
        timerInterval = setInterval(() => {
          setWakingSeconds((prev) => {
            if (prev >= 12 && serverState === 'WAKING') {
              // After 12s of waiting for unconfigured cloud instance, enable client resilience mode
              setServerState('OFFLINE_READY');
            }
            return prev + 1;
          });
        }, 1000);

        // High frequency retry polling every 3s
        pollInterval = setInterval(async () => {
          const aliveNow = await checkHealthStatus();
          if (aliveNow && isMounted) {
            if (pollInterval) clearInterval(pollInterval);
            if (timerInterval) clearInterval(timerInterval);
          }
        }, 3000);
      }
    };

    probeServer();

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [checkHealthStatus]);

  const isServerReady = serverState === 'READY' || serverState === 'OFFLINE_READY';

  return (
    <div className="min-h-screen bg-surface-base text-text-primary flex flex-col font-sans selection:bg-brand-navy selection:text-brand-teal-bright">
      {/* Fixed Glass Navigation Bar with Back & Settings */}
      <TopNavBar
        activeView={activeView}
        onViewChange={(view) => {
          setActiveView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* 1. SERVER WAKING UP NOTIFICATION BAR */}
      {serverState === 'WAKING' && !dismissNotice && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-[#12151E]/95 backdrop-blur-xl border-b border-brand-teal-bright/30 px-4 md:px-8 py-2.5 text-xs font-mono shadow-2xl animate-fade-up">
          <div className="max-w-[1360px] mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping flex-shrink-0" />
              <div className="text-left flex flex-wrap items-center gap-2">
                <span className="text-amber-300 font-medium text-[11px]">
                  {t.serverNotice.wakingTitle}
                </span>
                <span className="text-text-muted text-[10px]">• Connecting ({wakingSeconds}s / 15s)</span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => {
                  setServerState('OFFLINE_READY');
                  setDismissNotice(true);
                }}
                className="px-2.5 py-1 bg-white/[0.06] hover:bg-white/[0.12] text-text-primary rounded-lg text-[11px] font-mono transition-tactile"
              >
                Use Demo Mode
              </button>
              <button
                onClick={() => setDismissNotice(true)}
                className="p-1 hover:bg-white/[0.08] rounded text-text-muted hover:text-text-primary transition-colors"
                aria-label="Dismiss server waking notice"
              >
                <span className="material-symbols-outlined text-[15px]">close</span>
              </button>
            </div>
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
              onClick={() => setActiveView('landing')}
              className="hover:text-text-primary transition-colors uppercase"
            >
              Home
            </button>
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

      {/* User Settings Modal */}
      <UserSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onClearHistory={handleClearHistory}
        onBackendUrlChanged={() => checkHealthStatus()}
      />
    </div>
  );
};
