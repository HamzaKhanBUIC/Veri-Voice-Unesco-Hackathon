import React, { useState } from 'react';
import { SUPPORTED_LANGUAGES } from '../navigation/LanguageSelector';
import { apiClient } from '../../services/api/ApiClient';

export interface UserSettings {
  autoPlayAudio: boolean;
  strictPrimaryAuthorityOnly: boolean;
  voiceSpeed: 'normal' | 'slow' | 'fast';
  highContrast: boolean;
}

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: string;
  onLanguageChange: (lang: string) => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onClearHistory?: () => void;
  onBackendUrlChanged?: () => void;
}

export const UserSettingsModal: React.FC<UserSettingsModalProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  onLanguageChange,
  settings,
  onUpdateSettings,
  onClearHistory,
  onBackendUrlChanged,
}) => {
  const [backendUrl, setBackendUrl] = useState<string>(() => apiClient.getResolvedBaseUrl());

  if (!isOpen) return null;

  const handleSave = () => {
    apiClient.setCustomBaseUrl(backendUrl);
    if (onBackendUrlChanged) {
      onBackendUrlChanged();
    }
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-up"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#12141C] border border-white/[0.1] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-left"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-brand-teal-bright text-[22px]">settings</span>
            <h3 className="font-editorial text-xl font-medium text-text-primary">
              User Settings & Preferences
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-text-muted hover:text-text-primary rounded-lg hover:bg-white/[0.04] transition-colors"
            aria-label="Close settings"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* 1. Language Preference */}
        <div className="space-y-3">
          <label className="text-xs font-mono uppercase tracking-widest text-text-secondary block">
            Interface & Verification Language
          </label>
          <div className="grid grid-cols-2 gap-2">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = currentLanguage.toLowerCase() === lang.code.toLowerCase();
              return (
                <button
                  key={lang.code}
                  onClick={() => onLanguageChange(lang.code)}
                  className={`px-4 py-3 rounded-xl border text-xs font-mono transition-tactile flex items-center justify-between ${
                    isSelected
                      ? 'bg-brand-teal/20 border-brand-teal-bright text-brand-teal-bright font-semibold shadow-lg shadow-brand-teal/10'
                      : 'bg-white/[0.02] border-white/[0.08] text-text-secondary hover:text-text-primary hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex flex-col text-left">
                    <span className="font-semibold text-text-primary">{lang.label}</span>
                    <span className={`text-[11px] text-text-muted ${lang.code === 'ur' ? 'font-urdu' : ''}`}>
                      {lang.nativeLabel}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="material-symbols-outlined text-[16px] text-brand-teal-bright">
                      check
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Audio & Voice Preferences */}
        <div className="space-y-4 pt-2 border-t border-white/[0.06]">
          <label className="text-xs font-mono uppercase tracking-widest text-text-secondary block">
            Voice & Audio Preferences
          </label>

          {/* Autoplay Toggle */}
          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <span className="text-sm font-sans text-text-primary block">Auto-Play Voice Verdicts</span>
              <span className="text-xs text-text-muted">Automatically speak verified answers on arrival.</span>
            </div>
            <button
              onClick={() => onUpdateSettings({ autoPlayAudio: !settings.autoPlayAudio })}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.autoPlayAudio ? 'bg-brand-teal-bright' : 'bg-white/[0.1]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.autoPlayAudio ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Strict Authority Only */}
          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <span className="text-sm font-sans text-text-primary block">Strict Institutional Sources Only</span>
              <span className="text-xs text-text-muted">Filter strictly to WHO, NASA, CDC, WMO, NDMA.</span>
            </div>
            <button
              onClick={() => onUpdateSettings({ strictPrimaryAuthorityOnly: !settings.strictPrimaryAuthorityOnly })}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.strictPrimaryAuthorityOnly ? 'bg-brand-teal-bright' : 'bg-white/[0.1]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.strictPrimaryAuthorityOnly ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 3. Backend Endpoint Setting */}
        <div className="space-y-2 pt-2 border-t border-white/[0.06]">
          <label className="text-xs font-mono uppercase tracking-widest text-text-secondary block">
            Backend Server Endpoint (Optional)
          </label>
          <p className="text-xs text-text-muted">
            Connect to your live Render backend or local instance (e.g. <code className="text-brand-teal-bright font-mono">http://localhost:3000</code>).
          </p>
          <input
            type="text"
            value={backendUrl}
            onChange={(e) => setBackendUrl(e.target.value)}
            placeholder="e.g. http://localhost:3000 or https://your-backend.onrender.com"
            className="w-full bg-white/[0.04] border border-white/[0.1] focus:border-brand-teal-bright rounded-xl px-3.5 py-2.5 text-xs font-mono text-text-primary focus:outline-none placeholder:text-text-muted"
          />
        </div>

        {/* 4. Session & Privacy */}
        <div className="space-y-3 pt-2 border-t border-white/[0.06]">
          <label className="text-xs font-mono uppercase tracking-widest text-text-secondary block">
            Privacy & Conversation History
          </label>
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">Clear active query cache and verification transcripts.</span>
            {onClearHistory && (
              <button
                onClick={() => {
                  onClearHistory();
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg bg-verdict-false/10 hover:bg-verdict-false/20 text-verdict-false text-xs font-mono border border-verdict-false/30 transition-tactile"
              >
                Clear History
              </button>
            )}
          </div>
        </div>

        {/* Footer Done Button */}
        <div className="pt-4 border-t border-white/[0.08] flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-brand-teal hover:bg-brand-teal-dim text-white font-mono text-xs uppercase tracking-wider font-semibold transition-tactile"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
