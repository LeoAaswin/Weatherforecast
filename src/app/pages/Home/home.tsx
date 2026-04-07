'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WeatherData, ForecastResponse, TemperatureUnit } from '@/types/weather';
import { weatherService } from '@/services/weatherService';
import { debugGeolocation, testGeolocation } from '@/utils/geolocationDebug';
import SearchForm from '@/components/SearchForm';
import WeatherCard from '@/components/WeatherCard';
import WeatherForecast from '@/components/WeatherForecast';
import WeatherBackground from '@/components/WeatherBackground';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { toast } from 'react-hot-toast';
import { useWeatherSound, getWeatherSoundType } from '@/utils/useWeatherSound';
import styles from './home.module.scss';

interface WeatherTheme {
  gradient: string;
}

const getWeatherTheme = (conditionId: number): WeatherTheme => {
  const hour = new Date().getHours();

  if (conditionId >= 200 && conditionId < 300) {
    return { gradient: 'linear-gradient(135deg, #0d0d1a 0%, #1a1a3e 50%, #243B55 100%)' };
  }
  if (conditionId >= 300 && conditionId < 500) {
    return { gradient: 'linear-gradient(135deg, #1c2f45 0%, #2c5364 50%, #4ca1af 100%)' };
  }
  if (conditionId >= 500 && conditionId < 600) {
    return { gradient: 'linear-gradient(135deg, #1a1f35 0%, #2d3a6b 50%, #4286f4 100%)' };
  }
  if (conditionId >= 600 && conditionId < 700) {
    return { gradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #6dd5ed 100%)' };
  }
  if (conditionId >= 700 && conditionId < 800) {
    return { gradient: 'linear-gradient(135deg, #2c3e50 0%, #4b6cb7 100%)' };
  }
  if (conditionId === 800) {
    if (hour >= 5 && hour < 8) {
      return { gradient: 'linear-gradient(135deg, #c94b4b 0%, #f7941d 50%, #fdc830 100%)' };
    }
    if (hour >= 8 && hour < 18) {
      return { gradient: 'linear-gradient(135deg, #0575E6 0%, #1976D2 50%, #00BCD4 100%)' };
    }
    if (hour >= 18 && hour < 21) {
      return { gradient: 'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)' };
    }
    return { gradient: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' };
  }
  if (conditionId >= 801 && conditionId <= 804) {
    return { gradient: 'linear-gradient(135deg, #3a4a5c 0%, #536976 50%, #292E49 100%)' };
  }
  return { gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' };
};

const defaultTheme: WeatherTheme = {
  gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
};

const Home: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [temperatureUnit, setTemperatureUnit] = useState<TemperatureUnit>('celsius');
  const [currentDate, setCurrentDate] = useState('');
  const [theme, setTheme] = useState<WeatherTheme>(defaultTheme);
  const [soundEnabled, setSoundEnabled] = useState(false);

  useWeatherSound(weatherData?.conditionId ?? null, soundEnabled);

  useEffect(() => {
    const date = new Date();
    setCurrentDate(date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }));
  }, []);

  const handleSearch = async (city: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [weather, forecast] = await Promise.all([
        weatherService.getCurrentWeatherByCity(city),
        weatherService.getForecastByCity(city),
      ]);
      
      setWeatherData(weather);
      setForecastData(forecast);
      setTheme(getWeatherTheme(weather.conditionId));
      toast.success(`Weather data loaded for ${city}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch weather data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSearch = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Debug geolocation capabilities
      const debugInfo = debugGeolocation();
      console.log('🔍 Starting location search with debug info:', debugInfo);

      // Check if we're in a secure context first
      if (!window.isSecureContext && window.location.protocol !== 'https:') {
        throw new Error('Location access requires HTTPS. Please search for a city instead.');
      }

      // Show loading toast
      toast.loading('Getting your location...', { id: 'location' });

      const { lat, lon } = await weatherService.getCurrentLocation();
      
      // Update loading toast
      toast.loading('Fetching weather data...', { id: 'location' });

      const [weather, forecast] = await Promise.all([
        weatherService.getCurrentWeatherByCoords(lat, lon),
        weatherService.getForecastByCoords(lat, lon),
      ]);
      
      setWeatherData(weather);
      setForecastData(forecast);
      setTheme(getWeatherTheme(weather.conditionId));
      toast.success(`Weather data loaded for your location`, { id: 'location' });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location or fetch weather data';
      setError(errorMessage);
      toast.error(errorMessage, { id: 'location' });
      
      // If it's a permission error, provide helpful guidance
      if (errorMessage.includes('denied') || errorMessage.includes('blocked')) {
        console.warn('Geolocation blocked. This might be due to browser security settings.');
        console.log('💡 Try refreshing the page and clicking "Allow" when prompted, or search for a city instead.');
        
        // Show a more helpful error message
        toast.error('Location access denied. Please click "Allow" when prompted by your browser, or search for a city instead.', { 
          id: 'location',
          duration: 6000 
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDebugLocation = async () => {
    console.log('🐛 Running geolocation debug...');
    try {
      const result = await testGeolocation();
      console.log('✅ Debug test successful:', result);
      alert('Geolocation test successful! Check console for details.');
    } catch (error) {
      console.log('❌ Debug test failed:', error);
      alert('Geolocation test failed. Check console for details.');
    }
  };

  const handleUnitChange = (unit: TemperatureUnit) => {
    setTemperatureUnit(unit);
  };

  const handleClearError = () => {
    setError(null);
  };

  const handleRetry = () => {
    if (weatherData) {
      handleSearch(weatherData.city);
    }
  };

  return (
    <motion.div
      className={styles.container}
      style={{ '--weather-gradient': theme.gradient } as React.CSSProperties}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Animated weather background particles */}
      {weatherData && (
        <WeatherBackground conditionId={weatherData.conditionId} />
      )}

      <motion.header
        className={styles.header}
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.h1 
          className={styles.title}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
        >
          Weather Forecast
        </motion.h1>
        <motion.p
          className={styles.date}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
        >
          {currentDate}
        </motion.p>

        {weatherData && (
          <motion.button
            className={`${styles.soundToggle} ${soundEnabled ? styles.soundOn : ''}`}
            onClick={() => setSoundEnabled((v) => !v)}
            title={soundEnabled ? 'Mute ambient sound' : 'Play ambient sound'}
            aria-label={soundEnabled ? 'Mute ambient sound' : 'Play ambient sound'}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
          >
            {soundEnabled ? (
              // Speaker with waves
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
            ) : (
              // Speaker muted
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            )}
            <span>{soundEnabled ? 'Sound On' : 'Sound Off'}</span>
            {soundEnabled && weatherData && getWeatherSoundType(weatherData.conditionId) !== 'none' && (
              <span className={styles.soundBadge}>
                {getWeatherSoundType(weatherData.conditionId)}
              </span>
            )}
          </motion.button>
        )}
      </motion.header>

      <motion.div 
        className={styles.mainContent}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
      >
        <motion.div 
          className={styles.searchSection}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
        >
          <SearchForm
            onSearch={handleSearch}
            onLocationSearch={handleLocationSearch}
            isLoading={isLoading}
            error={error}
            onClearError={handleClearError}
          />

          {/* Debug button for development */}
          {process.env.NODE_ENV === 'development' && (
            <motion.button 
              onClick={handleDebugLocation}
              className={styles.debugButton}
              title="Debug geolocation (development only)"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              🐛 Debug Location
            </motion.button>
          )}

          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <LoadingSpinner 
                  size="large" 
                  message="Fetching weather data..." 
                />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {error && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <ErrorMessage
                  message={error}
                  onRetry={handleRetry}
                  onDismiss={handleClearError}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div 
          className={styles.weatherSection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
        >
          <AnimatePresence mode="wait">
            {weatherData && !isLoading && (
              <motion.div
                key="weather-card"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <WeatherCard
                  weather={weatherData}
                  unit={temperatureUnit}
                  onUnitChange={handleUnitChange}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {forecastData && !isLoading && weatherData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
              >
                <WeatherForecast
                  forecast={forecastData}
                  unit={temperatureUnit}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Home;
