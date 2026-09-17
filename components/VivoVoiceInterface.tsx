'use client';

import React, { useRef, useState } from 'react';
import { VivoVoiceEngine, type VoiceSearchIntent } from '../services/vivoVoiceEngine';

interface SpeechRecognitionEventLike extends Event { results: { [index: number]: { [index: number]: { transcript: string } } }; }
interface SpeechRecognitionLike { lang: string; interimResults: boolean; maxAlternatives: number; onresult: ((event: SpeechRecognitionEventLike) => void) | null; onerror: (() => void) | null; onend: (() => void) | null; start: () => void; stop: () => void; }
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

export const VivoVoiceInterface = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsedIntent, setParsedIntent] = useState<VoiceSearchIntent | null>(null);
  const [message, setMessage] = useState('');
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const engine = new VivoVoiceEngine();

  const handleStartListening = () => {
    const SpeechRecognition = (window as Window & { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition || (window as Window & { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition;
    if (!SpeechRecognition) { setMessage('Este navegador no soporta Web Speech API. Puedes usar la búsqueda escrita.'); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-GT';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => { const detectedText = event.results[0][0].transcript; setTranscript(detectedText); setParsedIntent(engine.parseVoiceCommand(detectedText)); };
    recognition.onerror = () => { setMessage('No pudimos procesar el audio. Inténtalo de nuevo.'); setIsListening(false); };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    setMessage('');
    setTranscript('');
    setParsedIntent(null);
    setIsListening(true);
    recognition.start();
  };

  const stopListening = () => { recognitionRef.current?.stop(); setIsListening(false); };

  return <section className="my-4 w-full rounded-3xl border border-[#FF6B00]/40 bg-[#002E5D]/95 p-5 text-white shadow-2xl backdrop-blur-xl" aria-label="VIVO VOICE assistant"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><button type="button" onClick={isListening ? stopListening : handleStartListening} aria-label={isListening ? 'Stop listening' : 'Start voice search'} className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-bold transition-all ${isListening ? 'animate-pulse bg-red-500 text-white' : 'bg-[#FF6B00] text-white shadow-lg hover:bg-[#e05e00]'}`}>{isListening ? 'Stop' : 'Voice'}</button><div><h2 className="flex items-center gap-2 text-sm font-extrabold">VIVO-VOICE ASISTENTE <span className="rounded-full border border-[#10b981]/40 bg-[#10b981]/20 px-2 py-0.5 font-mono text-[10px] text-[#6ee7b7]">BIOMETRIC AI</span></h2><p className="mt-0.5 text-xs text-slate-300">{isListening ? 'Escuchando...' : 'Busca, publica o prepara una acción por voz.'}</p></div></div></div>{transcript && <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-xs font-mono text-slate-200"><span className="font-bold text-[#FF6B00]">Transcripción:</span> “{transcript}”</div>}{parsedIntent && <div className="mt-3 flex items-center justify-between rounded-xl border border-[#10b981]/30 bg-[#10b981]/10 p-3 text-xs"><span className="font-bold text-[#6ee7b7]">Acción: {parsedIntent.action} · Categoría: {parsedIntent.category || 'GENERAL'}</span>{parsedIntent.maxPriceGTQ && <span className="rounded-md bg-[#10b981]/30 px-2 py-0.5 font-mono text-white">Máx: Q {parsedIntent.maxPriceGTQ.toLocaleString('es-GT')}</span>}</div>}{message && <p className="mt-3 text-xs text-amber-200" role="alert">{message}</p>}</section>;
};