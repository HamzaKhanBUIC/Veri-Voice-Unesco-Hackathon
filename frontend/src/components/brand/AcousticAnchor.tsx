import React from 'react';

interface AcousticAnchorProps {
  className?: string;
  size?: number;
  pulse?: boolean;
}

/**
 * VeriVoice Signature Acoustic Anchor Motif.
 * Derived from the intersection of harmonic sound waves and verification checkmark.
 * Used strictly for verification resolution, grounding confirmation, and active section anchors.
 */
export const AcousticAnchor: React.FC<AcousticAnchorProps> = ({
  className = '',
  size = 14,
  pulse = false,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block flex-shrink-0 ${pulse ? 'animate-pulse text-brand-teal-bright' : 'text-brand-teal-bright'} ${className}`}
      aria-hidden="true"
    >
      <path
        d="M12 2L14.2 9.8L22 12L14.2 14.2L12 22L9.8 14.2L2 12L9.8 9.8L12 2Z"
        fill="currentColor"
      />
    </svg>
  );
};
