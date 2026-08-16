import React from 'react';
import { AppView } from '../types';

interface PrivacyPageProps {
  onNavigate: (view: AppView) => void;
  currentLanguage: string;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-12 text-left animate-fade-up">
      {/* Header */}
      <div className="space-y-4 border-b border-border-subtle pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-teal/10 border border-brand-teal/20 text-brand-teal-bright text-xs font-mono">
          <span className="material-symbols-outlined text-[14px]">shield</span>
          <span>PRIVACY & DATA GOVERNANCE</span>
        </div>
        <h1 className="font-editorial text-3xl sm:text-4xl text-text-primary font-medium tracking-tight">
          VeriVoice Privacy Policy & Data Architecture
        </h1>
        <p className="text-text-secondary font-sans text-sm sm:text-base leading-relaxed max-w-2xl">
          VeriVoice is engineered with a strict <strong>Privacy-by-Design</strong> ethos. We believe that public health and scientific verification should never come at the cost of personal surveillance.
        </p>
        <p className="text-xs font-mono text-text-muted">
          Last Updated: August 16, 2026 • Prototype Milestone
        </p>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-surface-elevated border border-border-subtle rounded-2xl space-y-2">
          <span className="material-symbols-outlined text-brand-teal-bright text-[24px]">mic_off</span>
          <h3 className="text-sm font-medium text-text-primary font-sans">Zero Voice Retention</h3>
          <p className="text-xs text-text-secondary font-sans leading-relaxed">
            Microphone audio is transcribed in volatile memory and deleted within seconds. Voice recordings are never stored on persistent disks.
          </p>
        </div>

        <div className="p-5 bg-surface-elevated border border-border-subtle rounded-2xl space-y-2">
          <span className="material-symbols-outlined text-cyan-400 text-[24px]">cookie_off</span>
          <h3 className="text-sm font-medium text-text-primary font-sans">Zero Ad Trackers</h3>
          <p className="text-xs text-text-secondary font-sans leading-relaxed">
            No marketing trackers, third-party advertising cookies, or cross-site tracking pixels exist on VeriVoice.
          </p>
        </div>

        <div className="p-5 bg-surface-elevated border border-border-subtle rounded-2xl space-y-2">
          <span className="material-symbols-outlined text-emerald-400 text-[24px]">timer</span>
          <h3 className="text-sm font-medium text-text-primary font-sans">5-Minute Ephemeral TTL</h3>
          <p className="text-xs text-text-secondary font-sans leading-relaxed">
            Multi-turn conversation sessions expire automatically after 5 minutes of inactivity and are permanently erased from server memory.
          </p>
        </div>
      </div>

      {/* Detailed Policy Sections */}
      <div className="space-y-8 font-sans text-sm text-text-secondary leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="font-editorial text-xl text-text-primary font-medium">1. What VeriVoice Is</h2>
          <p>
            VeriVoice is an evidence-grounded claim verification and research platform built in alignment with UNESCO Media and Information Literacy (MIL) guidelines. It assists users in evaluating assertions related to health, science, climate, and public emergencies by retrieving verified institutional consensus from primary repositories (e.g. WHO, NASA, IPCC, WMO, CDC).
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="font-editorial text-xl text-text-primary font-medium">2. Information You Provide & How It Is Used</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong className="text-text-primary">Voice Input (Microphone):</strong> When you click the Acoustic Core or microphone icon, your browser records an ephemeral audio segment (up to 30 seconds). This audio is converted into text via Speech-to-Text (ASR) to extract the factual claim.
            </li>
            <li>
              <strong className="text-text-primary">Text Claims & Questions:</strong> Text submitted via the Research Chat or Talk follow-up chips is matched against verified factual datasets and live scientific databases.
            </li>
            <li>
              <strong className="text-text-primary">Session Identifiers:</strong> Ephemeral session tokens (e.g. <code className="text-[11px] font-mono text-brand-teal-bright bg-white/[0.05] px-1 py-0.5 rounded">sess_...</code>) are generated in volatile memory solely to maintain conversational turn continuity (such as pronoun resolution and evidence reuse).
            </li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="font-editorial text-xl text-text-primary font-medium">3. Voice & Audio Data Lifecycle</h2>
          <p>
            VeriVoice enforces a strict <strong>ephemeral audio policy</strong>:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Audio streams are processed in memory and written only to isolated temporary buffers on the server.</li>
            <li>Input audio files are deleted immediately after transcription completes in a <code className="text-[11px] font-mono bg-white/[0.05] px-1 py-0.5 rounded">finally &#123;&#125;</code> execution block.</li>
            <li>Synthesized speech MP3 files generated for spoken playback are purged within 10 seconds of delivery.</li>
            <li>We do not build voice profiles, biometric voiceprints, or training datasets from user audio.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="font-editorial text-xl text-text-primary font-medium">4. External Service Providers & Data Processors</h2>
          <p>
            To deliver ultra-low-latency verification and neural speech synthesis, VeriVoice interfaces with selected enterprise cloud infrastructure:
          </p>
          <div className="overflow-x-auto border border-border-subtle rounded-xl">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-surface-elevated border-b border-border-subtle font-mono text-text-muted uppercase">
                <tr>
                  <th className="p-3">Provider</th>
                  <th className="p-3">Purpose</th>
                  <th className="p-3">Data Processed</th>
                  <th className="p-3">Data Retention</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                <tr>
                  <td className="p-3 font-medium text-text-primary">Groq LPU Cloud</td>
                  <td className="p-3">LLaMA 3.3 70B Reasoning & Whisper ASR</td>
                  <td className="p-3">Claim query text & audio buffer</td>
                  <td className="p-3">Zero data retention for inference</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-text-primary">ElevenLabs</td>
                  <td className="p-3">Studio Neural Speech Synthesis (TTS)</td>
                  <td className="p-3">Synthesized explanation text</td>
                  <td className="p-3">Ephemeral speech generation</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-text-primary">Speechmatics</td>
                  <td className="p-3">Fallback Multilingual ASR</td>
                  <td className="p-3">Audio stream buffer</td>
                  <td className="p-3">Real-time stream transcription</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-text-primary">Vercel & Render</td>
                  <td className="p-3">Edge CDN & Container Hosting</td>
                  <td className="p-3">Encrypted HTTPS HTTP requests</td>
                  <td className="p-3">Standard ephemeral network access logs</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="font-editorial text-xl text-text-primary font-medium">5. Cookies & Local Browser Storage</h2>
          <p>
            VeriVoice does not use tracking or advertising cookies. We use minimal browser <code className="text-[11px] font-mono bg-white/[0.05] px-1 py-0.5 rounded">localStorage</code> keys strictly for technical preferences:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><code className="text-[11px] font-mono text-brand-teal-bright">verivoice_lang</code>: Stores your chosen interface language (English, Urdu, Spanish, Indonesian).</li>
            <li><code className="text-[11px] font-mono text-brand-teal-bright">verivoice_user_settings</code>: Stores your audio autoplay and voice speed preferences.</li>
            <li><code className="text-[11px] font-mono text-brand-teal-bright">verivoice_privacy_ack</code>: Records your dismissal of the initial privacy notice.</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="font-editorial text-xl text-text-primary font-medium">6. Security & Safeguards</h2>
          <p>
            VeriVoice incorporates defense-in-depth security measures:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong className="text-text-primary">Encrypted Transport:</strong> All data is transmitted over TLS/HTTPS.</li>
            <li><strong className="text-text-primary">Content Security Policy (CSP):</strong> Strict headers prevent malicious script injections and frame-jacking.</li>
            <li><strong className="text-text-primary">Citation Allowlisting:</strong> All cited sources are validated against official domain registries to eliminate fabricated links.</li>
            <li><strong className="text-text-primary">Abuse Throttling:</strong> Sliding-window rate limiters prevent automated quota exhaustion.</li>
          </ul>
        </section>

        {/* Section 7 */}
        <section className="space-y-3">
          <h2 className="font-editorial text-xl text-text-primary font-medium">7. User Choices & Data Erasure</h2>
          <p>
            You have full control over your session:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>You can clear your local settings and search history at any time via the User Settings modal.</li>
            <li>You can revoke microphone permissions directly in your browser's site settings.</li>
            <li>You can use VeriVoice entirely via text without granting microphone permissions.</li>
          </ul>
        </section>

        {/* Section 8 */}
        <section className="space-y-3 border-t border-border-subtle pt-6">
          <h2 className="font-editorial text-xl text-text-primary font-medium">8. Disclaimer</h2>
          <p className="text-xs text-text-muted leading-relaxed">
            This document outlines the privacy architecture of the current VeriVoice prototype. It is provided for transparency and does not constitute formal legal advice. For questions or technical audits, visit our open repository on GitHub.
          </p>
        </section>
      </div>

      {/* Back to App Action */}
      <div className="border-t border-border-subtle pt-6 flex justify-between items-center">
        <button
          onClick={() => {
            onNavigate('talk');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="px-5 py-2.5 bg-brand-teal-bright text-surface-base font-medium rounded-xl text-xs font-mono hover:bg-brand-teal transition-colors shadow-lg"
        >
          Return to Voice Sanctuary
        </button>

        <button
          onClick={() => {
            onNavigate('methodology');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="text-xs font-mono text-text-secondary hover:text-brand-teal-bright transition-colors"
        >
          View Verification Methodology →
        </button>
      </div>
    </div>
  );
};
