import React, { useEffect, useRef } from 'react';
import { VoiceState } from '../../types';

interface AcousticCoreProps {
  state: VoiceState;
  volumeLevel?: number; // 0.0 to 1.0 from microphone
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}

export const AcousticCore: React.FC<AcousticCoreProps> = ({
  state = 'IDLE',
  volumeLevel = 0,
  size = 'lg',
  onClick,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const dimensions = {
    sm: 140,
    md: 220,
    lg: 320,
  }[size];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Outer Glow & Base Radius
      const baseRadius = (w * 0.28);
      const dynamicBoost = volumeLevel * 35;
      const radius = baseRadius + (state === 'LISTENING' ? dynamicBoost : Math.sin(time * 0.03) * 3);

      // Core Background Radial Gradient
      const gradient = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius * 1.5);

      if (state === 'LISTENING') {
        gradient.addColorStop(0, 'rgba(126, 212, 214, 0.45)');
        gradient.addColorStop(0.6, 'rgba(46, 90, 90, 0.25)');
        gradient.addColorStop(1, 'rgba(14, 14, 14, 0)');
      } else if (state === 'CHECKING' || state === 'PROCESSING') {
        gradient.addColorStop(0, 'rgba(182, 199, 235, 0.4)');
        gradient.addColorStop(0.6, 'rgba(26, 43, 72, 0.3)');
        gradient.addColorStop(1, 'rgba(14, 14, 14, 0)');
      } else if (state === 'RESPONDING') {
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
        gradient.addColorStop(0.6, 'rgba(46, 90, 90, 0.2)');
        gradient.addColorStop(1, 'rgba(14, 14, 14, 0)');
      } else {
        // IDLE
        gradient.addColorStop(0, 'rgba(46, 90, 90, 0.25)');
        gradient.addColorStop(0.7, 'rgba(26, 43, 72, 0.15)');
        gradient.addColorStop(1, 'rgba(14, 14, 14, 0)');
      }

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Draw Inner Harmonic Waveform Rings
      const ringCount = state === 'LISTENING' ? 4 : 3;
      for (let r = 0; r < ringCount; r++) {
        const ringRadius = radius * (0.6 + r * 0.22) + (state === 'LISTENING' ? Math.sin(time * 0.1 + r) * dynamicBoost * 0.4 : 0);
        ctx.beginPath();
        ctx.strokeStyle = state === 'LISTENING'
          ? `rgba(126, 212, 214, ${0.7 - r * 0.15})`
          : state === 'RESPONDING'
          ? `rgba(16, 185, 129, ${0.6 - r * 0.15})`
          : state === 'CHECKING'
          ? `rgba(182, 199, 235, ${0.5 - r * 0.12})`
          : `rgba(126, 212, 214, ${0.25 - r * 0.06})`;
        ctx.lineWidth = r === 0 ? 2.5 : 1.2;

        if (state === 'CHECKING' || state === 'PROCESSING') {
          // Orbiting dashed technical ring
          ctx.setLineDash([8, 12]);
          ctx.arc(cx, cy, ringRadius, time * 0.05 + r, time * 0.05 + r + Math.PI * 1.6);
        } else {
          ctx.setLineDash([]);
          ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
        }
        ctx.stroke();
      }

      // Draw Central Acoustic Crest Silhouette (Matching master VeriVoice logo geometry)
      ctx.beginPath();
      ctx.setLineDash([]);
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = state === 'LISTENING' ? '#7ED4D6' : state === 'RESPONDING' ? '#10B981' : '#FBF9F3';

      const scale = size === 'lg' ? 0.9 : size === 'md' ? 0.65 : 0.45;
      const waveOffset = Math.sin(time * 0.08) * (state === 'LISTENING' ? 6 : 2);

      ctx.moveTo(cx - 36 * scale, cy + 2 * scale);
      ctx.bezierCurveTo(
        cx - 24 * scale, cy - 24 * scale - waveOffset,
        cx - 14 * scale, cy - 24 * scale - waveOffset,
        cx - 6 * scale, cy + 24 * scale + waveOffset
      );
      ctx.bezierCurveTo(
        cx + 2 * scale, cy + 24 * scale + waveOffset,
        cx + 12 * scale, cy - 10 * scale,
        cx + 20 * scale, cy - 10 * scale
      );
      ctx.bezierCurveTo(
        cx + 26 * scale, cy - 10 * scale,
        cx + 34 * scale, cy - 28 * scale,
        cx + 42 * scale, cy - 28 * scale
      );
      ctx.stroke();

      time++;
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [state, volumeLevel, size]);

  return (
    <div
      onClick={onClick}
      className={`relative flex items-center justify-center select-none cursor-pointer transition-transform duration-300 active:scale-95 ${className}`}
      style={{ width: dimensions, height: dimensions }}
      role="button"
      tabIndex={0}
      aria-label={`VeriVoice Acoustic Core: Current state ${state}`}
    >
      <canvas
        ref={canvasRef}
        width={dimensions * 2}
        height={dimensions * 2}
        style={{ width: dimensions, height: dimensions }}
        className="block pointer-events-none"
      />

      {/* Floating State Badge Below Core */}
      <div className="absolute -bottom-2 bg-surface-container-high/90 border border-border-subtle backdrop-blur px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-widest text-text-secondary shadow-lg flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${
            state === 'LISTENING'
              ? 'bg-brand-teal-bright animate-ping'
              : state === 'CHECKING' || state === 'PROCESSING'
              ? 'bg-brand-navy-light animate-spin'
              : state === 'RESPONDING'
              ? 'bg-verdict-true'
              : 'bg-border-variant'
          }`}
        />
        <span>{state}</span>
      </div>
    </div>
  );
};
