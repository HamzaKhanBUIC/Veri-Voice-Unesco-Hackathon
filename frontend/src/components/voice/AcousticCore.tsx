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

  // Animated interpolators for buttery transitions
  const currentColorsRef = useRef<{
    glowR: number;
    glowG: number;
    glowB: number;
    crestR: number;
    crestG: number;
    crestB: number;
    smoothRadius: number;
  }>({
    glowR: 46,
    glowG: 90,
    glowB: 90,
    crestR: 251,
    crestG: 249,
    crestB: 243,
    smoothRadius: 0,
  });

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

    // Retina High-DPI scaling
    const dpr = window.devicePixelRatio || 2;
    canvas.width = dimensions * dpr;
    canvas.height = dimensions * dpr;
    ctx.scale(dpr, dpr);

    let time = 0;

    const render = () => {
      const w = dimensions;
      const h = dimensions;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Target color states
      let targetGlow: [number, number, number] = [46, 90, 90]; // IDLE
      let targetCrest: [number, number, number] = [251, 249, 243]; // Neutral cream

      if (state === 'LISTENING') {
        targetGlow = [126, 212, 214]; // Brand teal bright
        targetCrest = [126, 212, 214];
      } else if (state === 'CHECKING' || state === 'PROCESSING') {
        targetGlow = [182, 199, 235]; // Brand navy light
        targetCrest = [182, 199, 235];
      } else if (state === 'RESPONDING') {
        targetGlow = [16, 185, 129]; // Verdict true green
        targetCrest = [16, 185, 129];
      }

      // Smooth lerp towards target colors (Apple-grade fluid motion)
      const c = currentColorsRef.current;
      c.glowR += (targetGlow[0] - c.glowR) * 0.08;
      c.glowG += (targetGlow[1] - c.glowG) * 0.08;
      c.glowB += (targetGlow[2] - c.glowB) * 0.08;

      c.crestR += (targetCrest[0] - c.crestR) * 0.08;
      c.crestG += (targetCrest[1] - c.crestG) * 0.08;
      c.crestB += (targetCrest[2] - c.crestB) * 0.08;

      // Base Radius and Dynamic Microphone Boost
      const baseRadius = w * 0.28;
      const targetBoost = state === 'LISTENING' ? volumeLevel * 28 : Math.sin(time * 0.035) * 3;
      c.smoothRadius += (targetBoost - c.smoothRadius) * 0.15;
      const radius = baseRadius + c.smoothRadius;

      // Core Background Radial Gradient
      const gradient = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius * 1.45);
      const alphaGlow = state === 'LISTENING' ? 0.35 : state === 'RESPONDING' ? 0.3 : 0.18;
      gradient.addColorStop(0, `rgba(${Math.round(c.glowR)}, ${Math.round(c.glowG)}, ${Math.round(c.glowB)}, ${alphaGlow})`);
      gradient.addColorStop(0.65, `rgba(${Math.round(c.glowR * 0.5)}, ${Math.round(c.glowG * 0.5)}, ${Math.round(c.glowB * 0.5)}, ${alphaGlow * 0.4})`);
      gradient.addColorStop(1, 'rgba(14, 14, 14, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.45, 0, Math.PI * 2);
      ctx.fill();

      // Draw Inner Harmonic Waveform Rings
      const ringCount = state === 'LISTENING' ? 4 : 3;
      for (let r = 0; r < ringCount; r++) {
        const ringRadius = radius * (0.6 + r * 0.22) + (state === 'LISTENING' ? Math.sin(time * 0.08 + r) * c.smoothRadius * 0.35 : 0);
        ctx.beginPath();
        const ringAlpha = state === 'LISTENING' ? 0.65 - r * 0.14 : state === 'RESPONDING' ? 0.55 - r * 0.14 : 0.22 - r * 0.06;
        ctx.strokeStyle = `rgba(${Math.round(c.glowR)}, ${Math.round(c.glowG)}, ${Math.round(c.glowB)}, ${Math.max(0.04, ringAlpha)})`;
        ctx.lineWidth = r === 0 ? 2 : 1;

        if (state === 'CHECKING' || state === 'PROCESSING') {
          // Orbiting technical dashed ring
          ctx.setLineDash([6, 10]);
          ctx.arc(cx, cy, ringRadius, time * 0.04 + r, time * 0.04 + r + Math.PI * 1.6);
        } else {
          ctx.setLineDash([]);
          ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
        }
        ctx.stroke();
      }

      // Draw Central Acoustic Crest Silhouette (VeriVoice signature wave)
      ctx.beginPath();
      ctx.setLineDash([]);
      ctx.lineWidth = size === 'lg' ? 3.5 : 2.5;
      ctx.strokeStyle = `rgb(${Math.round(c.crestR)}, ${Math.round(c.crestG)}, ${Math.round(c.crestB)})`;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const scale = size === 'lg' ? 0.9 : size === 'md' ? 0.65 : 0.45;
      const waveOffset = Math.sin(time * 0.07) * (state === 'LISTENING' ? 5 : 1.5);

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
  }, [state, volumeLevel, size, dimensions]);

  return (
    <div
      onClick={onClick}
      className={`relative flex items-center justify-center select-none cursor-pointer transition-tactile ${className}`}
      style={{ width: dimensions, height: dimensions }}
      role="button"
      tabIndex={0}
      aria-label={`VeriVoice Acoustic Core: ${state}`}
    >
      <canvas
        ref={canvasRef}
        style={{ width: dimensions, height: dimensions }}
        className="block pointer-events-none"
      />

      {/* Floating State Badge Below Core */}
      <div
        className="absolute -bottom-2 bg-surface-elevated/90 border border-border-subtle backdrop-blur-md px-3.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest text-text-secondary shadow-lg flex items-center gap-2 transition-all duration-200"
        aria-live="polite"
      >
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
