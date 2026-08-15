import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseAudioPlayerReturn {
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  progress: number;
  play: (url?: string) => Promise<void>;
  pause: () => void;
  toggle: () => Promise<void>;
  seek: (seconds: number) => void;
  seekPercent: (percent: number) => void;
  audioRef: React.RefObject<HTMLAudioElement>;
  error: string | null;
}

export const useAudioPlayer = (initialUrl?: string | null): UseAudioPlayerReturn => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setError(null);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      setIsPlaying(false);
      setError('Failed to load spoken audio response.');
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    if (initialUrl) {
      audio.src = initialUrl;
    }

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.src = '';
    };
  }, []);

  useEffect(() => {
    if (audioRef.current && initialUrl) {
      if (audioRef.current.src !== initialUrl) {
        audioRef.current.src = initialUrl;
        audioRef.current.load();
      }
    }
  }, [initialUrl]);

  const play = useCallback(async (url?: string) => {
    if (!audioRef.current) return;
    try {
      if (url && audioRef.current.src !== url) {
        audioRef.current.src = url;
        audioRef.current.load();
      }
      await audioRef.current.play();
      setError(null);
    } catch (err: unknown) {
      console.warn('Audio play error:', err);
      setError('Audio playback blocked or unavailable.');
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const toggle = useCallback(async () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      await play();
    } else {
      pause();
    }
  }, [play, pause]);

  const seek = useCallback((seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  }, []);

  const seekPercent = useCallback((percent: number) => {
    if (audioRef.current && duration > 0) {
      const target = (percent / 100) * duration;
      seek(target);
    }
  }, [duration, seek]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return {
    isPlaying,
    duration,
    currentTime,
    progress,
    play,
    pause,
    toggle,
    seek,
    seekPercent,
    audioRef,
    error,
  };
};
