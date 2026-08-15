import React, { useState } from 'react';
import { VeriVoiceLogo } from '../brand/VeriVoiceLogo';
import { LanguageSelector } from './LanguageSelector';
import { StatusIndicator } from '../ui/StatusIndicator';
import { AppView } from '../../types';

interface TopNavBarProps {
  activeView: AppView;
  onViewChange: (view: AppView) => void;
  currentLanguage: string;
  onLanguageChange: (code: string) => void;
  systemStatus?: 'online' | 'checking' | 'warning' | 'offline';
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  activeView,
  onViewChange,
  currentLanguage,
  onLanguageChange,
  systemStatus = 'online',
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { label: string; view: AppView; icon: string }[] = [
    { label: 'Overview', view: 'landing', icon: 'home' },
    { label: 'Talk (Voice)', view: 'talk', icon: 'graphic_eq' },
    { label: 'Chat & Evidence', view: 'chat', icon: 'search' },
    { label: 'Methodology', view: 'methodology', icon: 'shield' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-nav h-16 transition-all duration-300">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 h-full flex items-center justify-between">
        {/* Left: Brand Logo */}
        <div
          onClick={() => onViewChange('landing')}
          className="cursor-pointer flex items-center gap-3"
        >
          <VeriVoiceLogo size="md" />
        </div>

        {/* Center: Desktop Navigation Tabs (Stitch C3) */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 h-full">
          {navItems.map((item) => {
            const isActive = activeView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => onViewChange(item.view)}
                className={`font-mono text-xs uppercase tracking-wider py-1.5 border-b-2 transition-tactile flex items-center gap-1.5 ${
                  isActive
                    ? 'text-text-primary border-brand-teal-bright font-semibold'
                    : 'text-text-secondary hover:text-text-primary border-transparent'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[16px] ${
                    isActive ? 'text-brand-teal-bright' : 'text-text-muted'
                  }`}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Actions, Language & Status */}
        <div className="flex items-center gap-3 md:gap-4">
          <div className="hidden sm:block">
            <StatusIndicator status={systemStatus} />
          </div>

          <LanguageSelector
            currentLanguage={currentLanguage}
            onLanguageChange={onLanguageChange}
          />

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-text-secondary hover:text-text-primary rounded bg-surface-container border border-border-subtle"
            aria-label="Toggle navigation menu"
          >
            <span className="material-symbols-outlined text-[20px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface-elevated border-b border-border-subtle px-4 py-4 flex flex-col gap-2 shadow-2xl animate-fade-up">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => {
                onViewChange(item.view);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded text-sm font-mono uppercase flex items-center gap-3 ${
                activeView === item.view
                  ? 'bg-surface-container text-brand-teal-bright font-semibold border-l-2 border-brand-teal-bright'
                  : 'text-text-secondary hover:bg-surface-container/50'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
          <div className="pt-2 mt-2 border-t border-border-subtle flex justify-between items-center px-2">
            <span className="text-[11px] font-mono text-text-muted uppercase">Status:</span>
            <StatusIndicator status={systemStatus} />
          </div>
        </div>
      )}
    </header>
  );
};
