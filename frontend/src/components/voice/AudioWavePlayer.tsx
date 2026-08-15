import React from 'react';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';

interface AudioWavePlayerProps {
  audioUrl?: string | null;
  title?: string;
  autoPlay?: boolean;
  className?: string;
}

export const AudioWavePlayer: React.FC<AudioWavePlayerProps> = ({
  audioUrl,
  title = 'Listen to Spoken Verification Response',
  autoPlay = false,
  className = '',
}) => {
  const { isPlaying, currentTime, duration, progress, toggle, seekPercent, error } = useAudioPlayer(audioUrl);

  React.useEffect(() => {
    if (autoPlay && audioUrl) {
      toggle();
    }
  }, [autoPlay, audioUrl, toggle]);

  if (!audioUrl) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
    seekPercent(percent);
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
          <span>{formatTime(currentTime)}</span> / <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Play/Pause Button */}
        <button
          onClick={toggle}
          className="w-10 h-10 rounded-full bg-brand-navy-light text-brand-navy-deep hover:bg-white flex items-center justify-center transition-tactile flex-shrink-0 shadow"
          aria-label={isPlaying ? 'Pause spoken response' : 'Play spoken response'}
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {isPlaying ? 'pause' : 'play_arrow'}
          </span>
        </button>

        {/* Waveform Bars Container */}
        <div
          onClick={handleBarClick}
          className="flex-1 h-10 flex items-center justify-between gap-[3px] px-2 py-1 bg-surface-container rounded-lg cursor-pointer hover:bg-surface-container-high transition-colors"
          role="slider"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Audio progress scrubber"
        >
          {bars.map((heightPercent, idx) => {
            const barProgress = (idx / bars.length) * 100;
            const isFilled = barProgress <= progress;

            return (
              <div
                key={idx}
                className="w-full flex-1 rounded-full transition-all duration-150"
                style={{
                  height: `${heightPercent}%`,
                  backgroundColor: isFilled ? '#7ED4D6' : '#2A2A2A',
                  boxShadow: isFilled && isPlaying ? '0 0 6px rgba(126,212,214,0.4)' : 'none',
                }}
              />
            );
          })}
        </div>
      </div>

      {error && (
        <span className="text-xs font-mono text-verdict-false">{error}</span>
      )}
    </div>
  );
};
