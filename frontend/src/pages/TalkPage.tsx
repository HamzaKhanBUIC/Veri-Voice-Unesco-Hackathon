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

  // Multi-Turn Conversational Session State
  const [sessionId, setSessionId] = useState<string>(() => `sess_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`);
  const [turnCount, setTurnCount] = useState<number>(0);
  const [history, setHistory] = useState<ConversationTurn[]>([]);
  const [activeEvidence, setActiveEvidence] = useState<EvidenceItem[]>([]);
  const [activeClaim, setActiveClaim] = useState<string>('');
  const [responseLanguage, setResponseLanguage] = useState<string>(currentLanguage || 'en');

  // Sync language or server readiness changes
  useEffect(() => {
    setResponseLanguage(currentLanguage);
    if (voiceState === 'IDLE') {
      setStatusMessage(!isServerReady ? t.serverNotice.pleaseWait : t.talk.tapToSpeak);
    }
  }, [currentLanguage, isServerReady]);

  // Ref to stop active audio on barge-in
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

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
    }
  }, []);

  // Handle Core Click (Start Recording, Stop Recording, or Barge-In)
  const handleCoreClick = async () => {
    if (turnCount >= 10) {
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
      // Start fresh recording
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

      // Submit Audio Base64 with Session Context
      try {
        setVoiceState('CHECKING');
        setStatusMessage('Grounding evidence across verified repositories...');

        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          try {
            const contextPayload: ConversationContext = {
              sessionId,
              turnCount,
              history,
              activeEvidence,
              activeClaim,
              targetLanguage: responseLanguage,
              voiceMode: true,
            };

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
      const contextPayload: ConversationContext = {
        sessionId,
        turnCount,
        history,
        activeEvidence,
        activeClaim,
        targetLanguage: responseLanguage,
        voiceMode: true,
      };

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
    setVoiceState('RESPONDING');
    setStatusMessage('Verification grounded.');

    // Update Session Context
    const newTurnCount = response.conversation?.turnCount !== undefined ? response.conversation.turnCount : turnCount + 1;
    setTurnCount(newTurnCount);

    if (response.conversation?.sessionId) {
      setSessionId(response.conversation.sessionId);
    }

    if (response.conversation?.responseLanguage) {
      setResponseLanguage(response.conversation.responseLanguage);
    }

    // Update history
    setHistory((prev) => [
      ...prev,
      { role: 'user' as const, text: response.userClaim },
      { role: 'assistant' as const, text: response.explanation, verdict: response.verdict },
    ].slice(-8));

    // Update active evidence if fresh evidence received
    if (response.evidence && response.evidence.length > 0) {
      setActiveEvidence(response.evidence);
      setActiveClaim(response.userClaim);
    }
  };

  // Reset Session
  const handleResetSession = () => {
    stopActiveAudioPlayback();
    setVoiceState('IDLE');
    setCurrentResult(null);
    setTranscriptText('');
    setTurnCount(0);
    setHistory([]);
    setActiveEvidence([]);
    setActiveClaim('');
    setSessionId(`sess_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`);
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
            <button
              onClick={() => onNavigate('chat')}
              className="text-xs text-brand-teal-bright underline font-mono block mx-auto"
            >
              Use text verification instead
            </button>
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

        {/* Editorial Typography-Led Verdict Statement (No Heavy Box Overload) */}
        {currentResult && voiceState === 'RESPONDING' && (
          <div className="w-full text-left space-y-6 pt-4 border-t border-white/[0.08] animate-fade-up">
            {/* Verdict Header Line */}
            <div className="flex items-center justify-between">
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
            {currentResult.audioUrl && (
              <AudioWavePlayer
                audioUrl={apiClient.resolveAudioUrl(currentResult.audioUrl)}
                autoPlay={true}
                title={`Spoken Verdict (${responseLanguage.toUpperCase()})`}
              />
            )}

            {/* Quick Follow-up Prompts */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-[11px] font-mono text-text-muted uppercase">Follow-up:</span>
              <button
                onClick={() => handleQuickFollowUp('Why is that?')}
                className="px-3 py-1 bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-text-secondary hover:text-text-primary rounded-lg border border-white/[0.08] transition-tactile"
              >
                "Why?"
              </button>
              <button
                onClick={() => handleQuickFollowUp('What did the primary source say?')}
                className="px-3 py-1 bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-text-secondary hover:text-text-primary rounded-lg border border-white/[0.08] transition-tactile"
              >
                "What did the source say?"
              </button>
              <button
                onClick={() => handleQuickFollowUp('Ab Urdu mein samjhao')}
                className="px-3 py-1 bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-text-secondary hover:text-text-primary rounded-lg border border-white/[0.08] transition-tactile font-urdu"
              >
                "اردو میں سمجھائیں"
              </button>
              <button
                onClick={() => handleQuickFollowUp('Explain in Spanish')}
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
                  <span>Speak</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Quiet Footer */}
      <div className="w-full py-3 text-xs font-mono text-text-muted border-t border-white/[0.06] flex items-center justify-between">
        <span>Tap core to speak or interrupt</span>
        <span>Neural EdgeTTS · Groq Whisper</span>
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
