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
    { label: 'WHO.INT', authority: 'World Health Organization', x: 0, y: 0, z: 0, baseAngle: 0, radius: 240, speed: 0.005, color: '#7ED4D6' },
    { label: 'CDC.GOV', authority: 'Centers for Disease Control', x: 0, y: 0, z: 0, baseAngle: (Math.PI * 2) / 5, radius: 270, speed: 0.0045, color: '#7ED4D6' },
    { label: 'NASA.GOV', authority: 'Atmospheric Earth Observation', x: 0, y: 0, z: 0, baseAngle: (Math.PI * 4) / 5, radius: 290, speed: 0.0055, color: '#B6C7EB' },
    { label: 'WMO.INT', authority: 'World Meteorological Org', x: 0, y: 0, z: 0, baseAngle: (Math.PI * 6) / 5, radius: 250, speed: 0.006, color: '#B6C7EB' },
    { label: 'NDMA.GOV.PK', authority: 'National Disaster Management', x: 0, y: 0, z: 0, baseAngle: (Math.PI * 8) / 5, radius: 260, speed: 0.004, color: '#10B981' },
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
      mouseRef.current.targetX = x * 0.35;
      mouseRef.current.targetY = y * 0.35;
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
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.06;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.06;

      const cx = w / 2;
      const cy = h / 2;
      const fov = 480;
      const cameraZ = 240;

      time += 1;

      // 1. Draw 3D Perspective Orbital Planetary Rings
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.ellipse(cx, cy, 270, 115, mouseRef.current.x * 0.15, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(126, 212, 214, 0.12)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.ellipse(cx, cy, 210, 85, mouseRef.current.x * 0.15, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // 2. Project Orbiting Nodes in 3D Space
      const projectedNodes = nodesRef.current.map((node) => {
        const angle = node.baseAngle + time * node.speed;
        const rawX = Math.cos(angle) * node.radius;
        const rawZ = Math.sin(angle) * node.radius;
        const rawY = Math.sin(angle * 2 + time * 0.015) * 35;

        // Mouse rotation matrix
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

      // Sort by depth (Z-buffer)
      projectedNodes.sort((a, b) => b.zDepth - a.zDepth);

      // 3. Draw Connecting Convergence Energy Beams
      projectedNodes.forEach((node) => {
        const beamGradient = ctx.createLinearGradient(cx, cy, node.projX, node.projY);
        beamGradient.addColorStop(0, 'rgba(126, 212, 214, 0.45)');
        beamGradient.addColorStop(0.7, 'rgba(126, 212, 214, 0.15)');
        beamGradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');

        ctx.strokeStyle = beamGradient;
        ctx.lineWidth = Math.max(1, 2 * node.projScale);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(node.projX, node.projY);
        ctx.stroke();

        // Traveling verification particle pulse along beam
        const particleT = (time * 0.02 + node.baseAngle) % 1;
        const partX = cx + (node.projX - cx) * particleT;
        const partY = cy + (node.projY - cy) * particleT;
        ctx.fillStyle = '#7ED4D6';
        ctx.beginPath();
        ctx.arc(partX, partY, 2.5 * node.projScale, 0, Math.PI * 2);
        ctx.fill();
      });

      // 4. Draw Central Sovereign Claim Anchor
      const centralPulse = Math.sin(time * 0.05) * 6;

      // Central ambient aura
      const centralAura = ctx.createRadialGradient(cx, cy, 10, cx, cy, 110 + centralPulse);
      centralAura.addColorStop(0, 'rgba(126, 212, 214, 0.35)');
      centralAura.addColorStop(0.5, 'rgba(26, 43, 72, 0.25)');
      centralAura.addColorStop(1, 'rgba(14, 14, 14, 0)');
      ctx.fillStyle = centralAura;
      ctx.beginPath();
      ctx.arc(cx, cy, 110 + centralPulse, 0, Math.PI * 2);
      ctx.fill();

      // Central core badge
      ctx.fillStyle = isVerified ? '#10B981' : '#7ED4D6';
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.fill();

      // Central Claim Label Pill
      const centerLabel = 'SPOKEN CLAIM';
      ctx.font = "600 12px 'JetBrains Mono', monospace";
      const centerW = ctx.measureText(centerLabel).width + 20;
      const centerH = 26;
      ctx.fillStyle = 'rgba(18, 20, 26, 0.92)';
      ctx.strokeStyle = 'rgba(126, 212, 214, 0.5)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(cx - centerW / 2, cy - centerH / 2 - 24, centerW, centerH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#FBF9F3';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(centerLabel, cx, cy - 24);

      // 5. Draw Prominent 3D Source Nodes with High-Contrast Badges
      projectedNodes.forEach((node) => {
        // Node Outer Glowing Ring
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.projX, node.projY, 6 * node.projScale, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(node.projX, node.projY, 10 * node.projScale, 0, Math.PI * 2);
        ctx.stroke();

        // Node Label Pill Backing (Crystal Clear High Contrast)
        const labelFont = `700 ${Math.max(12, Math.round(14 * node.projScale))}px 'JetBrains Mono', monospace`;
        ctx.font = labelFont;
        const labelW = ctx.measureText(node.label).width + 18;
        const labelH = Math.max(24, Math.round(28 * node.projScale));
        const pillY = node.projY - labelH - 10 * node.projScale;

        // Frosted glass background pill
        ctx.fillStyle = 'rgba(14, 16, 22, 0.94)';
        ctx.strokeStyle = node.color;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(node.projX - labelW / 2, pillY, labelW, labelH, 8);
        ctx.fill();
        ctx.stroke();

        // Source Name in Bold
        ctx.fillStyle = '#FBF9F3';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.label, node.projX, pillY + labelH / 2);

        // Subtitle Authority Description
        ctx.font = `500 ${Math.max(10, Math.round(11 * node.projScale))}px 'Inter', sans-serif`;
        ctx.fillStyle = 'rgba(219, 218, 212, 0.9)';
        ctx.fillText(node.authority, node.projX, node.projY + 22 * node.projScale);
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
      className={`relative w-full h-[520px] sm:h-[580px] md:h-[640px] flex items-center justify-center select-none overflow-hidden ${className}`}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Floating Header Pill */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-surface-elevated/95 border border-white/[0.12] backdrop-blur-xl px-5 py-2 rounded-full shadow-2xl flex items-center gap-2.5 pointer-events-none">
        <span className="w-2.5 h-2.5 rounded-full bg-brand-teal-bright animate-pulse" />
        <span className="font-mono text-xs uppercase tracking-widest text-text-primary font-semibold">
          3D Multi-Source Evidence Convergence System
        </span>
      </div>

      {/* Grounding Status Footer */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center pointer-events-none max-w-lg px-6 py-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/[0.06]">
        <span className="font-editorial text-sm sm:text-base text-text-primary italic">
          {claimText}
        </span>
        <span className="block font-mono text-[11px] uppercase tracking-wider text-brand-teal-bright mt-1">
          Primary Institutional Consensus Orbiting in Real-Time
        </span>
      </div>
    </div>
  );
};
