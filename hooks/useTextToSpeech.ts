import { useState, useCallback, useEffect, useRef } from 'react';
import { generateSpeech } from '../services/geminiService';

// Helper function to decode base64 string to Uint8Array
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper function to decode raw PCM audio data into an AudioBuffer
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
): Promise<AudioBuffer> {
  const sampleRate = 24000; // Gemini TTS sample rate
  const numChannels = 1; // Gemini TTS is mono
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < frameCount; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
}

const audioCache = new Map<string, AudioBuffer>();

export const useTextToSpeech = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      } else {
        console.error("Web Audio API is not supported in this browser.");
      }
    }
    
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(console.error);
      }
    };
  }, []);

  const prefetch = useCallback(async (text: string) => {
    if (!text || audioCache.has(text) || !audioContextRef.current) return;
    try {
      const base64Audio = await generateSpeech(text);
      const audioContext = audioContextRef.current;
      const audioData = decode(base64Audio);
      const audioBuffer = await decodeAudioData(audioData, audioContext);
      audioCache.set(text, audioBuffer);
    } catch (err) {
      console.error('Failed to prefetch audio:', err);
    }
  }, []);

  const cancel = useCallback(() => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.onended = null; // Prevent onended from firing on manual stop
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
    }
    setIsLoading(false);
    setIsPlaying(false);
  }, []);

  const speak = useCallback(async (text: string) => {
    if (!audioContextRef.current || !text) return;

    // Always cancel current speech before starting a new one.
    if (sourceNodeRef.current) {
      sourceNodeRef.current.onended = null;
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
    setIsLoading(true);

    try {
      const audioContext = audioContextRef.current;

      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      let audioBuffer: AudioBuffer;
      if (audioCache.has(text)) {
        audioBuffer = audioCache.get(text)!;
      } else {
        console.warn(`Audio cache miss for: "${text.substring(0, 30)}..."`);
        const base64Audio = await generateSpeech(text);
        const audioData = decode(base64Audio);
        audioBuffer = await decodeAudioData(audioData, audioContext);
        audioCache.set(text, audioBuffer);
      }

      const sourceNode = audioContext.createBufferSource();
      sourceNode.buffer = audioBuffer;
      sourceNode.connect(audioContext.destination);
      
      sourceNode.onended = () => {
        setIsPlaying(false);
        sourceNodeRef.current = null;
      };
      
      sourceNodeRef.current = sourceNode;
      setIsLoading(false);
      setIsPlaying(true);
      sourceNode.start();

    } catch (err) {
      console.error('Failed to play audio:', err);
      setIsLoading(false);
      setIsPlaying(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return { isSpeaking: isLoading || isPlaying, speak, cancel, prefetch };
};
