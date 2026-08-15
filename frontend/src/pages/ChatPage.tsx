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
  onNavigate?: (view: AppView) => void;
  isServerReady?: boolean;
}

export const ChatPage: React.FC<ChatPageProps> = ({
  initialClaim = '',
  currentLanguage,
  onNavigate,
  isServerReady = true,
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
            text: err instanceof Error ? err.message : 'Voice verification failed.',
            timestamp: Date.now(),
            isError: true,
            verdict: 'UNCERTAIN',
            confidence: 0,
            explanation: 'Failed to transcribe or verify voice message. Please retry.',
            evidence: [],
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
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden">
      {/* Main Conversational Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Domain Filter Bar (Hairline Divider Rhythm) */}
        <div className="px-6 py-3 border-b border-white/[0.06] flex items-center justify-between gap-4 overflow-x-auto scrollbar-hide bg-[#0E0E0E]/80 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-2">
            {onNavigate && (
              <button
                onClick={() => onNavigate('landing')}
                className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-mono text-text-secondary hover:text-text-primary transition-tactile flex items-center gap-1 mr-2 flex-shrink-0"
                title="Back to Overview"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>Home</span>
              </button>
            )}
            <span className="text-[11px] font-mono uppercase text-text-muted mr-1 hidden sm:inline">
              Domain:
            </span>
            {domainPills.map((domain) => (
              <button
                key={domain.id}
                onClick={() => setSelectedDomain(domain.id)}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-tactile flex items-center gap-1.5 flex-shrink-0 ${
                  selectedDomain === domain.id
                    ? 'bg-white/[0.08] text-brand-teal-bright font-semibold border border-brand-teal-bright/30'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.03]'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">{domain.icon}</span>
                <span>{domain.label}</span>
              </button>
            ))}
          </div>

          {activeEvidence && (
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden text-xs font-mono text-brand-teal-bright flex items-center gap-1 flex-shrink-0"
            >
              <span className="material-symbols-outlined text-[16px]">account_tree</span>
              <span>Evidence ({activeEvidence.evidence?.length || 0})</span>
            </button>
          )}
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto px-6 md:px-12 py-8 space-y-8 max-w-4xl mx-auto w-full">
          {messages.length === 0 ? (
            <div className="py-12 text-left space-y-6">
              <div className="space-y-2 border-b border-white/[0.06] pb-6">
                <h2 className="font-editorial text-2xl sm:text-3xl text-text-primary font-medium">
                  Authoritative Research & Claim Verification
                </h2>
                <p className="font-sans text-xs sm:text-sm text-text-secondary max-w-xl leading-relaxed">
                  Enter a rumor, forwarded message, or public health inquiry. VeriVoice searches primary authorities (WHO, NASA, CDC, WMO, NDMA) and returns grounded verdicts.
                </p>
              </div>

              <div className="space-y-3">
                <span className="text-[11px] font-mono uppercase tracking-widest text-text-muted block">
                  Curated Inquiries to Explore:
                </span>
                <div className="space-y-2">
                  {sampleClaims.map((claim, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSubmitText(claim)}
                      className="py-2.5 px-3 border-b border-white/[0.04] hover:border-brand-teal-bright/40 text-left text-xs sm:text-sm text-text-secondary hover:text-text-primary transition-colors cursor-pointer flex items-center justify-between group"
                    >
                      <span className="font-editorial">"{claim}"</span>
                      <span className="material-symbols-outlined text-[15px] text-text-muted group-hover:text-brand-teal-bright transition-colors">
                        arrow_forward
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="space-y-4">
                {/* User Query Entry */}
                {msg.role === 'user' && (
                  <div className="flex justify-end">
                    <div className="bg-white/[0.04] border border-white/[0.08] text-text-primary rounded-2xl rounded-tr-none px-5 py-3.5 max-w-[85%]">
                      <p className="font-sans text-sm sm:text-base leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                )}

                {/* Assistant Verdict Dossier (Open Editorial Style) */}
                {msg.role === 'assistant' && (
                  <div className="flex justify-start w-full">
                    <div className="w-full max-w-3xl space-y-4 text-left border-l-2 border-brand-teal-bright/60 pl-5 py-2">
                      {/* Verdict Line */}
                      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] pb-2.5">
                        <div className="flex items-center gap-2">
                          {msg.verdict && <VerdictBadge verdict={msg.verdict} size="md" />}
                          {msg.mode === 'GENERAL_RESEARCH' && (
                            <span className="text-[10px] font-mono uppercase text-brand-teal-bright">
                              Research Mode
                            </span>
                          )}
                        </div>
                        {msg.confidence !== undefined && (
                          <span className="text-xs font-mono text-text-muted">
                            Confidence: <strong className="text-brand-teal-bright">{msg.confidence}</strong>
                          </span>
                        )}
                      </div>

                      {/* Editorial Explanation */}
                      <p className="font-editorial text-base sm:text-lg text-text-primary leading-relaxed">
                        {msg.explanation || msg.text}
                      </p>

                      {/* Audio Response Player */}
                      {msg.audioUrl && (
                        <AudioWavePlayer
                          audioUrl={apiClient.resolveAudioUrl(msg.audioUrl)}
                          title="Spoken Verification"
                        />
                      )}

                      {/* Footer Link to Evidence */}
                      <div className="flex items-center justify-between pt-2 text-xs font-mono text-text-muted">
                        <button
                          onClick={() => {
                            setActiveEvidence(msg);
                            setMobileDrawerOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 text-brand-teal-bright hover:underline"
                        >
                          <span className="material-symbols-outlined text-[15px]">account_tree</span>
                          <span>{t.chat.viewEvidence} ({msg.evidence?.length || 0} Sources)</span>
                        </button>
                        <span className="text-[10px]">
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
            <div className="flex justify-start">
              <div className="border-l-2 border-brand-teal-bright pl-4 py-2 space-y-2 text-left">
                <div className="flex items-center gap-2 text-brand-teal-bright text-xs font-mono">
                  <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                  <span>{loadingStatus}</span>
                </div>
                <div className="w-48 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                  <div className="h-full bg-brand-teal-bright animate-pulse w-3/4 rounded-full" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Sleek Writing Instrument Composer */}
        <div className="p-4 md:p-6 bg-gradient-to-t from-[#0E0E0E] via-[#0E0E0E] to-transparent border-t border-white/[0.06] flex flex-col gap-2 max-w-4xl mx-auto w-full flex-shrink-0">
          {recorderError && (
            <span className="text-xs font-mono text-verdict-false px-2">{recorderError}</span>
          )}

          {isRecording && (
            <div className="text-xs font-mono text-verdict-false flex items-center gap-2 px-2">
              <span className="w-2 h-2 rounded-full bg-verdict-false animate-ping" />
              <span>Recording Voice Note ({recordingDuration}s / 30s)</span>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmitText();
            }}
            className="bg-[#14161C] border border-white/[0.08] focus-within:border-brand-teal-bright/60 rounded-2xl px-3 py-2 flex items-center gap-2 shadow-2xl transition-tactile"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={!isServerReady ? t.serverNotice.pleaseWait : t.chat.placeholder}
              disabled={isLoading || isRecording}
              className="flex-1 bg-transparent border-none text-text-primary font-sans text-sm sm:text-base px-3 py-2 focus:outline-none placeholder:text-text-muted"
            />

            {/* Mic Toggle Button */}
            <button
              type="button"
              onClick={handleMicToggle}
              className={`p-2.5 rounded-xl flex items-center justify-center transition-tactile ${
                isRecording
                  ? 'bg-verdict-false text-white animate-pulse'
                  : 'text-text-secondary hover:text-brand-teal-bright hover:bg-white/[0.04]'
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
              className="p-2.5 bg-white/[0.08] hover:bg-white/[0.15] text-text-primary disabled:opacity-30 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-tactile flex-shrink-0"
              aria-label="Submit verification inquiry"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
            </button>
          </form>
        </div>
      </div>

      {/* Desktop Contextual Evidence Rail */}
      <div className="hidden lg:block h-full flex-shrink-0">
        <EvidenceRail
          evidence={activeEvidence?.evidence || []}
          confidence={activeEvidence?.confidence || 'HIGH'}
        />
      </div>

      {/* Mobile Slide-over Sheet for Evidence */}
      {mobileDrawerOpen && (
        <div
          onClick={() => setMobileDrawerOpen(false)}
          className="lg:hidden fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-md animate-fade-up"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md h-full shadow-2xl border-l border-white/[0.08] bg-[#0E0E0E]"
          >
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
