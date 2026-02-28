import { useState, useRef, useCallback } from 'react';

const MAX_DURATION_MS = 30000;
const VOLUME_UPDATE_MS = 100;

interface UseVoiceInputReturn {
  isRecording: boolean;
  volume: number; // 0-1
  duration: number; // ms
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>; // returns transcribed text or null
}

export function useVoiceInput(groqApiKey?: string): UseVoiceInputReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [volume, setVolume] = useState(0);
  const [duration, setDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const volumeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const maxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const startTimeRef = useRef<number>(0);

  const cleanup = useCallback(() => {
    if (volumeIntervalRef.current) clearInterval(volumeIntervalRef.current);
    if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    if (maxTimerRef.current) clearTimeout(maxTimerRef.current);
    if (audioCtxRef.current) { audioCtxRef.current.close(); audioCtxRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    setVolume(0);
    setDuration(0);
  }, []);

  const startRecording = useCallback(async () => {
    if (isRecording) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up analyser for volume metering
      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      volumeIntervalRef.current = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setVolume(Math.min(1, avg / 128));
      }, VOLUME_UPDATE_MS);

      // Duration tracking
      startTimeRef.current = Date.now();
      durationIntervalRef.current = setInterval(() => {
        setDuration(Date.now() - startTimeRef.current);
      }, 100);

      // Max duration auto-stop
      maxTimerRef.current = setTimeout(() => {
        mediaRecorderRef.current?.stop();
      }, MAX_DURATION_MS);

      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone access failed:', err);
    }
  }, [isRecording]);

  const stopRecording = useCallback((): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || !isRecording) {
        resolve(null);
        return;
      }

      mediaRecorderRef.current.onstop = async () => {
        setIsRecording(false);
        cleanup();

        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        chunksRef.current = [];

        // Try Groq Whisper API
        if (groqApiKey) {
          try {
            const formData = new FormData();
            formData.append('file', blob, 'audio.webm');
            formData.append('model', 'whisper-large-v3');

            const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
              method: 'POST',
              headers: { Authorization: `Bearer ${groqApiKey}` },
              body: formData,
            });

            if (response.ok) {
              const data = await response.json() as { text?: string };
              resolve(data.text ?? null);
              return;
            }
          } catch (err) {
            console.error('Groq transcription failed:', err);
          }
        }

        // Fallback: Web Speech API (best-effort)
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
          resolve(null); // Transcription not available without API key
        } else {
          resolve(null);
        }
      };

      mediaRecorderRef.current.stop();
    });
  }, [isRecording, cleanup, groqApiKey]);

  return { isRecording, volume, duration, startRecording, stopRecording };
}
