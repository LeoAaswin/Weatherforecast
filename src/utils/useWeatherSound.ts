import { useRef, useEffect, useCallback } from 'react';

export type WeatherSoundType = 'rain' | 'thunder' | 'snow' | 'wind' | 'none';

const SOUND_MAP: Record<Exclude<WeatherSoundType, 'none'>, string> = {
  rain:    '/sound/rain.mp3',
  thunder: '/sound/thunder.mp3',
  snow:    '/sound/snow.mp3',
  wind:    '/sound/wind.mp3',
};

const TARGET_VOLUME = 0.45;
const FADE_IN_S     = 2.0;
const FADE_OUT_S    = 1.2;

export function getWeatherSoundType(conditionId: number): WeatherSoundType {
  if (conditionId >= 200 && conditionId < 300) return 'thunder';
  if (conditionId >= 300 && conditionId < 600) return 'rain';
  if (conditionId >= 600 && conditionId < 700) return 'snow';
  if (conditionId >= 700 && conditionId < 800) return 'wind';
  return 'none';
}

export function useWeatherSound(conditionId: number | null, enabled: boolean) {
  const ctxRef          = useRef<AudioContext | null>(null);
  const sourceRef       = useRef<AudioBufferSourceNode | null>(null);
  const gainRef         = useRef<GainNode | null>(null);
  // Cache decoded AudioBuffers so repeat plays are instant
  const bufferCache     = useRef<Map<string, AudioBuffer>>(new Map());
  const currentTypeRef  = useRef<WeatherSoundType | null>(null);

  // ── Get or create AudioContext ───────────────────────────────────────────
  const getCtx = useCallback((): AudioContext => {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new (
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext!
      )();
    }
    return ctxRef.current;
  }, []);

  // ── Fetch → decode → cache ───────────────────────────────────────────────
  const getBuffer = useCallback(
    async (url: string): Promise<AudioBuffer> => {
      if (bufferCache.current.has(url)) {
        return bufferCache.current.get(url)!;
      }
      const ctx = getCtx();
      const res = await fetch(url);
      const raw = await res.arrayBuffer();
      const buf = await ctx.decodeAudioData(raw);
      bufferCache.current.set(url, buf);
      return buf;
    },
    [getCtx]
  );

  // ── Stop current source (with optional fade-out) ─────────────────────────
  const stopSource = useCallback((immediate = false) => {
    const gain = gainRef.current;
    const ctx  = ctxRef.current;
    const src  = sourceRef.current;

    if (gain && ctx) {
      const now = ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);

      if (immediate) {
        gain.gain.setValueAtTime(0, now);
        try { src?.stop(0); } catch { /* already stopped */ }
      } else {
        gain.gain.linearRampToValueAtTime(0, now + FADE_OUT_S);
        // stop the source after the fade finishes
        const capturedSrc = src;
        setTimeout(() => {
          try { capturedSrc?.stop(0); } catch { /* already stopped */ }
        }, (FADE_OUT_S + 0.15) * 1000);
      }
    }

    sourceRef.current  = null;
    gainRef.current    = null;
    currentTypeRef.current = null;
  }, []);

  // ── Start a new looping sound ────────────────────────────────────────────
  const playSound = useCallback(
    async (soundType: Exclude<WeatherSoundType, 'none'>) => {
      // Already playing this exact track — leave it running
      if (currentTypeRef.current === soundType) return;

      // Fade out the previous track (non-blocking)
      stopSource(false);

      try {
        const ctx = getCtx();
        if (ctx.state === 'suspended') await ctx.resume();

        const buffer = await getBuffer(SOUND_MAP[soundType]);

        // GainNode for smooth fade in/out
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(TARGET_VOLUME, ctx.currentTime + FADE_IN_S);
        gain.connect(ctx.destination);

        // AudioBufferSourceNode loops at sample level — no MP3-encoder gap
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop   = true;   // ← truly gapless: jumps sample-perfect to start
        source.connect(gain);
        source.start(0);

        sourceRef.current     = source;
        gainRef.current       = gain;
        currentTypeRef.current = soundType;
      } catch (err) {
        console.warn('[WeatherSound] playback error:', err);
      }
    },
    [getBuffer, getCtx, stopSource]
  );

  // ── React to enabled / conditionId changes ───────────────────────────────
  useEffect(() => {
    if (enabled && conditionId !== null) {
      const soundType = getWeatherSoundType(conditionId);
      if (soundType !== 'none') {
        playSound(soundType);
      } else {
        stopSource(false);
      }
    } else {
      stopSource(false);
    }

    // Hard stop on unmount (component is gone, no fade needed)
    return () => stopSource(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, conditionId]);
}
