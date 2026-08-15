import React, { useEffect, useRef } from 'react';

interface Node3D {
  label: string;
  authority: string;
  x: number;
  y: number;
  z: number;
  baseAngle: number;
  radius: number;
  speed: number;
  color: string;
}

interface EvidenceConstellation3DProps {
  claimText?: string;
  isVerified?: boolean;
  className?: string;
}

export const EvidenceConstellation3D: React.FC<EvidenceConstellation3DProps> = ({
  claimText = '“Are polio drops safe for infants?”',
  isVerified = true,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; targetX: number; targetY: number }>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
  });

  const nodesRef = useRef<Node3D[]>([
    { label: 'WHO.INT', authority: 'Global Health Guidelines', x: 0, y: 0, z: 0, baseAngle: 0, radius: 140, speed: 0.008, color: '#7ED4D6' },
    { label: 'CDC.GOV', authority: 'Vaccine Safety Monitoring', x: 0, y: 0, z: 0, baseAngle: (Math.PI * 2) / 5, radius: 155, speed: 0.006, color: '#7ED4D6' },
    { label: 'NASA.GOV', authority: 'Atmospheric Observations', x: 0, y: 0, z: 0, baseAngle: (Math.PI * 4) / 5, radius: 165, speed: 0.007, color: '#B6C7EB' },
    { label: 'WMO.INT', authority: 'Climate & Weather Consensus', x: 0, y: 0, z: 0, baseAngle: (Math.PI * 6) / 5, radius: 145, speed: 0.009, color: '#B6C7EB' },
    { label: 'NDMA.GOV.PK', authority: 'National Disaster Authority', x: 0, y: 0, z: 0, baseAngle: (Math.PI * 8) / 5, radius: 150, speed: 0.005, color: '#10B981' },
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      mouseRef.current.targetX = x * 0.4;
      mouseRef.current.targetY = y * 0.4;
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
    }

    const render = () => {
      const dpr = window.devicePixelRatio || 2;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      // Smooth mouse parallax interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      const cx = w / 2;
      const cy = h / 2;
      const fov = 320;
      const cameraZ = 280;

      time += 1;

      // Draw subtle background depth orbit rings in 3D perspective
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 20, 160, 55, mouseRef.current.x * 0.2, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(126, 212, 214, 0.06)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 20, 120, 40, mouseRef.current.x * 0.2, 0, Math.PI * 2);
      ctx.stroke();

      // Calculate 3D positions for orbiting nodes
      const projectedNodes = nodesRef.current.map((node) => {
        const angle = node.baseAngle + time * node.speed;
        const rawX = Math.cos(angle) * node.radius;
        const rawZ = Math.sin(angle) * node.radius;
        const rawY = Math.sin(angle * 2 + time * 0.02) * 20;

        // Apply mouse tilt
        const rotY = rawX * Math.cos(mouseRef.current.x) - rawZ * Math.sin(mouseRef.current.x);
        const rotZ = rawX * Math.sin(mouseRef.current.x) + rawZ * Math.cos(mouseRef.current.x);
        const rotX = rotY;
        const rotFinalY = rawY * Math.cos(mouseRef.current.y) - rotZ * Math.sin(mouseRef.current.y);
        const finalZ = rawY * Math.sin(mouseRef.current.y) + rotZ * Math.cos(mouseRef.current.y) + cameraZ;

        const scale = fov / (fov + finalZ);
        const projX = cx + rotX * scale;
        const projY = cy + rotFinalY * scale;

        return {
          ...node,
          projX,
          projY,
          projScale: scale,
          zDepth: finalZ,
        };
      });

      // Sort by depth (Z-index painting)
      projectedNodes.sort((a, b) => b.zDepth - a.zDepth);

      // Draw Central Claim Node (Anchor)
      const centralScale = fov / (fov + cameraZ);
      const centralPulse = Math.sin(time * 0.04) * 3;

      // Central ambient glow
      const centralGlow = ctx.createRadialGradient(cx, cy, 5, cx, cy, 70 + centralPulse);
      centralGlow.addColorStop(0, 'rgba(126, 212, 214, 0.25)');
      centralGlow.addColorStop(0.6, 'rgba(26, 43, 72, 0.15)');
      centralGlow.addColorStop(1, 'rgba(14, 14, 14, 0)');
      ctx.fillStyle = centralGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, 70 + centralPulse, 0, Math.PI * 2);
      ctx.fill();

      // Central core dot
      ctx.fillStyle = isVerified ? '#7ED4D6' : '#EF4444';
      ctx.beginPath();
      ctx.arc(cx, cy, 6 * centralScale, 0, Math.PI * 2);
      ctx.fill();

      // Draw Connecting Convergence Lines & Nodes
      projectedNodes.forEach((node) => {
        // Line from central claim to source node
        const lineGradient = ctx.createLinearGradient(cx, cy, node.projX, node.projY);
        lineGradient.addColorStop(0, 'rgba(126, 212, 214, 0.35)');
        lineGradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');

        ctx.strokeStyle = lineGradient;
        ctx.lineWidth = Math.max(0.8, 1.5 * node.projScale);
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(node.projX, node.projY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Node Glow & Core
        const nodeRadius = 5 * node.projScale;
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.projX, node.projY, nodeRadius, 0, Math.PI * 2);
        ctx.fill();

        // Node Label Typography in 3D Space
        const alpha = Math.min(1, Math.max(0.3, node.projScale * 1.2));
        ctx.fillStyle = `rgba(251, 249, 243, ${alpha})`;
        ctx.font = `600 ${Math.round(11 * node.projScale)}px 'JetBrains Mono', monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.projX, node.projY - 12 * node.projScale);

        // Subtitle Authority
        ctx.fillStyle = `rgba(143, 144, 152, ${alpha * 0.8})`;
        ctx.font = `400 ${Math.round(9 * node.projScale)}px 'Inter', sans-serif`;
        ctx.fillText(node.authority, node.projX, node.projY + 16 * node.projScale);
      });

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [isVerified]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[320px] sm:h-[380px] flex items-center justify-center select-none overflow-hidden ${className}`}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Floating Center Claim Pill */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-surface-elevated/90 border border-white/[0.08] backdrop-blur-md px-4 py-1.5 rounded-full shadow-xl flex items-center gap-2 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-brand-teal-bright animate-pulse" />
        <span className="font-mono text-[11px] uppercase tracking-widest text-text-secondary">
          Evidence Convergence System
        </span>
      </div>

      {/* Grounding Status */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center pointer-events-none max-w-sm px-4">
        <span className="font-editorial text-xs sm:text-sm text-text-muted italic">
          {claimText} — Authoritative sources converge to substantiate or refute spoken claims.
        </span>
      </div>
    </div>
  );
};
