import React, { useState, useEffect, useRef } from 'react';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';

interface AudioWavePlayerProps {
  audioUrl?: string | null;
  spokenText?: string;
  lang?: string;
  title?: string;
  autoPlay?: boolean;
  className?: string;
}

export const AudioWavePlayer: React.FC<AudioWavePlayerProps> = ({
  audioUrl,
  spokenText,
  lang = 'en',
  title = 'Listen to Spoken Verification Response',
  autoPlay = false,
  className = '',
}) => {
  const { isPlaying, currentTime, duration, progress, play, toggle, seekPercent, error } = useAudioPlayer(audioUrl);
  const autoPlayedUrlRef = useRef<string | null>(null);
  const [synthPlaying, setSynthPlaying] = useState(false);

  // Browser SpeechSynthesis Fallback when no static MP3 is available
  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set language code
    if (lang === 'ur') utterance.lang = 'ur-PK';
    else if (lang === 'es') utterance.lang = 'es-ES';
    else if (lang === 'id') utterance.lang = 'id-ID';
    else utterance.lang = 'en-US';

    utterance.rate = 0.95;
    utterance.onstart = () => setSynthPlaying(true);
    utterance.onend = () => setSynthPlaying(false);
    utterance.onerror = () => setSynthPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleToggleSpeech = () => {
    if (audioUrl) {
      toggle();
    } else if (spokenText) {
      if (synthPlaying) {
        window.speechSynthesis?.cancel();
        setSynthPlaying(false);
      } else {
        speakText(spokenText);
      }
    }
  };

  useEffect(() => {
    if (autoPlay) {
      if (audioUrl && autoPlayedUrlRef.current !== audioUrl) {
        autoPlayedUrlRef.current = audioUrl;
        play(audioUrl);
      } else if (spokenText && !audioUrl && autoPlayedUrlRef.current !== spokenText) {
        autoPlayedUrlRef.current = spokenText;
        speakText(spokenText);
      }
    }
  }, [autoPlay, audioUrl, spokenText, play]);

  const activePlaying = isPlaying || synthPlaying;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioUrl) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percent = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
      seekPercent(percent);
    }
  };

  // 28 simulated audio waveform bars
  const bars = [18, 32, 45, 60, 80, 55, 30, 42, 65, 90, 75, 50, 35, 60, 85, 95, 70, 48, 38, 62, 78, 52, 34, 48, 66, 40, 25, 15];

  return (
    <div className={`bg-surface-elevated border border-border-subtle rounded-xl p-4 flex flex-col gap-3 shadow-md ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-brand-teal-bright text-[18px]">volume_up</span>
          <span className="text-xs font-mono uppercase tracking-wider text-text-secondary">{title}</span>
        </div>
        <div className="text-xs font-mono text-text-muted">
          <span>{audioUrl ? formatTime(currentTime) : 'Voice Synth'}</span>
          {audioUrl && <span> / {formatTime(duration)}</span>}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Play/Pause Button */}
        <button
          onClick={handleToggleSpeech}
          className="w-10 h-10 rounded-full bg-brand-teal hover:bg-brand-teal-dim text-white flex items-center justify-center flex-shrink-0 transition-tactile shadow-md shadow-brand-teal/20"
          aria-label={activePlaying ? 'Pause audio' : 'Play audio'}
        >
          <span className="material-symbols-outlined text-[20px]">
            {activePlaying ? 'pause' : 'play_arrow'}
          </span>
        </button>

        {/* Dynamic Waveform Visualizer */}
        <div
          onClick={handleBarClick}
          className="flex-1 h-10 flex items-center gap-1 cursor-pointer group py-1"
          title={audioUrl ? 'Click to seek audio' : 'Audio waveform'}
        >
          {bars.map((height, idx) => {
            const isPlayed = ((idx + 1) / bars.length) * 100 <= (audioUrl ? progress : activePlaying ? ((Date.now() / 150) % 28) : 0);
            return (
              <div
                key={idx}
                className={`flex-1 rounded-full transition-all duration-150 ${
                  isPlayed
                    ? 'bg-brand-teal-bright'
                    : 'bg-white/[0.1] group-hover:bg-white/[0.2]'
                } ${activePlaying ? 'animate-pulse' : ''}`}
                style={{
                  height: `${activePlaying ? Math.max(20, (height * ((idx % 3) + 1)) % 100) : height}%`,
                  transitionDelay: `${idx * 10}ms`,
                }}
              />
            );
          })}
        </div>
      </div>

      {error && (
        <span className="text-xs text-verdict-false font-mono">
          Audio stream note: {error}
        </span>
      )}
    </div>
  );
};
