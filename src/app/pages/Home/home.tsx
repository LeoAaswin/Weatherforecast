"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  WeatherData,
  ForecastResponse,
  TemperatureUnit,
} from "@/types/weather";
import { weatherService } from "@/services/weatherService";
import { debugGeolocation, testGeolocation } from "@/utils/geolocationDebug";
import SearchForm from "@/components/SearchForm";
import WeatherCard from "@/components/WeatherCard";
import WeatherForecast from "@/components/WeatherForecast";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import { toast } from "react-hot-toast";
import styles from "./home.module.scss";

const Home: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [temperatureUnit, setTemperatureUnit] =
    useState<TemperatureUnit>("celsius");
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const date = new Date();
    setCurrentDate(
      date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );
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
      toast.success(`Weather data loaded for ${city}`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch weather data";
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
      console.log("🔍 Starting location search with debug info:", debugInfo);

      // Check if we're in a secure context first
      if (!window.isSecureContext && window.location.protocol !== "https:") {
        throw new Error(
          "Location access requires HTTPS. Please search for a city instead."
        );
      }

      const { lat, lon } = await weatherService.getCurrentLocation();
      const [weather, forecast] = await Promise.all([
        weatherService.getCurrentWeatherByCoords(lat, lon),
        weatherService.getForecastByCoords(lat, lon),
      ]);

      setWeatherData(weather);
      setForecastData(forecast);
      toast.success(`Weather data loaded for your location`);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to get location or fetch weather data";
      setError(errorMessage);
      toast.error(errorMessage);

      // If it's a permission error, suggest trying HTTPS
      if (errorMessage.includes("blocked") || errorMessage.includes("denied")) {
        console.warn(
          "Geolocation blocked. This might be due to browser security settings or HTTP vs HTTPS."
        );
        console.log(
          "💡 Try running the app on HTTPS or localhost for geolocation to work."
        );
      }
    } finally {
      setIsLoading(false);
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
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
