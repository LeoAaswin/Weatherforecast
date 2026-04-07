import { useRef, useEffect, useCallback } from 'react';

export type WeatherSoundType = 'rain' | 'thunder' | 'snow' | 'wind' | 'none';

export function getWeatherSoundType(conditionId: number): WeatherSoundType {
  if (conditionId >= 200 && conditionId < 300) return 'thunder';
  if (conditionId >= 300 && conditionId < 600) return 'rain';
  if (conditionId >= 600 && conditionId < 700) return 'snow';
  if (conditionId >= 700 && conditionId < 800) return 'wind';
  return 'none';
}

export function useWeatherSound(conditionId: number | null, enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const sourceNodesRef = useRef<(AudioBufferSourceNode | OscillatorNode)[]>([]);
  const masterGainRef = useRef<GainNode | null>(null);
  const thunderTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const stopAllImmediate = useCallback(() => {
    if (thunderTimerRef.current) {
      clearTimeout(thunderTimerRef.current);
      thunderTimerRef.current = null;
    }
    sourceNodesRef.current.forEach((node) => {
      try {
        node.stop(0);
      } catch {
        // already stopped
      }
    });
    sourceNodesRef.current = [];
  }, []);

  const createWhiteNoise = useCallback(
    (ctx: AudioContext, seconds = 3): AudioBufferSourceNode => {
      const len = ctx.sampleRate * seconds;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      return src;
    },
    []
  );

  const scheduleThunder = useCallback(
    (ctx: AudioContext, masterGain: GainNode) => {
      const rumble = ctx.createOscillator();
      rumble.type = 'sawtooth';
      rumble.frequency.value = 28 + Math.random() * 18;

      const rumbleGain = ctx.createGain();
      const now = ctx.currentTime;
      rumbleGain.gain.setValueAtTime(0, now);
      rumbleGain.gain.linearRampToValueAtTime(0.38, now + 0.25);
      rumbleGain.gain.exponentialRampToValueAtTime(0.001, now + 3.8);

      // soft saturation curve
      const shaper = ctx.createWaveShaper();
      const curve = new Float32Array(256);
      for (let i = 0; i < 256; i++) {
        const x = (i * 2) / 256 - 1;
        curve[i] = (Math.PI + 180) * x / (Math.PI + 180 * Math.abs(x));
      }
      shaper.curve = curve;

      rumble.connect(shaper);
      shaper.connect(rumbleGain);
      rumbleGain.connect(masterGain);

      rumble.start(now);
      rumble.stop(now + 4.5);
      sourceNodesRef.current.push(rumble);

      const nextMs = 7000 + Math.random() * 13000;
      thunderTimerRef.current = setTimeout(() => {
        if (ctxRef.current && masterGainRef.current) {
          scheduleThunder(ctxRef.current, masterGainRef.current);
        }
      }, nextMs);
    },
    []
  );

  // ── Main start/stop ───────────────────────────────────────────────────────

  const startSound = useCallback(
    async (soundType: WeatherSoundType) => {
      if (soundType === 'none') return;

      if (!ctxRef.current) {
        ctxRef.current = new (
          window.AudioContext ||
          (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext!
        )();
      }
      const ctx = ctxRef.current;
      if (ctx.state === 'suspended') await ctx.resume();

      stopAllImmediate();

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.45, ctx.currentTime + 2);
      masterGain.connect(ctx.destination);
      masterGainRef.current = masterGain;

      // ── Rain / Thunderstorm ──
      if (soundType === 'rain' || soundType === 'thunder') {
        const noise = createWhiteNoise(ctx);
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = soundType === 'thunder' ? 850 : 1300;
        bp.Q.value = 0.65;

        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 280;

        noise.connect(hp);
        hp.connect(bp);
        bp.connect(masterGain);
        noise.start();
        sourceNodesRef.current.push(noise);

        if (soundType === 'thunder') {
          const delay = 2500 + Math.random() * 3000;
          thunderTimerRef.current = setTimeout(
            () => scheduleThunder(ctx, masterGain),
            delay
          );
        }
      }

      // ── Snow / Wind / Fog ──
      if (soundType === 'snow' || soundType === 'wind') {
        const noise = createWhiteNoise(ctx);

        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = soundType === 'snow' ? 180 : 550;

        // LFO makes wind "breathe"
        const lfo = ctx.createOscillator();
        lfo.frequency.value = soundType === 'snow' ? 0.06 : 0.22;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = soundType === 'snow' ? 40 : 180;
        lfo.connect(lfoGain);
        lfoGain.connect(lp.frequency);

        const trimGain = ctx.createGain();
        trimGain.gain.value = soundType === 'snow' ? 0.45 : 0.75;

        noise.connect(lp);
        lp.connect(trimGain);
        trimGain.connect(masterGain);
        noise.start();
        lfo.start();
        sourceNodesRef.current.push(noise, lfo);
      }
    },
    [createWhiteNoise, scheduleThunder, stopAllImmediate]
  );

  const fadeOutAndStop = useCallback(() => {
    if (masterGainRef.current && ctxRef.current) {
      const now = ctxRef.current.currentTime;
      masterGainRef.current.gain.setValueAtTime(
        masterGainRef.current.gain.value,
        now
      );
      masterGainRef.current.gain.linearRampToValueAtTime(0, now + 1.4);
    }
    setTimeout(stopAllImmediate, 1600);
  }, [stopAllImmediate]);

  // ── Effect ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (enabled && conditionId !== null) {
      const soundType = getWeatherSoundType(conditionId);
      if (soundType !== 'none') {
        startSound(soundType);
      } else {
        fadeOutAndStop();
      }
    } else {
      fadeOutAndStop();
    }

    return () => {
      stopAllImmediate();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, conditionId]);
}
