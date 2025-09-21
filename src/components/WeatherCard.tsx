import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WeatherData } from "@/types/weather";
import { getWeatherIconUrl } from "@/config/weather";
import { WiBarometer } from "react-icons/wi";
import {
  FiDroplet,
  FiWind,
  FiEye,
  FiSunrise,
  FiSunset,
  FiActivity,
} from "react-icons/fi";
import styles from "./WeatherCard.module.scss";

interface WeatherCardProps {
  weather: WeatherData;
  unit: "celsius" | "fahrenheit";
  onUnitChange: (unit: "celsius" | "fahrenheit") => void;
}

// Animated counter component for smooth temperature transitions
const AnimatedCounter: React.FC<{ value: string; unit: string }> = ({
  value,
  unit,
}) => {
  const [displayValue, setDisplayValue] = useState(value);

  React.useEffect(() => {
    const numValue = parseFloat(value);
    const startValue = parseFloat(displayValue);
    const duration = 1000;
    const steps = 60;
    const stepValue = (numValue - startValue) / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const newValue = startValue + stepValue * currentStep;
      setDisplayValue(newValue.toFixed(1));

      if (currentStep >= steps) {
        clearInterval(timer);
        setDisplayValue(value);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value, displayValue]);

  return (
    <motion.span
      key={value}
      initial={{ scale: 1.2, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {displayValue}°{unit}
    </motion.span>
  );
};

const WeatherCard: React.FC<WeatherCardProps> = ({
  weather,
  unit,
  onUnitChange,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const convertTemp = (temp: string) => {
    const numTemp = parseFloat(temp);
    return unit === "fahrenheit" ? ((numTemp * 9) / 5 + 32).toFixed(1) : temp;
  };

  return (
    <motion.div
      className={styles.weatherCard}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={{
        scale: 1.02,
        y: -8,
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className={styles.location}>
          <motion.h2
            className={styles.city}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {weather.city}
          </motion.h2>
          <motion.p
            className={styles.country}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {weather.country}
          </motion.p>
        </div>
        <motion.div
          className={styles.unitToggle}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <motion.button
            className={`${styles.unitButton} ${
              unit === "celsius" ? styles.active : ""
            }`}
            onClick={() => onUnitChange("celsius")}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Switch to Celsius"
          >
            °C
          </motion.button>
          <motion.button
            className={`${styles.unitButton} ${
              unit === "fahrenheit" ? styles.active : ""
            }`}
            onClick={() => onUnitChange("fahrenheit")}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Switch to Fahrenheit"
          >
            °F
          </motion.button>
        </motion.div>
      </motion.div>

      <motion.div
        className={styles.mainWeather}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <motion.div
          className={styles.temperature}
          animate={{
            scale: isHovered ? 1.05 : 1,
            rotate: isHovered ? 1 : 0,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <AnimatedCounter
            value={convertTemp(weather.temp)}
            unit={unit === "celsius" ? "C" : "F"}
          />
        </motion.div>
        <motion.div
          className={styles.weatherInfo}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <motion.img
            src={getWeatherIconUrl(weather.icon, "4x")}
            alt={weather.description}
            className={styles.weatherIcon}
            whileHover={{
              rotate: [0, -10, 10, -10, 0],
              scale: 1.1,
            }}
            transition={{ duration: 0.5 }}
          />
          <motion.p
            className={styles.description}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            {weather.description.charAt(0).toUpperCase() +
              weather.description.slice(1)}
          </motion.p>
        </motion.div>
      </motion.div>

      <motion.div
        className={styles.detailsToggle}
        onClick={() => setShowDetails(!showDetails)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span>Details</span>
        <motion.span
          animate={{ rotate: showDetails ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          ▼
        </motion.span>
      </motion.div>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            className={styles.details}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <motion.div
              className={styles.detailItem}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <span className={styles.detailLabel}>
                <FiActivity className={styles.detailIcon} />
                Feels like
              </span>
              <span className={styles.detailValue}>
                {convertTemp(weather.feelsLike)}°
                {unit === "celsius" ? "C" : "F"}
              </span>
            </motion.div>
            <motion.div
              className={styles.detailItem}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <span className={styles.detailLabel}>
                <FiDroplet className={styles.detailIcon} />
                Humidity
              </span>
              <span className={styles.detailValue}>{weather.humidity}%</span>
            </motion.div>
            <motion.div
              className={styles.detailItem}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <span className={styles.detailLabel}>
                <FiWind className={styles.detailIcon} />
                Wind
              </span>
              <span className={styles.detailValue}>
                {weather.windSpeed} m/s
              </span>
            </motion.div>
            <motion.div
              className={styles.detailItem}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              <span className={styles.detailLabel}>
                <WiBarometer className={styles.detailIcon} />
                Pressure
              </span>
              <span className={styles.detailValue}>{weather.pressure} hPa</span>
            </motion.div>
            <motion.div
              className={styles.detailItem}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <span className={styles.detailLabel}>
                <FiEye className={styles.detailIcon} />
                Visibility
              </span>
              <span className={styles.detailValue}>
                {weather.visibility} km
              </span>
            </motion.div>
            <motion.div
              className={styles.detailItem}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.3 }}
            >
              <span className={styles.detailLabel}>
                <FiSunrise className={styles.detailIcon} />
                Sunrise
              </span>
              <span className={styles.detailValue}>{weather.sunrise}</span>
            </motion.div>
            <motion.div
              className={styles.detailItem}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.3 }}
            >
              <span className={styles.detailLabel}>
                <FiSunset className={styles.detailIcon} />
                Sunset
              </span>
              <span className={styles.detailValue}>{weather.sunset}</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default WeatherCard;
