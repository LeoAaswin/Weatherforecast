'use client';
import React, { useMemo } from 'react';
import styles from './WeatherBackground.module.scss';

type WeatherType =
  | 'thunder'
  | 'drizzle'
  | 'rain'
  | 'snow'
  | 'fog'
  | 'clear-day'
  | 'clear-night'
  | 'cloudy'
  | 'none';

function getWeatherType(conditionId: number): WeatherType {
  const hour = new Date().getHours();
  if (conditionId >= 200 && conditionId < 300) return 'thunder';
  if (conditionId >= 300 && conditionId < 400) return 'drizzle';
  if (conditionId >= 500 && conditionId < 600) return 'rain';
  if (conditionId >= 600 && conditionId < 700) return 'snow';
  if (conditionId >= 700 && conditionId < 800) return 'fog';
  if (conditionId === 800) return hour >= 6 && hour < 19 ? 'clear-day' : 'clear-night';
  if (conditionId >= 801) return 'cloudy';
  return 'none';
}

interface WeatherBackgroundProps {
  conditionId: number;
}

const WeatherBackground: React.FC<WeatherBackgroundProps> = ({ conditionId }) => {
  const type = getWeatherType(conditionId);

  const rainDrops = useMemo(
    () =>
      Array.from({ length: 65 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 0.5 + Math.random() * 0.35,
        opacity: 0.25 + Math.random() * 0.45,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [type]
  );

  const snowFlakes = useMemo(
    () =>
      Array.from({ length: 55 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 3 + Math.random() * 6,
        delay: Math.random() * 6,
        duration: 5 + Math.random() * 6,
        drift: (Math.random() - 0.5) * 80,
        opacity: 0.55 + Math.random() * 0.35,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [type]
  );

  const stars = useMemo(
    () =>
      Array.from({ length: 90 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 70,
        size: 1 + Math.random() * 2.5,
        delay: Math.random() * 5,
        duration: 2 + Math.random() * 3,
        opacity: 0.4 + Math.random() * 0.55,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [type]
  );

  const cloudBlobs = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        id: i,
        top: 3 + i * 12,
        delay: i * 3.5,
        duration: 22 + i * 7,
        opacity: 0.05 + Math.random() * 0.07,
        scale: 0.8 + Math.random() * 0.7,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [type]
  );

  const sunParticles = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 2 + Math.random() * 5,
        delay: Math.random() * 7,
        duration: 5 + Math.random() * 7,
        opacity: 0.12 + Math.random() * 0.18,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [type]
  );

  const fogLayers = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        id: i,
        top: 8 + i * 14,
        delay: i * 2,
        duration: 14 + i * 4,
        opacity: 0.04 + i * 0.012,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [type]
  );

  return (
    <div className={styles.weatherBg} aria-hidden="true">
      {/* ── THUNDER ── heavy rain + lightning flash */}
      {type === 'thunder' && (
        <>
          {rainDrops.map((p) => (
            <div
              key={p.id}
              className={`${styles.drop} ${styles.heavy}`}
              style={
                {
                  left: `${p.left}%`,
                  animationDelay: `${p.delay}s`,
                  animationDuration: `${p.duration}s`,
                  opacity: p.opacity,
                } as React.CSSProperties
              }
            />
          ))}
          <div className={styles.lightning} />
        </>
      )}

      {/* ── RAIN ── */}
      {type === 'rain' &&
        rainDrops.map((p) => (
          <div
            key={p.id}
            className={styles.drop}
            style={
              {
                left: `${p.left}%`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration + 0.3}s`,
                opacity: p.opacity,
              } as React.CSSProperties
            }
          />
        ))}

      {/* ── DRIZZLE ── lighter / fewer drops */}
      {type === 'drizzle' &&
        rainDrops.slice(0, 38).map((p) => (
          <div
            key={p.id}
            className={`${styles.drop} ${styles.drizzle}`}
            style={
              {
                left: `${p.left}%`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration + 0.8}s`,
                opacity: p.opacity * 0.55,
              } as React.CSSProperties
            }
          />
        ))}

      {/* ── SNOW ── */}
      {type === 'snow' &&
        snowFlakes.map((p) => (
          <div
            key={p.id}
            className={styles.snowflake}
            style={
              {
                left: `${p.left}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
                '--drift': `${p.drift}px`,
                opacity: p.opacity,
              } as React.CSSProperties
            }
          />
        ))}

      {/* ── CLEAR NIGHT ── twinkling stars */}
      {type === 'clear-night' &&
        stars.map((p) => (
          <div
            key={p.id}
            className={styles.star}
            style={
              {
                left: `${p.left}%`,
                top: `${p.top}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
                opacity: p.opacity,
              } as React.CSSProperties
            }
          />
        ))}

      {/* ── CLEAR DAY ── sun glow + floating light dust */}
      {type === 'clear-day' && (
        <>
          <div className={styles.sunGlow} />
          <div className={styles.sunRays} />
          {sunParticles.map((p) => (
            <div
              key={p.id}
              className={styles.sunParticle}
              style={
                {
                  left: `${p.left}%`,
                  top: `${p.top}%`,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  animationDelay: `${p.delay}s`,
                  animationDuration: `${p.duration}s`,
                  opacity: p.opacity,
                } as React.CSSProperties
              }
            />
          ))}
        </>
      )}

      {/* ── CLOUDY ── drifting cloud blobs */}
      {type === 'cloudy' &&
        cloudBlobs.map((c) => (
          <div
            key={c.id}
            className={styles.cloud}
            style={
              {
                top: `${c.top}%`,
                animationDelay: `${c.delay}s`,
                animationDuration: `${c.duration}s`,
                opacity: c.opacity,
                transform: `scale(${c.scale})`,
              } as React.CSSProperties
            }
          />
        ))}

      {/* ── FOG ── slow horizontal layers */}
      {type === 'fog' &&
        fogLayers.map((f) => (
          <div
            key={f.id}
            className={styles.fogLayer}
            style={
              {
                top: `${f.top}%`,
                animationDelay: `${f.delay}s`,
                animationDuration: `${f.duration}s`,
                opacity: f.opacity,
              } as React.CSSProperties
            }
          />
        ))}
    </div>
  );
};

export default WeatherBackground;
