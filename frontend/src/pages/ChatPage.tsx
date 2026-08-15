import React, { useState, useRef, useEffect } from 'react';
import { VerdictBadge } from '../components/ui/VerdictBadge';
import { AudioWavePlayer } from '../components/voice/AudioWavePlayer';
import { EvidenceRail } from '../components/evidence/EvidenceRail';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import { apiClient } from '../services/api/ApiClient';
import { getTranslation } from '../i18n/translations';
import { ChatMessage, DomainCategory, AppView } from '../types';

interface ChatPageProps {
  initialClaim?: string;
  currentLanguage: string;
  onNavigate: (view: AppView) => void;
}

export const ChatPage: React.FC<ChatPageProps> = ({
  initialClaim = '',
  currentLanguage,
  onNavigate,
}) => {
  const t = getTranslation(currentLanguage);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState(initialClaim);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(t.chat.analyzing);
  const [selectedDomain, setSelectedDomain] = useState<DomainCategory>('ALL');
  const [activeEvidence, setActiveEvidence] = useState<ChatMessage | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const {
    isRecording,
    recordingDuration,
    startRecording,
    stopRecording,
    error: recorderError,
  } = useVoiceRecorder(30);

  const domainPills: { id: DomainCategory; label: string; icon: string }[] = [
    { id: 'ALL', label: t.chat.domainAll, icon: 'apps' },
    { id: 'HEALTH', label: t.chat.domainHealth, icon: 'medical_services' },
    { id: 'SCIENCE', label: t.chat.domainScience, icon: 'science' },
    { id: 'WEATHER_CLIMATE', label: t.chat.domainClimate, icon: 'cloud' },
    { id: 'DISASTER', label: t.chat.domainDisaster, icon: 'warning' },
  ];

  const sampleClaims = [
    'Polio drops are safe and essential for children',
    'کیا پولیو کے قطرے بچوں کے لیے محفوظ ہیں؟',
    '¿Las vacunas causan autismo?',
    'Apakah bawang putih menyembuhkan virus corona?',
    'What causes dengue fever and how is it treated?',
  ];

  // Dynamic warm-up status timer when query takes > 3s
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isLoading) {
      setLoadingStatus(t.chat.analyzing);
      timer = setTimeout(() => {
        setLoadingStatus(t.chat.serverWarmup);
      }, 3500);
    }
    return () => clearTimeout(timer);
  }, [isLoading, currentLanguage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialClaim && initialClaim.trim().length > 0) {
      handleSubmitText(initialClaim);
    }
  }, []);

  const handleSubmitText = async (queryText?: string) => {
    const textToSubmit = queryText || inputText;
    if (!textToSubmit || textToSubmit.trim().length === 0 || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      text: textToSubmit.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await apiClient.verifyClaim({
        claimText: textToSubmit.trim(),
        targetLanguage: currentLanguage,
        context: {
          targetLanguage: currentLanguage,
        },
      });

      const assistantMsg: ChatMessage = {
        id: `res_${Date.now()}`,
        role: 'assistant',
        text: response.explanation,
        timestamp: Date.now(),
        verdict: response.verdict,
        confidence: response.confidence,
        explanation: response.explanation,
        evidence: response.evidence || [],
        audioUrl: response.audioUrl,
        mode: response.verdict === 'RESEARCH_RESPONSE' ? 'GENERAL_RESEARCH' : 'VERIFICATION',
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setActiveEvidence(assistantMsg);
    } catch (err: unknown) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        text: err instanceof Error ? err.message : 'Unable to complete verification.',
        timestamp: Date.now(),
        isError: true,
        verdict: 'UNCERTAIN',
        confidence: 0,
        explanation: 'Verification service encountered an error. Please retry your inquiry.',
        evidence: [],
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicToggle = async () => {
    if (isRecording) {
      const blob = await stopRecording();
      if (!blob) return;

      setIsLoading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        try {
          const userVoiceMsg: ChatMessage = {
            id: `msg_voice_${Date.now()}`,
            role: 'user',
            text: '🎙️ Spoken Voice Note...',
            timestamp: Date.now(),
            isAudioInput: true,
          };
          setMessages((prev) => [...prev, userVoiceMsg]);

          const response = await apiClient.verifyClaim({
            audioBase64: base64,
            fileExt: 'webm',
            targetLanguage: currentLanguage,
            context: {
              targetLanguage: currentLanguage,
              voiceMode: true,
            },
          });

          const assistantMsg: ChatMessage = {
            id: `res_voice_${Date.now()}`,
            role: 'assistant',
            text: response.explanation,
            timestamp: Date.now(),
            verdict: response.verdict,
            confidence: response.confidence,
            explanation: response.explanation,
            evidence: response.evidence || [],
            audioUrl: response.audioUrl,
          };

          setMessages((prev) => [...prev, assistantMsg]);
          setActiveEvidence(assistantMsg);
        } catch (err: unknown) {
          const errorMsg: ChatMessage = {
            id: `err_${Date.now()}`,
            role: 'assistant',
            text: err instanceof Error ? err.message : 'Audio verification failed.',
            timestamp: Date.now(),
            isError: true,
            verdict: 'UNCERTAIN',
            confidence: 0,
            explanation: 'Voice transcription failed or no audio was detected.',
          };
          setMessages((prev) => [...prev, errorMsg]);
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(blob);
    } else {
      await startRecording();
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-64px)] w-full overflow-hidden">
      {/* 1. MAIN CONVERSATIONAL CHAT COLUMN */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Filter Bar */}
        <div className="px-4 py-3 border-b border-border-subtle bg-surface-container-low flex items-center justify-between gap-3 overflow-x-auto scrollbar-hide flex-shrink-0">
          <div className="flex items-center gap-2">
            {domainPills.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedDomain(p.id)}
                className={`px-3 py-1 rounded-full text-xs font-mono flex items-center gap-1.5 whitespace-nowrap transition-tactile ${
                  selectedDomain === p.id
                    ? 'bg-brand-navy-light text-brand-navy-deep font-semibold shadow-sm'
                    : 'bg-surface-container hover:bg-surface-container-high text-text-secondary border border-border-subtle'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">{p.icon}</span>
                <span>{p.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => onNavigate('talk')}
            className="hidden sm:inline-flex items-center gap-1 text-xs font-mono text-brand-teal-bright hover:underline flex-shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">graphic_eq</span>
            <span>Switch to Talk Room</span>
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-hide">
          {messages.length === 0 ? (
            <div className="py-12 md:py-20 text-center flex flex-col items-center gap-6 max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-full bg-surface-container border border-border-subtle flex items-center justify-center text-brand-teal-bright">
                <span className="material-symbols-outlined text-[24px]">fact_check</span>
              </div>

              <div className="space-y-2">
                <h3 className="font-editorial text-2xl font-semibold text-text-primary">
                  VeriVoice Evidence Workspace
                </h3>
                <p className="text-xs md:text-sm text-text-secondary font-sans leading-relaxed">
                  Enter any text claim, rumor, or general research inquiry. VeriVoice retrieves live authoritative sources and evaluates claims against strict evidence boundaries.
                </p>
              </div>

              {/* Sample Chips */}
              <div className="w-full text-left space-y-2 pt-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
                  Suggested Claims to Verify:
                </span>
                <div className="flex flex-col gap-2">
                  {sampleClaims.map((claim, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSubmitText(claim)}
                      className="text-left px-3.5 py-2.5 rounded bg-surface-elevated hover:bg-surface-container border border-border-subtle hover:border-border-variant text-xs text-text-primary transition-tactile flex items-center justify-between group"
                    >
                      <span>"{claim}"</span>
                      <span className="material-symbols-outlined text-[16px] text-text-muted group-hover:text-brand-teal-bright transition-colors">
                        arrow_forward
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="space-y-4">
                {/* User Bubble */}
                {msg.role === 'user' && (
                  <div className="flex justify-end">
                    <div className="bg-surface-container-high border border-border-subtle text-text-primary rounded-xl rounded-tr-none px-5 py-3 max-w-[85%] shadow-sm">
                      <p className="font-sans text-sm md:text-base leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                )}

                {/* Assistant Result Dossier Card */}
                {msg.role === 'assistant' && (
                  <div className="flex justify-start">
                    <div className="bg-surface-elevated border border-border-subtle rounded-xl p-5 md:p-6 max-w-[95%] shadow-md space-y-4 text-left">
                      {/* Verdict Header */}
                      <div className="flex items-center justify-between gap-3 border-b border-border-subtle pb-3">
                        <div className="flex items-center gap-2">
                          {msg.verdict && <VerdictBadge verdict={msg.verdict} size="md" />}
                          {msg.mode === 'GENERAL_RESEARCH' && (
                            <span className="text-xs font-mono uppercase text-brand-teal-bright bg-brand-teal/10 px-2 py-0.5 rounded border border-brand-teal/30">
                              Research Mode
                            </span>
                          )}
                        </div>
                        {msg.confidence !== undefined && (
                          <span className="text-xs font-mono text-text-muted">
                            Confidence:{' '}
                            <strong className="text-brand-teal-bright">{msg.confidence}</strong>
                          </span>
                        )}
                      </div>

                      {/* Explanation Body */}
                      <p className="font-editorial text-base md:text-lg text-text-primary leading-relaxed">
                        {msg.explanation || msg.text}
                      </p>

                      {/* Audio Player if Spoken Response exists */}
                      {msg.audioUrl && (
                        <AudioWavePlayer
                          audioUrl={apiClient.resolveAudioUrl(msg.audioUrl)}
                          title="Spoken Neural Response"
                        />
                      )}

                      {/* Footer Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border-subtle text-xs font-mono">
                        <button
                          onClick={() => {
                            setActiveEvidence(msg);
                            setMobileDrawerOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 text-brand-teal-bright hover:underline"
                        >
                          <span className="material-symbols-outlined text-[16px]">account_tree</span>
                          <span>
                            {t.chat.viewEvidence} ({msg.evidence?.length || 0} Sources)
                          </span>
                        </button>

                        <span className="text-[10px] text-text-muted">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex justify-start animate-fade-up">
              <div className="bg-surface-elevated/90 backdrop-blur-md border border-border-subtle rounded-2xl p-5 max-w-md space-y-3 shadow-lg">
                <div className="flex items-center gap-2.5 text-brand-teal-bright text-xs font-mono">
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  <span>{loadingStatus}</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-brand-teal to-brand-teal-bright animate-pulse w-3/4 rounded-full" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Floating Bottom Composer Bar */}
        <div className="p-4 md:p-6 bg-gradient-to-t from-surface-base via-surface-base to-transparent border-t border-border-subtle/40 flex flex-col gap-2 flex-shrink-0">
          {recorderError && (
            <span className="text-xs font-mono text-verdict-false px-2">{recorderError}</span>
          )}

          {isRecording && (
            <div className="text-xs font-mono text-verdict-false flex items-center gap-2 px-2">
              <span className="w-2 h-2 rounded-full bg-verdict-false animate-ping" />
              <span>Recording ({recordingDuration}s / 30s)</span>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmitText();
            }}
            className="bg-surface-elevated border border-border-subtle focus-within:border-brand-teal-bright rounded-xl p-2 flex items-center gap-2 shadow-lg transition-tactile"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t.chat.placeholder}
              disabled={isLoading || isRecording}
              className="flex-1 bg-transparent border-none text-text-primary font-sans text-sm md:text-base px-3 py-2 focus:outline-none placeholder:text-text-muted"
            />

            {/* Mic Toggle Button */}
            <button
              type="button"
              onClick={handleMicToggle}
              className={`p-2.5 rounded-lg flex items-center justify-center transition-tactile ${
                isRecording
                  ? 'bg-verdict-false text-white animate-pulse'
                  : 'bg-surface-container hover:bg-surface-container-high text-text-secondary hover:text-brand-teal-bright'
              }`}
              aria-label={isRecording ? 'Stop voice recording' : 'Start voice note'}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: isRecording ? "'FILL' 1" : "'FILL' 0" }}
              >
                mic
              </span>
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="p-2.5 bg-brand-navy-light text-brand-navy-deep hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-tactile flex-shrink-0"
              aria-label="Submit verification inquiry"
            >
              <span className="material-symbols-outlined text-[20px]">send</span>
            </button>
          </form>
        </div>
      </div>

      {/* 2. CONTEXTUAL EVIDENCE RAIL (Desktop Sticky + Mobile Sheet) */}
      <div className="hidden lg:block h-full">
        <EvidenceRail
          evidence={activeEvidence?.evidence || []}
          confidence={activeEvidence?.confidence || 'HIGH'}
        />
      </div>

      {/* Mobile Slide-over Sheet for Evidence */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-up">
          <div className="w-full max-w-md h-full">
            <EvidenceRail
              evidence={activeEvidence?.evidence || []}
              confidence={activeEvidence?.confidence || 'HIGH'}
              isMobileDrawer={true}
              onClose={() => setMobileDrawerOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
