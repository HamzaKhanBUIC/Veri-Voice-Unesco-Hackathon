import React from 'react';

interface VeriVoiceLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
}

export const VeriVoiceLogo: React.FC<VeriVoiceLogoProps> = ({
  className = '',
  size = 'md',
  showWordmark = true,
}) => {
  const iconDimensions = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
  }[size];

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Master Acoustic Crest SVG */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${iconDimensions} flex-shrink-0 transition-transform duration-200 hover:scale-105`}
        aria-label="VeriVoice Master Acoustic Crest Logo"
      >
        <defs>
          <linearGradient id="vvLogoGradient" x1="10%" y1="60%" x2="95%" y2="20%">
            <stop offset="0%" stopColor="#1A2B48" />
            <stop offset="55%" stopColor="#1A2B48" />
            <stop offset="68%" stopColor="#2E5A5A" />
            <stop offset="100%" stopColor="#7ED4D6" />
          </linearGradient>
          <filter id="subtleGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#7ED4D6" floodOpacity="0.25" />
          </filter>
        </defs>
        {/* Continuous Harmonic Acoustic Wave + Verification Checkmark */}
        <path
          d="M 12 52 C 18 52, 22 45, 25 32 C 28 18, 33 18, 36 32 C 39 48, 44 82, 50 82 C 55 82, 60 48, 64 48 C 68 48, 72 74, 76 74 C 80 74, 85 45, 92 30"
          stroke="url(#vvLogoGradient)"
          strokeWidth="10.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#subtleGlow)"
        />
      </svg>

      {showWordmark && (
        <span className={`font-editorial font-semibold tracking-tight text-text-primary ${textSizes}`}>
          Veri<span className="text-brand-teal-bright font-normal">Voice</span>
        </span>
      )}
    </div>
  );
};
