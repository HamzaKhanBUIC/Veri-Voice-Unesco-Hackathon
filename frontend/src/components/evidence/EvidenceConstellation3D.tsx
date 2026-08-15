import React, { useEffect, useRef, useState, useMemo } from 'react';
import { EvidenceItem } from '../../types';

interface Node3D {
  id: string;
  label: string;
  authority: string;
  domain: string;
  url: string;
  category: 'UN' | 'SCIENCE' | 'FACTCHECK' | 'REGIONAL';
  authorityLevel: string;
  baseAngle: number;
  orbitRadius: number;
  orbitInclination: number;
  speed: number;
  color: string;
}

interface EvidenceConstellation3DProps {
  claimText?: string;
  isVerified?: boolean;
  evidence?: EvidenceItem[];
  className?: string;
}

const GLOBAL_TRUST_CATALOG: Omit<Node3D, 'baseAngle' | 'orbitRadius' | 'orbitInclination' | 'speed'>[] = [
  // UN & Global Institutional
  { id: 'unesco', label: 'UNESCO.ORG', authority: 'Media & Information Literacy', domain: 'unesco.org', url: 'https://unesco.org', category: 'UN', authorityLevel: 'PRIMARY_INSTITUTIONAL', color: '#7ED4D6' },
  { id: 'who', label: 'WHO.INT', authority: 'World Health Organization', domain: 'who.int', url: 'https://who.int', category: 'UN', authorityLevel: 'PRIMARY_INSTITUTIONAL', color: '#38BDF8' },
  { id: 'ipcc', label: 'IPCC.CH', authority: 'UN Climate Science Panel', domain: 'ipcc.ch', url: 'https://ipcc.ch', category: 'UN', authorityLevel: 'PRIMARY_INSTITUTIONAL', color: '#34D399' },
  { id: 'wmo', label: 'WMO.INT', authority: 'World Meteorological Org', domain: 'wmo.int', url: 'https://wmo.int', category: 'UN', authorityLevel: 'PRIMARY_INSTITUTIONAL', color: '#67E8F9' },
  { id: 'unicef', label: 'UNICEF.ORG', authority: 'Child Immunization & Health', domain: 'unicef.org', url: 'https://unicef.org', category: 'UN', authorityLevel: 'PRIMARY_INSTITUTIONAL', color: '#60A5FA' },

  // Space & Primary Science
  { id: 'nasa', label: 'NASA.GOV', authority: 'Planetary & Climate Telemetry', domain: 'nasa.gov', url: 'https://climate.nasa.gov', category: 'SCIENCE', authorityLevel: 'PRIMARY_SCIENTIFIC_DATA', color: '#38BDF8' },
  { id: 'noaa', label: 'NOAA.GOV', authority: 'Oceanic & Atmospheric Telemetry', domain: 'noaa.gov', url: 'https://noaa.gov', category: 'SCIENCE', authorityLevel: 'PRIMARY_SCIENTIFIC_DATA', color: '#22D3EE' },
  { id: 'esa', label: 'ESA.INT', authority: 'European Space Agency', domain: 'esa.int', url: 'https://esa.int', category: 'SCIENCE', authorityLevel: 'PRIMARY_SCIENTIFIC_DATA', color: '#A78BFA' },
  { id: 'cern', label: 'CERN.CH', authority: 'European Nuclear Research', domain: 'cern.ch', url: 'https://home.cern', category: 'SCIENCE', authorityLevel: 'PRIMARY_SCIENTIFIC_DATA', color: '#F472B6' },

  // IFCN Fact-Checkers
  { id: 'reuters', label: 'REUTERS', authority: 'Global Fact Check Bureau', domain: 'reuters.com', url: 'https://reuters.com/fact-check', category: 'FACTCHECK', authorityLevel: 'FACT_CHECKING_ORGANIZATION', color: '#FBBF24' },
  { id: 'afp', label: 'AFP FACT CHECK', authority: 'Multilingual Verification', domain: 'afp.com', url: 'https://factcheck.afp.com', category: 'FACTCHECK', authorityLevel: 'FACT_CHECKING_ORGANIZATION', color: '#F59E0B' },
  { id: 'edmo', label: 'EDMO.EU', authority: 'AI & Disinformation Observatory', domain: 'edmo.eu', url: 'https://edmo.eu', category: 'FACTCHECK', authorityLevel: 'RESEARCH_NETWORK', color: '#818CF8' },
  { id: 'maldita', label: 'MALDITA.ES', authority: 'Spanish Fact-Checking', domain: 'maldita.es', url: 'https://maldita.es', category: 'FACTCHECK', authorityLevel: 'FACT_CHECKING_ORGANIZATION', color: '#FB7185' },
  { id: 'cekfakta', label: 'CEKFAKTA.COM', authority: 'Indonesian Fact Coalition', domain: 'cekfakta.com', url: 'https://cekfakta.com', category: 'FACTCHECK', authorityLevel: 'FACT_CHECKING_ORGANIZATION', color: '#E879F9' },

  // Regional Official Authorities
  { id: 'nih_pk', label: 'NIH.ORG.PK', authority: 'National Institute of Health (PK)', domain: 'nih.org.pk', url: 'https://nih.org.pk', category: 'REGIONAL', authorityLevel: 'OFFICIAL_GOVERNMENT', color: '#34D399' },
  { id: 'ndma_pk', label: 'NDMA.GOV.PK', authority: 'National Disaster Authority (PK)', domain: 'ndma.gov.pk', url: 'https://ndma.gov.pk', category: 'REGIONAL', authorityLevel: 'OFFICIAL_GOVERNMENT', color: '#4ADE80' },
  { id: 'kemkes_id', label: 'KEMKES.GO.ID', authority: 'Kementerian Kesehatan RI (ID)', domain: 'kemkes.go.id', url: 'https://kemkes.go.id', category: 'REGIONAL', authorityLevel: 'OFFICIAL_GOVERNMENT', color: '#10B981' },
  { id: 'bmkg_id', label: 'BMKG.GO.ID', authority: 'Meteorologi & Geofisika (ID)', domain: 'bmkg.go.id', url: 'https://bmkg.go.id', category: 'REGIONAL', authorityLevel: 'OFFICIAL_GOVERNMENT', color: '#14B8A6' },
  { id: 'pta_pk', label: 'PTA.GO.PK', authority: 'Telecom & Cybersecurity (PK)', domain: 'pta.gov.pk', url: 'https://pta.gov.pk', category: 'REGIONAL', authorityLevel: 'OFFICIAL_GOVERNMENT', color: '#2DD4BF' },
];

export const EvidenceConstellation3D: React.FC<EvidenceConstellation3DProps> = ({
  claimText = '“Verified against primary international & regional repositories”',
  isVerified = true,
  evidence,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hasCanvasError, setHasCanvasError] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'UN' | 'SCIENCE' | 'FACTCHECK' | 'REGIONAL'>('ALL');
  const [inspectedNode, setInspectedNode] = useState<(typeof GLOBAL_TRUST_CATALOG)[0] | null>(null);

  const mouseRef = useRef<{ x: number; y: number; targetX: number; targetY: number }>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
  });

  // Keep a strictly spaced, non-overcrowded set of 5 to 6 visible nodes on canvas
  const visibleOrbitNodes: Node3D[] = useMemo(() => {
    let pool = GLOBAL_TRUST_CATALOG;

    if (evidence && Array.isArray(evidence) && evidence.length > 0) {
      const liveItems: (typeof GLOBAL_TRUST_CATALOG)[0][] = [];
      const seen = new Set<string>();

      for (const item of evidence) {
        const dom = (item.url || '').replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toUpperCase();
        if (dom && !seen.has(dom)) {
          seen.add(dom);
          liveItems.push({
            id: `live_${seen.size}`,
            label: dom,
            authority: item.organization || item.sourceTitle || 'Verified Repository',
            domain: dom.toLowerCase(),
            url: item.url,
            category: 'UN',
            authorityLevel: item.authorityLevel || 'PRIMARY_INSTITUTIONAL',
            color: '#7ED4D6',
          });
        }
      }
      pool = liveItems.slice(0, 6);
    } else if (selectedCategory === 'ALL') {
      // 5 Curated Representative Pillars for ALL mode
      pool = [
        GLOBAL_TRUST_CATALOG.find((n) => n.id === 'who')!,
        GLOBAL_TRUST_CATALOG.find((n) => n.id === 'nasa')!,
        GLOBAL_TRUST_CATALOG.find((n) => n.id === 'unesco')!,
        GLOBAL_TRUST_CATALOG.find((n) => n.id === 'ipcc')!,
        GLOBAL_TRUST_CATALOG.find((n) => n.id === 'reuters')!,
        GLOBAL_TRUST_CATALOG.find((n) => n.id === 'nih_pk')!,
      ].filter(Boolean);
    } else {
      pool = GLOBAL_TRUST_CATALOG.filter((n) => n.category === selectedCategory).slice(0, 5);
    }

    const count = pool.length;
    // Two wide, spacious concentric orbits (inner 270px, outer 350px)
    return pool.map((item, idx) => {
      const isOuter = idx % 2 === 1;
      const radius = isOuter ? 340 : 260;
      const orbitInclination = isOuter ? 0.20 : -0.20;
      // Equidistant phase angle offset guarantees nodes NEVER overlap
      const baseAngle = (Math.PI * 2 * idx) / Math.max(1, count);
      // Synchronized constant velocity eliminates stuttering/collisions
      const speed = 0.0032;

      return {
        ...item,
        baseAngle,
        orbitRadius: radius,
        orbitInclination,
        speed,
      };
    });
  }, [evidence, selectedCategory]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setHasCanvasError(true);
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const speedMultiplier = prefersReducedMotion ? 0.2 : 1.0;

    let animationFrameId: number;
    let time = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      mouseRef.current.targetX = x * 0.22;
      mouseRef.current.targetY = y * 0.22;
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
    }

    const render = () => {
      const dpr = Math.min(window.devicePixelRatio || 2, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      if (w === 0 || h === 0) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      // Smooth mouse parallax damping
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      const cx = w / 2;
      const cy = h / 2;
      const fov = 520;
      const cameraZ = 240;

      time += 1 * speedMultiplier;

      // 1. Subtle Orbital Track Guides
      ctx.save();
      const orbitRings = [260, 340];
      orbitRings.forEach((r, i) => {
        ctx.strokeStyle = i === 0 ? 'rgba(126, 212, 214, 0.09)' : 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.ellipse(cx, cy, r, r * 0.44, mouseRef.current.x * 0.12, 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.restore();

      // 2. Project Nodes in 3D Matrix
      const projected = visibleOrbitNodes.map((node) => {
        const angle = node.baseAngle + time * node.speed;
        const rawX = Math.cos(angle) * node.orbitRadius;
        const rawZ = Math.sin(angle) * node.orbitRadius;
        const rawY = Math.sin(angle + node.orbitInclination) * 36;

        // Clean 3D rotation
        const rotY = rawX * Math.cos(mouseRef.current.x) - rawZ * Math.sin(mouseRef.current.x);
        const rotZ = rawX * Math.sin(mouseRef.current.x) + rawZ * Math.cos(mouseRef.current.x);
        const rotFinalY = rawY * Math.cos(mouseRef.current.y) - rotZ * Math.sin(mouseRef.current.y);
        const finalZ = rawY * Math.sin(mouseRef.current.y) + rotZ * Math.cos(mouseRef.current.y) + cameraZ;

        const scale = fov / (fov + finalZ);
        const projX = cx + rotY * scale;
        const projY = cy + rotFinalY * scale;

        return {
          ...node,
          projX,
          projY,
          projScale: scale,
          zDepth: finalZ,
        };
      });

      // Sort by Z-depth for natural occlusion
      projected.sort((a, b) => b.zDepth - a.zDepth);

      // 3. Central Sovereign Anchor
      const pulse = Math.sin(time * 0.03) * 3;
      const centralAura = ctx.createRadialGradient(cx, cy, 4, cx, cy, 65 + pulse);
      centralAura.addColorStop(0, 'rgba(126, 212, 214, 0.24)');
      centralAura.addColorStop(0.7, 'rgba(18, 20, 28, 0.10)');
      centralAura.addColorStop(1, 'rgba(10, 13, 20, 0)');
      ctx.fillStyle = centralAura;
      ctx.beginPath();
      ctx.arc(cx, cy, 65 + pulse, 0, Math.PI * 2);
      ctx.fill();

      // Central Hub Core
      ctx.fillStyle = isVerified ? '#34D399' : '#7ED4D6';
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fill();

      // 4. Draw Convergence Beams
      projected.forEach((node) => {
        const beamGrad = ctx.createLinearGradient(cx, cy, node.projX, node.projY);
        beamGrad.addColorStop(0, 'rgba(126, 212, 214, 0.26)');
        beamGrad.addColorStop(0.7, 'rgba(126, 212, 214, 0.06)');
        beamGrad.addColorStop(1, 'rgba(255, 255, 255, 0.02)');

        ctx.strokeStyle = beamGrad;
        ctx.lineWidth = Math.max(0.8, 1.2 * node.projScale);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(node.projX, node.projY);
        ctx.stroke();

        // Traveling telemetry pulse
        const pulseT = (time * 0.012 + node.baseAngle) % 1;
        const px = cx + (node.projX - cx) * pulseT;
        const py = cy + (node.projY - cy) * pulseT;
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(px, py, 1.6 * node.projScale, 0, Math.PI * 2);
        ctx.fill();
      });

      // 5. Render Spacious Node Badges
      projected.forEach((node) => {
        // Glowing Orb Dot
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.projX, node.projY, 4.5 * node.projScale, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.arc(node.projX, node.projY, 7.5 * node.projScale, 0, Math.PI * 2);
        ctx.stroke();

        // Clean Frosted Label Pill
        const fontSize = Math.max(10, Math.round(12 * node.projScale));
        ctx.font = `700 ${fontSize}px 'JetBrains Mono', monospace`;
        const textMetrics = ctx.measureText(node.label);
        const pillW = textMetrics.width + 16;
        const pillH = Math.max(20, Math.round(24 * node.projScale));
        const pillY = node.projY - pillH - 8 * node.projScale;

        // Container Box
        ctx.fillStyle = 'rgba(10, 13, 20, 0.92)';
        ctx.strokeStyle = node.color;
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.roundRect(node.projX - pillW / 2, pillY, pillW, pillH, 5);
        ctx.fill();
        ctx.stroke();

        // Badge Text
        ctx.fillStyle = '#FBF9F3';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.label, node.projX, pillY + pillH / 2);
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
  }, [visibleOrbitNodes, isVerified]);

  if (hasCanvasError) {
    return (
      <div className={`p-8 text-center bg-surface-elevated/40 border border-white/[0.08] rounded-3xl ${className}`}>
        <p className="text-xs font-mono text-text-muted uppercase tracking-widest">Evidence Convergence Nodes</p>
        <p className="text-sm font-editorial text-text-primary mt-2">{claimText}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full flex flex-col items-center justify-between select-none overflow-hidden bg-[#0A0D14] rounded-3xl border border-white/[0.08] ${className}`}
    >
      {/* Top Filter Bar: Smooth Category Switcher */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between px-6 pt-5 gap-3 z-10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-teal-bright animate-pulse" />
          <span className="font-mono text-xs uppercase tracking-widest text-text-secondary font-medium">
            20+ Institutional Repositories
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-white/[0.04] p-1 rounded-xl border border-white/[0.08] backdrop-blur-md">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-tactile ${
              selectedCategory === 'ALL'
                ? 'bg-brand-teal text-white font-semibold shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Pillars (6)
          </button>
          <button
            onClick={() => setSelectedCategory('UN')}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-tactile ${
              selectedCategory === 'UN'
                ? 'bg-brand-teal text-white font-semibold shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            UN Bodies
          </button>
          <button
            onClick={() => setSelectedCategory('SCIENCE')}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-tactile ${
              selectedCategory === 'SCIENCE'
                ? 'bg-brand-teal text-white font-semibold shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Space & Science
          </button>
          <button
            onClick={() => setSelectedCategory('FACTCHECK')}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-tactile ${
              selectedCategory === 'FACTCHECK'
                ? 'bg-brand-teal text-white font-semibold shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            IFCN Fact-Checks
          </button>
          <button
            onClick={() => setSelectedCategory('REGIONAL')}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-tactile ${
              selectedCategory === 'REGIONAL'
                ? 'bg-brand-teal text-white font-semibold shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Regional (PK/ID/ES)
          </button>
        </div>
      </div>

      {/* 3D Orbiting Canvas View (Spacious & Buttery Smooth 60 FPS) */}
      <div className="relative w-full h-[360px] sm:h-[420px] md:h-[460px]">
        <canvas ref={canvasRef} className="w-full h-full block absolute inset-0" />
      </div>

      {/* Interactive Catalog Grid (All 20+ Sources Clearly Browsable Below) */}
      <div className="w-full px-6 pb-6 z-10 border-t border-white/[0.06] pt-5 bg-black/40 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
            Click any repository to inspect authority standards:
          </span>
          <span className="text-[11px] font-mono text-brand-teal-bright">
            {GLOBAL_TRUST_CATALOG.length} Verified Repositories
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {GLOBAL_TRUST_CATALOG.map((item) => (
            <button
              key={item.id}
              onClick={() => setInspectedNode(item)}
              className="px-3 py-2 bg-white/[0.03] hover:bg-white/[0.08] hover:border-brand-teal-bright/40 border border-white/[0.06] rounded-xl text-left transition-tactile flex flex-col justify-between gap-1 group"
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-mono text-xs font-bold text-text-primary group-hover:text-brand-teal-bright">
                  {item.label}
                </span>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              </div>
              <span className="text-[10px] text-text-muted truncate font-sans">
                {item.authority}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Inspection Modal */}
      {inspectedNode && (
        <div
          onClick={() => setInspectedNode(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-up pointer-events-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-[#11141E] border border-white/[0.12] rounded-2xl shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: inspectedNode.color }} />
                <h3 className="font-mono text-base font-bold text-text-primary">{inspectedNode.label}</h3>
              </div>
              <button
                onClick={() => setInspectedNode(null)}
                className="text-text-muted hover:text-text-primary text-xs font-mono px-2 py-1 rounded bg-white/[0.04]"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <span className="text-text-muted uppercase block text-[10px]">Organization & Role:</span>
                <p className="text-sm font-sans text-text-primary font-medium">{inspectedNode.authority}</p>
              </div>

              <div>
                <span className="text-text-muted uppercase block text-[10px]">Epistemic Authority Tier:</span>
                <span className="inline-block px-2.5 py-1 rounded-full bg-brand-teal/15 text-brand-teal-bright font-mono text-[11px] mt-1 border border-brand-teal/30">
                  {inspectedNode.authorityLevel}
                </span>
              </div>

              <div>
                <span className="text-text-muted uppercase block text-[10px]">Official Repository URL:</span>
                <a
                  href={inspectedNode.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-teal-bright hover:underline inline-flex items-center gap-1 mt-1 text-sm font-sans"
                >
                  <span>{inspectedNode.url}</span>
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </a>
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
              <span className="text-[11px] font-mono text-text-muted">UNESCO MIL Grounding Standard</span>
              <button
                onClick={() => setInspectedNode(null)}
                className="px-4 py-1.5 bg-brand-teal hover:bg-brand-teal-dim text-white rounded-lg text-xs font-mono transition-tactile"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
