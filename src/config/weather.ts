import { ENV_CONFIG } from './env';

// Weather API configuration
export const WEATHER_CONFIG = {
  API_KEY: ENV_CONFIG.OPENWEATHER_API_KEY,
  BASE_URL: ENV_CONFIG.OPENWEATHER_BASE_URL,
  ICON_URL: ENV_CONFIG.OPENWEATHER_ICON_URL,
  UNITS: 'metric' as const,
  LANG: 'en' as const,
} as const;

// API endpoints
export const API_ENDPOINTS = {
  CURRENT_WEATHER: `${WEATHER_CONFIG.BASE_URL}/weather`,
  FORECAST: `${WEATHER_CONFIG.BASE_URL}/forecast`,
  GEOCODING: `${WEATHER_CONFIG.BASE_URL}/weather`,
} as const;

// Weather utility functions
export const convertTemperature = (temp: number, unit: 'celsius' | 'fahrenheit'): string => {
  if (unit === 'fahrenheit') {
    return ((temp * 9/5) + 32).toFixed(1);
  }
  return temp.toFixed(1);
};

export const convertWindSpeed = (speed: number, unit: 'm/s' | 'km/h' | 'mph'): string => {
  switch (unit) {
    case 'km/h':
      return (speed * 3.6).toFixed(1);
    case 'mph':
      return (speed * 2.237).toFixed(1);
    default:
      return speed.toFixed(1);
  }
};

export const formatTime = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const getWeatherIconUrl = (icon: string, size: '2x' | '4x' = '2x'): string => {
  return `${WEATHER_CONFIG.ICON_URL}/${icon}@${size}.png`;
};
