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
}

export const TalkPage: React.FC<TalkPageProps> = ({
  onNavigate,
  currentLanguage,
}) => {
  const t = getTranslation(currentLanguage);
  const [voiceState, setVoiceState] = useState<VoiceState>('IDLE');
  const [currentResult, setCurrentResult] = useState<VerifyResponse | null>(null);
  const [transcriptText, setTranscriptText] = useState<string>('');
  const [showEvidenceDrawer, setShowEvidenceDrawer] = useState(false);
  const [statusMessage, setStatusMessage] = useState(t.talk.tapToSpeak);
  
  // Multi-Turn Conversational Session State
  const [sessionId, setSessionId] = useState<string>(() => `sess_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`);
  const [turnCount, setTurnCount] = useState<number>(0);
  const [history, setHistory] = useState<ConversationTurn[]>([]);
  const [activeEvidence, setActiveEvidence] = useState<EvidenceItem[]>([]);
  const [activeClaim, setActiveClaim] = useState<string>('');
  const [responseLanguage, setResponseLanguage] = useState<string>(currentLanguage || 'en');

  // Sync language changes
  useEffect(() => {
    setResponseLanguage(currentLanguage);
    if (voiceState === 'IDLE') {
      setStatusMessage(t.talk.tapToSpeak);
    }
  }, [currentLanguage]);

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

  // Sync prop language changes
  useEffect(() => {
    if (currentLanguage) {
      setResponseLanguage(currentLanguage);
    }
  }, [currentLanguage]);

  // Handle Core Click (Start Recording, Stop Recording, or Barge-In)
  const handleCoreClick = async () => {
    if (turnCount >= 10) {
      setStatusMessage('Session limit reached (10 turns). Starting a fresh session...');
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
        setStatusMessage('Listening to your claim or question... (Speak clearly)');
      }
    } else if (voiceState === 'LISTENING') {
      // Stop recording and process
      setStatusMessage('Finalizing voice capture...');
      setVoiceState('PROCESSING');
      const blob = await stopRecording();

      if (!blob) {
        setVoiceState('IDLE');
        setStatusMessage('No audio captured. Tap to speak.');
        return;
      }

      // Submit Audio Base64 with Session Context
      try {
        setVoiceState('CHECKING');
        setStatusMessage('Checking authoritative evidence & context...');

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
            setStatusMessage(apiErr instanceof Error ? apiErr.message : 'Verification failed. Tap to retry.');
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
    setStatusMessage(`Processing: "${promptText}"...`);
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
    setStatusMessage('Response ready.');

    // Update Session Context
    const newTurnCount = (response.conversation?.turnCount !== undefined)
      ? response.conversation.turnCount
      : turnCount + 1;
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
    setStatusMessage('Tap the Acoustic Core or Hold Space to Speak');
  };

  const formatSeconds = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col justify-between items-center px-4 py-8 max-w-4xl mx-auto w-full min-h-[calc(100vh-80px)]">
      {/* Top Header Bar */}
      <div className="w-full flex items-center justify-between border-b border-border-subtle pb-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-widest text-brand-teal-bright flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-brand-teal-bright animate-pulse" />
            {t.talk.roomTitle}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-2.5 py-1 bg-surface-container rounded-full border border-border-subtle flex items-center gap-1.5 text-xs font-mono text-text-secondary">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-teal-bright" />
            <span>Turn {turnCount} / 10</span>
          </div>

          <button
            onClick={() => onNavigate('chat')}
            className="px-3 py-1 bg-surface-container hover:bg-surface-container-high rounded text-xs font-mono text-text-secondary hover:text-text-primary border border-border-subtle transition-tactile"
          >
            {t.nav.chat}
          </button>
        </div>
      </div>

      {/* Main Acoustic Core & Voice Resonator */}
      <div className="flex-1 flex flex-col items-center justify-center my-6 gap-8 text-center w-full">
        {/* Core Resonator */}
        <AcousticCore
          state={voiceState}
          volumeLevel={isRecording ? volumeLevel : 0}
          size="lg"
          onClick={handleCoreClick}
        />

        {/* Live Status Message & Timer */}
        <div className="flex flex-col items-center gap-2 max-w-md">
          <p className="font-editorial text-lg sm:text-xl text-text-primary font-medium">
            {statusMessage}
          </p>

          {isRecording && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-verdict-false/10 border border-verdict-false/30 text-verdict-false rounded-full text-xs font-mono font-bold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-verdict-false" />
              <span>RECORDING {formatSeconds(recordingDuration)} / 00:30 (Tap to Finish)</span>
            </div>
          )}

          {recorderError && (
            <div className="text-xs font-mono text-verdict-false bg-verdict-false/10 border border-verdict-false/20 px-3 py-1.5 rounded mt-2">
              {recorderError}
            </div>
          )}

          {hasPermission === false && (
            <button
              onClick={() => onNavigate('chat')}
              className="text-xs text-brand-teal-bright underline font-mono mt-1"
            >
              Use Text Verification instead
            </button>
          )}
        </div>

        {/* Transcript Box */}
        {transcriptText && (
          <div className="w-full max-w-2xl bg-surface-container-low border border-border-subtle rounded-xl p-4 text-left animate-fade-up">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono uppercase text-text-muted">
                Spoken Query:
              </span>
              {currentResult?.conversation?.evidenceReused && (
                <span className="text-[10px] font-mono text-brand-teal-bright bg-brand-teal/10 px-2 py-0.5 rounded border border-brand-teal/30">
                  ⚡ Evidence Reused (0 Search Latency)
                </span>
              )}
            </div>
            <p className="font-sans text-sm md:text-base text-text-primary font-medium">
              "{transcriptText}"
            </p>
          </div>
        )}

        {/* Result & Verdict Card */}
        {currentResult && voiceState === 'RESPONDING' && (
          <div className="w-full max-w-2xl flex flex-col gap-4 animate-fade-up">
            <div className="bg-surface-elevated border border-border-subtle rounded-xl p-6 text-left shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <VerdictBadge verdict={currentResult.verdict} size="md" />
                <span className="text-xs font-mono text-text-muted">
                  Confidence: <strong className="text-brand-teal-bright">{currentResult.confidence}</strong>
                </span>
              </div>

              <p className="font-editorial text-base md:text-lg text-text-primary leading-relaxed">
                {currentResult.explanation}
              </p>

              {/* Audio Response Player */}
              {currentResult.audioUrl && (
                <AudioWavePlayer
                  audioUrl={apiClient.resolveAudioUrl(currentResult.audioUrl)}
                  autoPlay={true}
                  title={`VeriVoice Voice Response (${responseLanguage.toUpperCase()})`}
                />
              )}

              {/* Quick Conversational Follow-Up Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-[11px] font-mono text-text-muted uppercase">Follow-up:</span>
                <button
                  onClick={() => handleQuickFollowUp('Why is that?')}
                  className="px-2.5 py-1 bg-surface-container hover:bg-surface-container-high text-xs font-mono text-text-secondary hover:text-text-primary rounded border border-border-subtle transition-tactile"
                >
                  "Why?"
                </button>
                <button
                  onClick={() => handleQuickFollowUp('What did the primary source say?')}
                  className="px-2.5 py-1 bg-surface-container hover:bg-surface-container-high text-xs font-mono text-text-secondary hover:text-text-primary rounded border border-border-subtle transition-tactile"
                >
                  "What did the source say?"
                </button>
                <button
                  onClick={() => handleQuickFollowUp('Ab Urdu mein samjhao')}
                  className="px-2.5 py-1 bg-surface-container hover:bg-surface-container-high text-xs font-mono text-text-secondary hover:text-text-primary rounded border border-border-subtle transition-tactile"
                >
                  "اردو میں سمجھائیں"
                </button>
                <button
                  onClick={() => handleQuickFollowUp('Explain in Spanish')}
                  className="px-2.5 py-1 bg-surface-container hover:bg-surface-container-high text-xs font-mono text-text-secondary hover:text-text-primary rounded border border-border-subtle transition-tactile"
                >
                  "En Español"
                </button>
              </div>

              {/* Actions: View Evidence & Ask Follow-up */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border-subtle">
                <button
                  onClick={() => setShowEvidenceDrawer(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-brand-teal-bright hover:underline"
                >
                  <span className="material-symbols-outlined text-[16px]">account_tree</span>
                  <span>{t.chat.viewEvidence} ({currentResult.evidence?.length || activeEvidence.length || 0} Sources)</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleResetSession}
                    className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high rounded text-xs font-mono text-text-secondary border border-border-subtle"
                  >
                    {t.talk.newClaim}
                  </button>
                  <button
                    onClick={handleCoreClick}
                    className="px-3 py-1.5 bg-brand-teal hover:bg-brand-teal-dim text-white rounded text-xs font-mono font-medium shadow flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">mic</span>
                    <span>{t.hero.startTalk}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Hint Dock */}
      <div className="w-full py-2 text-center text-xs font-mono text-text-muted border-t border-border-subtle flex items-center justify-between px-2">
        <span>Tap Core to speak or interrupt · Max 30s per turn</span>
        <span className="hidden sm:inline">Session TTL: 5 mins inactivity</span>
      </div>

      {/* Slide-out Evidence Rail Drawer */}
      {showEvidenceDrawer && (
        <div
          onClick={() => setShowEvidenceDrawer(false)}
          className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-md animate-fade-up"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md h-full shadow-2xl border-l border-border-subtle"
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
