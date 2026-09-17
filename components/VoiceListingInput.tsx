'use client';

import React, { useEffect, useRef, useState } from 'react';

interface VoiceListingInputProps {
  onTranscriptionComplete: (text: string) => void;
  transcriptionEndpoint?: string;
  maxDurationMs?: number;
}

export const VoiceListingInput = ({
  onTranscriptionComplete,
  transcriptionEndpoint = '/api/v1/voice/transcription',
  maxDurationMs = 10_000
}: VoiceListingInputProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => stopRecording(), []);

  const clearRecordingResources = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    recorderRef.current = null;
    setIsRecording(false);
  };

  const stopRecording = () => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
  };

  const handleStartRecording = async () => {
    if (isRecording) return;
    setError(null);

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('El navegador no admite grabación de audio.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm';
      const recorder = new MediaRecorder(stream, { mimeType });
      const audioChunks: Blob[] = [];

      streamRef.current = stream;
      recorderRef.current = recorder;
      setIsRecording(true);
      recorder.ondataavailable = (event) => { if (event.data.size > 0) audioChunks.push(event.data); };
      recorder.onerror = () => { setError('No se pudo grabar el audio.'); clearRecordingResources(); };
      recorder.onstop = async () => {
        try {
          const formData = new FormData();
          formData.append('file', new Blob(audioChunks, { type: mimeType }), 'voice_listing.webm');
          formData.append('language', 'es');
          const response = await fetch(transcriptionEndpoint, { method: 'POST', body: formData });
          const data = await response.json();
          if (!response.ok || typeof data.text !== 'string' || !data.text.trim()) throw new Error(data.error || 'No se obtuvo una transcripción.');
          onTranscriptionComplete(data.text.trim());
        } catch (transcriptionError) {
          setError(transcriptionError instanceof Error ? transcriptionError.message : 'No se pudo transcribir el audio.');
        } finally {
          clearRecordingResources();
        }
      };

      recorder.start();
      timeoutRef.current = setTimeout(stopRecording, maxDurationMs);
    } catch (recordingError) {
      clearRecordingResources();
      setError(recordingError instanceof Error ? recordingError.message : 'No se concedió acceso al micrófono.');
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={isRecording ? stopRecording : handleStartRecording}
        aria-pressed={isRecording}
        className={`flex items-center gap-2 rounded-full px-4 py-3 font-bold ${isRecording ? 'animate-pulse bg-red-600 text-white' : 'bg-[#FF6A00] text-black'}`}
      >
        {isRecording ? 'Escuchando... (Dinleniyor)' : 'Grabar Descripción (Sesli İlan Ekle)'}
      </button>
      {error && <p role="alert" className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
};
