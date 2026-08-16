import { useState, useRef, useCallback, useEffect } from 'react';

export interface UseVoiceRecorderReturn {
  isRecording: boolean;
  recordingDuration: number;
  audioBlob: Blob | null;
  audioBase64: string | null;
  audioUrl: string | null;
  volumeLevel: number;
  error: string | null;
  startRecording: () => Promise<boolean>;
  stopRecording: () => Promise<Blob | null>;
  resetRecording: () => void;
  hasPermission: boolean | null;
}

export const useVoiceRecorder = (maxDurationSeconds: number = 30): UseVoiceRecorderReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Hardware State Lock to prevent race conditions & rapid double-taps
  const isStartingRef = useRef<boolean>(false);
  const lastStartTimeRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const cleanupAudioAnalysis = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setVolumeLevel(0);
  }, []);

  const resetRecording = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioBase64(null);
    setAudioUrl(null);
    setRecordingDuration(0);
    setError(null);
  }, [audioUrl]);

  const stopRecording = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      cleanupAudioAnalysis();

      const mediaRecorder = mediaRecorderRef.current;
      if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        setIsRecording(false);
        resolve(audioBlob);
        return;
      }

      mediaRecorder.onstop = async () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm;codecs=opus';
        const finalBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const duration = (Date.now() - startTimeRef.current) / 1000;

        // Minimum audio length guard (prevent accidental 0.2s taps)
        if (duration < 0.6 || finalBlob.size < 400) {
          setError('Audio recording was too brief. Please hold or speak clearly for up to 30 seconds.');
          setIsRecording(false);
          resolve(null);
          return;
        }

        const url = URL.createObjectURL(finalBlob);

        // Convert to Base64
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1];
          setAudioBase64(base64String);
        };
        reader.readAsDataURL(finalBlob);

        setAudioBlob(finalBlob);
        setAudioUrl(url);
        setIsRecording(false);
        setError(null);

        // Release mic tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        resolve(finalBlob);
      };

      try {
        mediaRecorder.stop();
      } catch (err) {
        console.warn('[useVoiceRecorder] Error stopping mediaRecorder:', err);
        setIsRecording(false);
        resolve(null);
      }
    });
  }, [cleanupAudioAnalysis, audioBlob]);

  const startRecording = useCallback(async (): Promise<boolean> => {
    const now = Date.now();
    // 300ms Hardware Debounce Lock: Ignore rapid double-clicks
    if (isStartingRef.current || now - lastStartTimeRef.current < 350) {
      return false;
    }

    isStartingRef.current = true;
    lastStartTimeRef.current = now;
    resetRecording();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('MediaDevices API not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      });

      streamRef.current = stream;
      setHasPermission(true);

      // Hardware Device Disconnection Listener (e.g. AirPods disconnect)
      stream.getAudioTracks().forEach((track) => {
        track.onended = () => {
          console.warn('[useVoiceRecorder] Audio track ended unexpectedly (device disconnected)');
          setError('Your audio input device was disconnected. Please tap retry.');
          stopRecording();
        };
      });

      // MIME Fallback Matrix: WebM -> MP4 (iOS) -> OGG -> Default
      let mimeType = 'audio/webm;codecs=opus';
      if (typeof MediaRecorder !== 'undefined') {
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          if (MediaRecorder.isTypeSupported('audio/mp4')) {
            mimeType = 'audio/mp4';
          } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
            mimeType = 'audio/ogg;codecs=opus';
          } else {
            mimeType = '';
          }
        }
      }

      const mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Set up real-time volume level analysis
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);
          analyserRef.current = analyser;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const checkVolume = () => {
            if (!analyserRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            setVolumeLevel(Math.min(1.0, avg / 128));
            animationFrameRef.current = requestAnimationFrame(checkVolume);
          };
          checkVolume();
        }
      } catch (audioCtxErr) {
        console.warn('[useVoiceRecorder] AudioContext volume meter not supported:', audioCtxErr);
      }

      mediaRecorder.start(100);
      startTimeRef.current = Date.now();
      setIsRecording(true);
      setError(null);

      // Timer
      timerRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setRecordingDuration(elapsed);
        if (elapsed >= maxDurationSeconds) {
          stopRecording();
        }
      }, 1000);

      isStartingRef.current = false;
      return true;
    } catch (err: unknown) {
      console.warn('[useVoiceRecorder] Microphone permission or access error:', err);
      isStartingRef.current = false;
      setHasPermission(false);
      setError('Microphone access blocked. Please enable microphone permissions or type your question.');
      setIsRecording(false);
      return false;
    }
  }, [resetRecording, maxDurationSeconds, stopRecording]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      cleanupAudioAnalysis();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cleanupAudioAnalysis]);

  return {
    isRecording,
    recordingDuration,
    audioBlob,
    audioBase64,
    audioUrl,
    volumeLevel,
    error,
    startRecording,
    stopRecording,
    resetRecording,
    hasPermission,
  };
};
