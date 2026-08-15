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

        // Release mic tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        resolve(finalBlob);
      };

      mediaRecorder.stop();
    });
  }, [cleanupAudioAnalysis, audioBlob]);

  const startRecording = useCallback(async (): Promise<boolean> => {
    resetRecording();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      });

      streamRef.current = stream;
      setHasPermission(true);

      // Supported MIME types
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')
          ? 'audio/ogg;codecs=opus'
          : '';
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
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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

      mediaRecorder.start(100);
      setIsRecording(true);
      setError(null);

      // Timer
      const startTime = Date.now();
      timerRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setRecordingDuration(elapsed);
        if (elapsed >= maxDurationSeconds) {
          stopRecording();
        }
      }, 1000);

      return true;
    } catch (err: unknown) {
      console.warn('Microphone permission or access error:', err);
      setHasPermission(false);
      setError('Microphone access denied. Please allow microphone permissions.');
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
