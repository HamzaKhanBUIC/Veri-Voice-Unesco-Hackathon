import React, { useState, useRef, useEffect } from 'react';
import { LanguageOption } from '../../types';

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', dir: 'ltr', voice: 'en-US-AvaNeural' },
  { code: 'ur', label: 'Urdu', nativeLabel: 'اردو', dir: 'rtl', voice: 'ur-PK-UzmaNeural' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español', dir: 'ltr', voice: 'es-ES-ElviraNeural' },
  { code: 'id', label: 'Indonesian', nativeLabel: 'Bahasa Indonesia', dir: 'ltr', voice: 'id-ID-GadisNeural' },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية', dir: 'rtl', voice: 'ar-SA-ZariyahNeural' },
];

interface LanguageSelectorProps {
  currentLanguage: string;
  onLanguageChange: (code: string) => void;
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onLanguageChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeLang = SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container/80 hover:bg-surface-container border border-border-subtle hover:border-border-variant text-text-secondary hover:text-text-primary text-xs font-mono transition-all backdrop-blur-md shadow-sm"
        aria-expanded={isOpen}
        aria-label="Select Language"
      >
        <span className="material-symbols-outlined text-[16px] text-brand-teal-bright">language</span>
        <span className="uppercase font-semibold tracking-wider">{activeLang.code}</span>
        <span className={`material-symbols-outlined text-[14px] text-text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-surface-elevated/95 border border-white/10 shadow-2xl backdrop-blur-xl z-50 py-2 animate-fade-up">
          <div className="px-3.5 py-1.5 border-b border-border-subtle mb-1 flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted">
              Select Language
            </span>
            <span className="text-[10px] font-mono text-brand-teal-bright">5 Active</span>
          </div>
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = lang.code === currentLanguage;
            return (
              <button
                key={lang.code}
                onClick={() => {
                  onLanguageChange(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'text-brand-teal-bright bg-brand-teal/10 font-semibold'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-container/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-[11px] uppercase opacity-70 w-5 font-bold">{lang.code}</span>
                  <span>{lang.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-text-muted text-[11px] font-urdu">{lang.nativeLabel}</span>
                  {isSelected && (
                    <span className="material-symbols-outlined text-[14px] text-brand-teal-bright">check</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
