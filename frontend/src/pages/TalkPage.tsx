import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AcousticCore } from '../components/voice/AcousticCore';
import { VerdictBadge } from '../components/ui/VerdictBadge';
import { AudioWavePlayer } from '../components/voice/AudioWavePlayer';
import { EvidenceRail } from '../components/evidence/EvidenceRail';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import { apiClient } from '../services/api/ApiClient';
import { getTranslation } from '../i18n/translations';
import {
  VerifyResponse,
  VoiceState,
  AppView,
  ConversationTurn,
  EvidenceItem,
  ConversationContext,
} from '../types';

interface TalkPageProps {
  onNavigate: (view: AppView) => void;
  currentLanguage: string;
  isServerReady?: boolean;
}

export const TalkPage: React.FC<TalkPageProps> = ({
  onNavigate,
  currentLanguage,
  isServerReady = true,
}) => {
  const t = getTranslation(currentLanguage);
  const [voiceState, setVoiceState] = useState<VoiceState>('IDLE');
  const [currentResult, setCurrentResult] = useState<VerifyResponse | null>(null);
  const [transcriptText, setTranscriptText] = useState<string>('');
  const [showEvidenceDrawer, setShowEvidenceDrawer] = useState(false);
  const [statusMessage, setStatusMessage] = useState(!isServerReady ? t.serverNotice.pleaseWait : t.talk.tapToSpeak);

  // Persistent Multi-Turn Conversational Session Ref (Guarantees zero closure staleness)
  const sessionContextRef = useRef<ConversationContext>({
    sessionId: `sess_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    turnCount: 0,
    history: [],
    activeEvidence: [],
    activeClaim: '',
    targetLanguage: currentLanguage || 'en',
    voiceMode: true,
  });

  // UI Mirror State
  const [turnCount, setTurnCount] = useState<number>(0);
  const [responseLanguage, setResponseLanguage] = useState<string>(currentLanguage || 'en');
  const [activeEvidence, setActiveEvidence] = useState<EvidenceItem[]>([]);

  // Ref to stop active audio on barge-in / speech start
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  // Sync language or server readiness changes
  useEffect(() => {
    setResponseLanguage(currentLanguage);
    sessionContextRef.current.targetLanguage = currentLanguage;
    if (voiceState === 'IDLE') {
      setStatusMessage(!isServerReady ? t.serverNotice.pleaseWait : t.talk.tapToSpeak);
    }
  }, [currentLanguage, isServerReady, voiceState, t]);

  const {
    isRecording,
    recordingDuration,
    volumeLevel,
    startRecording,
    stopRecording,
    error: recorderError,
    hasPermission,
  } = useVoiceRecorder(30);

  // Stop any playing audio immediately (Barge-in / Interruption)
  const stopActiveAudioPlayback = useCallback(() => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current.currentTime = 0;
      activeAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Auto-play spoken response immediately when received (Live Call Experience)
  const autoPlaySpokenResponse = useCallback((response: VerifyResponse, targetLang: string) => {
    stopActiveAudioPlayback();

    const rawUrl = response.audioUrl;
    const cleanText = (response.explanation || '').replace(/<[^>]*>/g, '').replace(/[*_#`[\]()]/g, '').trim();
    const effectiveLang = response.conversation?.responseLanguage || targetLang || 'ur';

    const ttsUrl = rawUrl
      ? apiClient.resolveAudioUrl(rawUrl)
      : `/api/tts?text=${encodeURIComponent(cleanText.substring(0, 250))}&lang=${effectiveLang}`;

    if (!ttsUrl) {
      setVoiceState('IDLE');
      return;
    }

    try {
      const audio = new Audio(ttsUrl);
      activeAudioRef.current = audio;

      audio.onplay = () => {
        setVoiceState('RESPONDING');
        setStatusMessage('Speaking response...');
      };

      audio.onended = () => {
        activeAudioRef.current = null;
        setVoiceState('IDLE');
        setStatusMessage('Tap to speak follow-up');
      };

      const configureFemaleVoice = (utterance: SpeechSynthesisUtterance) => {
        utterance.lang = effectiveLang === 'ur' ? 'ur-PK' : effectiveLang === 'es' ? 'es-ES' : effectiveLang === 'id' ? 'id-ID' : 'en-US';
        utterance.pitch = 1.08;
        utterance.rate = 0.95;

        if (typeof window !== 'undefined' && window.speechSynthesis) {
          const voices = window.speechSynthesis.getVoices();
          if (voices && voices.length > 0) {
            const code = (effectiveLang || 'en').toLowerCase().split('-')[0];
            const matching = voices.filter((v) => v.lang.toLowerCase().startsWith(code));
            const femaleRegex = /(female|woman|uzma|gul|zira|samantha|victoria|karen|swara|elvira|gadis|denise|katja|francisca|emel|zariyah|sabina|paulina|helena|eva|jenny|aria|sonia)/i;
            const femaleVoice = matching.find((v) => femaleRegex.test(v.name)) ||
                                voices.find((v) => femaleRegex.test(v.name) && v.lang.toLowerCase().startsWith(code)) ||
                                matching[0] ||
                                voices.find((v) => femaleRegex.test(v.name));
            if (femaleVoice) {
              utterance.voice = femaleVoice;
            }
          }
        }
      };

      audio.onerror = () => {
        console.warn('Audio URL stream failed, falling back to Web Speech Synthesis');
        activeAudioRef.current = null;
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          const utterance = new SpeechSynthesisUtterance(cleanText);
          configureFemaleVoice(utterance);
          utterance.onstart = () => {
            setVoiceState('RESPONDING');
            setStatusMessage('Speaking response...');
          };
          utterance.onend = () => {
            setVoiceState('IDLE');
            setStatusMessage('Tap to speak follow-up');
          };
          utterance.onerror = () => {
            setVoiceState('IDLE');
            setStatusMessage(t.talk.tapToSpeak);
          };
          window.speechSynthesis.speak(utterance);
        } else {
          setVoiceState('IDLE');
          setStatusMessage(t.talk.tapToSpeak);
        }
      };

      audio.play().catch((err) => {
        console.warn('Auto-play blocked by browser, falling back to Web Speech Synthesis:', err);
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          const utterance = new SpeechSynthesisUtterance(cleanText);
          configureFemaleVoice(utterance);
          utterance.onstart = () => {
            setVoiceState('RESPONDING');
            setStatusMessage('Speaking response...');
          };
          utterance.onend = () => {
            setVoiceState('IDLE');
            setStatusMessage('Tap to speak follow-up');
          };
          window.speechSynthesis.speak(utterance);
        } else {
          setVoiceState('IDLE');
          setStatusMessage(t.talk.tapToSpeak);
        }
      });
    } catch (e) {
      console.error('Audio playback exception:', e);
      setVoiceState('IDLE');
    }
  }, [stopActiveAudioPlayback, t]);

  // Handle Core Click (Start Recording, Stop Recording, or Barge-In)
  const handleCoreClick = async () => {
    if (sessionContextRef.current.turnCount! >= 10) {
      setStatusMessage('Session limit reached. Refreshing conversation...');
      handleResetSession();
      return;
    }

    if (voiceState === 'RESPONDING') {
      // Immediate Barge-In: Interrupt TTS playback and start listening
      stopActiveAudioPlayback();
      const success = await startRecording();
      if (success) {
        setVoiceState('LISTENING');
        setStatusMessage('Interrupted. Listening to your follow-up...');
      }
      return;
    }

    if (voiceState === 'IDLE' || voiceState === 'ERROR') {
      stopActiveAudioPlayback();
      const success = await startRecording();
      if (success) {
        setVoiceState('LISTENING');
        setStatusMessage('Listening to your claim or question...');
      }
    } else if (voiceState === 'LISTENING') {
      // Stop recording and process
      setStatusMessage('Analyzing audio...');
      setVoiceState('PROCESSING');
      const blob = await stopRecording();

      if (!blob) {
        setVoiceState('IDLE');
        setStatusMessage(t.talk.tapToSpeak);
        return;
      }

      // Submit Audio Base64 with Full Conversational Session Context
      try {
        setVoiceState('CHECKING');
        setStatusMessage('Grounding evidence across verified repositories...');

        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          try {
            const contextPayload = { ...sessionContextRef.current };

            const response = await apiClient.verifyClaim({
              audioBase64: base64Audio,
              fileExt: 'webm',
              context: contextPayload,
            });

            handleSuccessfulResponse(response);
          } catch (apiErr: unknown) {
            console.error('Talk verification failed:', apiErr);
            setVoiceState('ERROR');
            setStatusMessage(apiErr instanceof Error ? apiErr.message : 'Verification unavailable. Tap to retry.');
          }
        };
        reader.readAsDataURL(blob);
      } catch (err: unknown) {
        setVoiceState('ERROR');
        setStatusMessage('Audio processing error. Tap to retry.');
      }
    }
  };

  // Quick Action / Follow-up trigger via text chip
  const handleQuickFollowUp = async (promptText: string) => {
    stopActiveAudioPlayback();
    setVoiceState('CHECKING');
    setStatusMessage(`Verifying follow-up: "${promptText}"...`);
    setTranscriptText(promptText);

    try {
      const contextPayload = { ...sessionContextRef.current };

      const response = await apiClient.verifyClaim({
        claimText: promptText,
        context: contextPayload,
      });

      handleSuccessfulResponse(response);
    } catch (apiErr: unknown) {
      console.error('Quick follow-up failed:', apiErr);
      setVoiceState('ERROR');
      setStatusMessage(apiErr instanceof Error ? apiErr.message : 'Follow-up failed. Tap to retry.');
    }
  };

  // State update after successful backend verification
  const handleSuccessfulResponse = (response: VerifyResponse) => {
    setCurrentResult(response);
    setTranscriptText(response.userClaim || 'Spoken Query');
    setStatusMessage('Verification grounded.');

    // 1. Update Persistent Session Context Ref for Follow-ups
    const newTurnCount = (sessionContextRef.current.turnCount || 0) + 1;
    sessionContextRef.current.turnCount = newTurnCount;
    setTurnCount(newTurnCount);

    if (response.conversation?.sessionId) {
      sessionContextRef.current.sessionId = response.conversation.sessionId;
    }

    const effectiveLang = response.conversation?.responseLanguage || responseLanguage;
    sessionContextRef.current.targetLanguage = effectiveLang;
    setResponseLanguage(effectiveLang);

    // Append turn to history
    const updatedHistory: ConversationTurn[] = [
      ...(sessionContextRef.current.history || []),
      { role: 'user' as const, text: response.userClaim },
      { role: 'assistant' as const, text: response.explanation, verdict: response.verdict },
    ].slice(-8);

    sessionContextRef.current.history = updatedHistory;
    sessionContextRef.current.activeClaim = response.userClaim;

    if (response.evidence && response.evidence.length > 0) {
      sessionContextRef.current.activeEvidence = response.evidence;
      setActiveEvidence(response.evidence);
    }

    // 2. Automatically Play Spoken Response Aloud (Live Call Experience)
    autoPlaySpokenResponse(response, effectiveLang);
  };

  // Reset Session
  const handleResetSession = () => {
    stopActiveAudioPlayback();
    setVoiceState('IDLE');
    setCurrentResult(null);
    setTranscriptText('');
    setTurnCount(0);
    setActiveEvidence([]);

    sessionContextRef.current = {
      sessionId: `sess_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      turnCount: 0,
      history: [],
      activeEvidence: [],
      activeClaim: '',
      targetLanguage: currentLanguage || 'en',
      voiceMode: true,
    };

    setStatusMessage(t.talk.tapToSpeak);
  };

  const formatSeconds = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col justify-between items-center px-6 md:px-12 py-8 max-w-4xl mx-auto w-full min-h-[calc(100vh-80px)]">
      {/* Top Header: Navigation & Telemetry */}
      <div className="w-full flex items-center justify-between border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('landing')}
            className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-mono text-text-secondary hover:text-text-primary transition-tactile flex items-center gap-1.5"
            title="Back to Overview"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Home</span>
          </button>
          <span className="font-mono text-xs uppercase tracking-widest text-text-secondary hidden sm:inline">
            {t.talk.roomTitle}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs font-mono text-text-muted">
            Turn {turnCount} / 10
          </span>
          <button
            onClick={() => onNavigate('chat')}
            className="text-xs font-mono text-text-secondary hover:text-brand-teal-bright transition-colors"
          >
            {t.nav.chat} →
          </button>
        </div>
      </div>

      {/* Spacious Voice Sanctuary */}
      <div className="flex-1 flex flex-col items-center justify-center my-8 gap-8 text-center w-full max-w-2xl">
        {/* The Central Breathing Acoustic Core */}
        <div className="relative p-4 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-navy/20 via-brand-teal/10 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />
          <AcousticCore
            state={voiceState}
            volumeLevel={isRecording ? volumeLevel : 0}
            size="lg"
            onClick={handleCoreClick}
          />
        </div>

        {/* Status Message */}
        <div className="space-y-2">
          <p className="font-editorial text-xl sm:text-2xl text-text-primary font-medium tracking-tight">
            {statusMessage}
          </p>

          {isRecording && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-verdict-false/10 text-verdict-false text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-verdict-false animate-ping" />
              <span>RECORDING {formatSeconds(recordingDuration)} / 00:30 (Tap to finish)</span>
            </div>
          )}

          {recorderError && (
            <p className="text-xs font-mono text-verdict-false">{recorderError}</p>
          )}

          {hasPermission === false && (
            <div className="p-3.5 bg-surface-elevated/80 border border-border-subtle rounded-2xl max-w-md mx-auto space-y-2.5 text-center animate-fade-up">
              <p className="text-xs text-text-secondary font-sans leading-relaxed">
                Microphone access was denied or is unavailable in your browser. You can enable it in site permissions or type your query directly.
              </p>
              <button
                onClick={() => onNavigate('chat')}
                className="px-4 py-2 bg-brand-teal/15 hover:bg-brand-teal/25 text-brand-teal-bright rounded-xl text-xs font-mono inline-flex items-center gap-1.5 transition-all border border-brand-teal/30 hover:border-brand-teal/50"
              >
                <span>Type question in Chat instead</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
          )}
        </div>

        {/* Spoken Transcript Note */}
        {transcriptText && (
          <div className="w-full text-left border-l-2 border-brand-teal-bright/40 pl-4 py-1 animate-fade-up">
            <span className="text-[10px] font-mono uppercase text-text-muted block">Query:</span>
            <p className="font-sans text-sm sm:text-base text-text-primary italic">
              "{transcriptText}"
            </p>
          </div>
        )}

        {/* Editorial Typography-Led Verdict Statement Card */}
        {currentResult && (
          <div className="w-full text-left space-y-6 p-5 sm:p-6 bg-surface-elevated border border-border-subtle rounded-3xl shadow-xl animate-fade-up">
            {/* Verdict Header Line */}
            <div className="flex items-center justify-between border-b border-border-subtle pb-4">
              <VerdictBadge verdict={currentResult.verdict} size="md" />
              <span className="text-xs font-mono text-text-muted">
                Confidence: <strong className="text-brand-teal-bright">{currentResult.confidence}</strong>
              </span>
            </div>

            {/* Large Editorial Truth Statement */}
            <p className="font-editorial text-lg sm:text-xl text-text-primary leading-relaxed">
              {currentResult.explanation}
            </p>

            {/* Spoken Audio Response Player */}
            {(currentResult.audioUrl || currentResult.explanation) && (
              <AudioWavePlayer
                audioUrl={apiClient.resolveAudioUrl(currentResult.audioUrl)}
                spokenText={currentResult.explanation}
                lang={responseLanguage}
                autoPlay={false}
                title={`Spoken Verdict (${responseLanguage.toUpperCase()})`}
              />
            )}

            {/* Quick Follow-up Prompts */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border-subtle">
              <span className="text-[11px] font-mono text-text-muted uppercase">Follow-up:</span>
              <button
                onClick={() => handleQuickFollowUp('Why is that?')}
                className="px-3 py-1.5 bg-surface-container hover:bg-surface-high text-xs font-mono text-text-secondary hover:text-text-primary rounded-xl border border-border-subtle transition-tactile"
              >
                "Why?"
              </button>
              <button
                onClick={() => handleQuickFollowUp('What did the primary source say?')}
                className="px-3 py-1.5 bg-surface-container hover:bg-surface-high text-xs font-mono text-text-secondary hover:text-text-primary rounded-xl border border-border-subtle transition-tactile"
              >
                "What did the source say?"
              </button>
              <button
                onClick={() => handleQuickFollowUp('اس کے بارے میں ناسا نے کیا کہا؟')}
                className="px-3 py-1 bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-text-secondary hover:text-text-primary rounded-lg border border-white/[0.08] transition-tactile font-urdu"
              >
                "ناسا نے کیا کہا؟"
              </button>
              <button
                onClick={() => handleQuickFollowUp('En Español')}
                className="px-3 py-1 bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-text-secondary hover:text-text-primary rounded-lg border border-white/[0.08] transition-tactile"
              >
                "En Español"
              </button>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-white/[0.06] text-xs font-mono">
              <button
                onClick={() => setShowEvidenceDrawer(true)}
                className="inline-flex items-center gap-1.5 text-brand-teal-bright hover:underline"
              >
                <span className="material-symbols-outlined text-[16px]">account_tree</span>
                <span>{t.chat.viewEvidence} ({currentResult.evidence?.length || activeEvidence.length || 0} Sources)</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleResetSession}
                  className="text-text-muted hover:text-text-primary transition-colors"
                >
                  {t.talk.newClaim}
                </button>
                <button
                  onClick={handleCoreClick}
                  className="px-4 py-2 bg-brand-teal hover:bg-brand-teal-dim text-white rounded-lg font-medium transition-tactile flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">mic</span>
                  <span>Speak Follow-up</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Quiet Footer */}
      <div className="w-full py-3 text-xs font-mono text-text-muted border-t border-white/[0.06] flex items-center justify-between">
        <span>Tap core to speak or interrupt</span>
        <span>ElevenLabs Multilingual v2 · Groq Whisper</span>
      </div>

      {/* Slide-out Evidence Rail Drawer */}
      {showEvidenceDrawer && (
        <div
          onClick={() => setShowEvidenceDrawer(false)}
          className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-md animate-fade-up"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md h-full shadow-2xl border-l border-white/[0.08] bg-[#0E0E0E]"
          >
            <EvidenceRail
              evidence={currentResult?.evidence || activeEvidence || []}
              confidence={currentResult?.confidence || 'HIGH'}
              isMobileDrawer={true}
              onClose={() => setShowEvidenceDrawer(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
