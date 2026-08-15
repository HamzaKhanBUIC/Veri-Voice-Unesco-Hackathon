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
  const audioObjRef = useRef<HTMLAudioElement | null>(null);

  // Auto-detect language from text content
  const detectedLang = (() => {
    const text = spokenText || '';
    if (/[\u0600-\u06FF]/.test(text)) return 'ur';
    if (/[áéíóúñ¿¡]/i.test(text)) return 'es';
    if (/\b(adalah|tidak|vaksin|kesehatan|bumi|datar)\b/i.test(text)) return 'id';
    return (lang || 'en').toLowerCase();
  })();

  const displayTitle = title.includes('(') ? title : `SPOKEN VERDICT (${detectedLang.toUpperCase()})`;

  // High-Quality Multilingual Neural Audio Player (Urdu, Spanish, Indonesian, English)
  const speakText = (text: string) => {
    if (typeof window === 'undefined') return;

    const cleanText = text.replace(/<[^>]*>/g, '').replace(/[*_#`[\]()]/g, '').trim();
    if (!cleanText) return;

    // Stop any existing playing audio
    if (audioObjRef.current) {
      audioObjRef.current.pause();
      audioObjRef.current = null;
    }
    window.speechSynthesis?.cancel();

    // Stream real Neural TTS Audio from backend /api/tts if relative endpoint
    const ttsText = cleanText.length > 250 ? cleanText.substring(0, 247) + '...' : cleanText;
    const ttsUrl = `/api/tts?text=${encodeURIComponent(ttsText)}&lang=${detectedLang}`;

    const audio = new Audio(ttsUrl);
    audioObjRef.current = audio;
    setSynthPlaying(true);

    audio.onended = () => {
      setSynthPlaying(false);
      audioObjRef.current = null;
    };

    const configureFemaleVoice = (utterance: SpeechSynthesisUtterance) => {
      utterance.lang = detectedLang === 'ur' ? 'ur-PK' : detectedLang === 'es' ? 'es-ES' : detectedLang === 'id' ? 'id-ID' : 'en-US';
      utterance.pitch = 1.08;
      utterance.rate = 0.95;

      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          const code = (detectedLang || 'en').toLowerCase().split('-')[0];
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
      // Fallback to native browser SpeechSynthesis if network audio stream fails
      audioObjRef.current = null;
      if (window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(cleanText);
        configureFemaleVoice(utterance);
        utterance.onend = () => setSynthPlaying(false);
        utterance.onerror = () => setSynthPlaying(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setSynthPlaying(false);
      }
    };

    audio.play().catch(() => {
      // Fallback if browser autoplay policies block direct Audio.play()
      if (window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(cleanText);
        configureFemaleVoice(utterance);
        utterance.onend = () => setSynthPlaying(false);
        utterance.onerror = () => setSynthPlaying(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setSynthPlaying(false);
      }
    });
  };

  const handleToggleSpeech = () => {
    if (audioUrl && !error) {
      toggle().catch(() => {
        if (spokenText) speakText(spokenText);
      });
    } else if (spokenText) {
      if (synthPlaying) {
        if (audioObjRef.current) {
          audioObjRef.current.pause();
          audioObjRef.current = null;
        }
        window.speechSynthesis?.cancel();
        setSynthPlaying(false);
      } else {
        speakText(spokenText);
      }
    }
  };

  useEffect(() => {
    if (autoPlay) {
      if (audioUrl && !error && autoPlayedUrlRef.current !== audioUrl) {
        autoPlayedUrlRef.current = audioUrl;
        play(audioUrl).catch(() => {
          if (spokenText) speakText(spokenText);
        });
      } else if (spokenText && autoPlayedUrlRef.current !== spokenText) {
        autoPlayedUrlRef.current = spokenText;
        speakText(spokenText);
      }
    }
  }, [autoPlay, audioUrl, spokenText, play, error]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioObjRef.current) {
        audioObjRef.current.pause();
        audioObjRef.current = null;
      }
      window.speechSynthesis?.cancel();
    };
  }, []);

  const activePlaying = isPlaying || synthPlaying;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioUrl && !error) {
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
          <span className="text-xs font-mono uppercase tracking-wider text-text-secondary">{displayTitle}</span>
        </div>
        <div className="text-xs font-mono text-text-muted">
          <span>{audioUrl && !error ? formatTime(currentTime) : 'Neural Voice'}</span>
          {audioUrl && !error && <span> / {formatTime(duration)}</span>}
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
          title={audioUrl && !error ? 'Click to seek audio' : 'Audio waveform'}
        >
          {bars.map((height, idx) => {
            const isPlayed = ((idx + 1) / bars.length) * 100 <= (audioUrl && !error ? progress : activePlaying ? ((Date.now() / 150) % 28) : 0);
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
    </div>
  );
};
