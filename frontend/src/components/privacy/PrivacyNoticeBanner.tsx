import React, { useState, useEffect } from 'react';
import { AppView } from '../../types';

interface PrivacyNoticeBannerProps {
  onNavigate: (view: AppView) => void;
}

export const PrivacyNoticeBanner: React.FC<PrivacyNoticeBannerProps> = ({ onNavigate }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const acknowledged = localStorage.getItem('verivoice_privacy_ack');
      if (!acknowledged) {
        setIsVisible(true);
      }
    } catch {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    try {
      localStorage.setItem('verivoice_privacy_ack', 'true');
    } catch {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      role="region"
      aria-label="Privacy notice"
      className="fixed bottom-3 left-3 right-3 sm:left-6 sm:right-auto sm:max-w-md z-40 p-4 bg-surface-elevated/95 backdrop-blur-md border border-border-subtle rounded-2xl shadow-2xl animate-fade-up text-left"
    >
      <div className="flex items-start gap-3">
        <span className="material-symbols-outlined text-brand-teal-bright text-[20px] mt-0.5 shrink-0" aria-hidden="true">
          shield_lock
        </span>
        <div className="space-y-2 text-xs">
          <p className="text-text-primary font-sans leading-relaxed">
            <strong>Privacy Notice:</strong> VeriVoice processes voice and text inputs in real time for verification and speech synthesis with <span className="text-brand-teal-bright">zero permanent audio retention</span>. Requests are processed with external AI providers (Groq, ElevenLabs).
          </p>
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleDismiss}
              className="px-3.5 py-1.5 bg-brand-teal-bright text-surface-base font-medium rounded-lg text-xs hover:bg-brand-teal transition-colors shadow-sm"
            >
              Got it
            </button>
            <button
              onClick={() => {
                onNavigate('privacy');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-text-secondary hover:text-brand-teal-bright font-mono text-[11px] underline underline-offset-2 transition-colors"
            >
              Privacy Policy
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
