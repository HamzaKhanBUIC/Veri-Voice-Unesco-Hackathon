import React, { useState, useRef, useEffect } from 'react';
import { LanguageOption } from '../../types';

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', dir: 'ltr', voice: 'en-US-AvaNeural' },
  { code: 'ur', label: 'Urdu', nativeLabel: 'اردو', dir: 'rtl', voice: 'ur-PK-UzmaNeural' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español', dir: 'ltr', voice: 'es-ES-ElviraNeural' },
  { code: 'id', label: 'Indonesian', nativeLabel: 'Bahasa Indonesia', dir: 'ltr', voice: 'id-ID-GadisNeural' },
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
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-surface-container hover:bg-surface-container-high border border-border-subtle hover:border-border-variant text-text-secondary hover:text-text-primary text-xs font-mono transition-tactile"
        aria-expanded={isOpen}
        aria-label="Select Language"
      >
        <span className="material-symbols-outlined text-[16px] text-brand-teal-bright">language</span>
        <span className="uppercase font-semibold">{activeLang.code}</span>
        <span className="material-symbols-outlined text-[14px] text-text-muted">expand_more</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg bg-surface-elevated border border-border-subtle shadow-xl z-50 py-1.5 animate-fade-up">
          <div className="px-3 py-1.5 border-b border-border-subtle mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted">
              Select Language
            </span>
          </div>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                onLanguageChange(lang.code);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-surface-container transition-colors ${
                lang.code === currentLanguage
                  ? 'text-brand-teal-bright bg-surface-container/50 font-medium'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] uppercase opacity-60 w-5">{lang.code}</span>
                <span>{lang.label}</span>
              </div>
              <span className="text-text-muted text-[11px] font-urdu">{lang.nativeLabel}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
