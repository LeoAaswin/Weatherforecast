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
  FiThermometer,
  FiChevronDown,
} from "react-icons/fi";
import styles from "./WeatherCard.module.scss";

interface WeatherCardProps {
  weather: WeatherData;
  unit: "celsius" | "fahrenheit";
  onUnitChange: (unit: "celsius" | "fahrenheit") => void;
}

const AnimatedCounter: React.FC<{ value: string; unitLabel: string }> = ({
  value,
  unitLabel,
}) => {
  const [displayValue, setDisplayValue] = useState(value);

  React.useEffect(() => {
    const numValue = parseFloat(value);
    const startValue = parseFloat(displayValue);
    const duration = 800;
    const steps = 50;
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
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.span
      className={styles.tempDisplay}
      key={value}
      initial={{ scale: 1.1, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <span className={styles.tempNumber}>{displayValue}</span>
      <span className={styles.tempUnit}>°{unitLabel}</span>
    </motion.span>
  );
};

const WeatherCard: React.FC<WeatherCardProps> = ({
  weather,
  unit,
  onUnitChange,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const convertTemp = (temp: string) => {
    const numTemp = parseFloat(temp);
    return unit === "fahrenheit" ? ((numTemp * 9) / 5 + 32).toFixed(1) : temp;
  };

  return (
    <motion.div
      className={styles.weatherCard}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Top row: condition badge + unit toggle */}
      <div className={styles.topRow}>
        <motion.div
          className={styles.conditionBadge}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <img
            src={getWeatherIconUrl(weather.icon, "2x")}
            alt={weather.description}
            className={styles.badgeIcon}
          />
          <span className={styles.badgeText}>
            {weather.description.charAt(0).toUpperCase() +
              weather.description.slice(1)}
          </span>
        </motion.div>

        <motion.div
          className={styles.unitToggle}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <motion.button
            className={`${styles.unitButton} ${unit === "celsius" ? styles.active : ""}`}
            onClick={() => onUnitChange("celsius")}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Switch to Celsius"
          >
            °C
          </motion.button>
          <motion.button
            className={`${styles.unitButton} ${unit === "fahrenheit" ? styles.active : ""}`}
            onClick={() => onUnitChange("fahrenheit")}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Switch to Fahrenheit"
          >
            °F
          </motion.button>
        </motion.div>
      </div>

      {/* City + country */}
      <motion.div
        className={styles.location}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <h2 className={styles.city}>{weather.city}</h2>
        <p className={styles.country}>{weather.country}</p>
      </motion.div>

      {/* Hero temperature */}
      <motion.div
        className={styles.heroTemp}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
      >
        <AnimatedCounter
          value={convertTemp(weather.temp)}
          unitLabel={unit === "celsius" ? "C" : "F"}
        />
      </motion.div>

      {/* Always-visible quick metrics */}
      <motion.div
        className={styles.quickMetrics}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.4 }}
      >
        <div className={styles.metric}>
          <FiThermometer className={styles.metricIcon} />
          <span className={styles.metricLabel}>Feels like</span>
          <span className={styles.metricValue}>
            {convertTemp(weather.feelsLike)}°
            {unit === "celsius" ? "C" : "F"}
          </span>
        </div>
        <div className={styles.metricDivider} />
        <div className={styles.metric}>
          <FiDroplet className={styles.metricIcon} />
          <span className={styles.metricLabel}>Humidity</span>
          <span className={styles.metricValue}>{weather.humidity}%</span>
        </div>
        <div className={styles.metricDivider} />
        <div className={styles.metric}>
          <FiWind className={styles.metricIcon} />
          <span className={styles.metricLabel}>Wind</span>
          <span className={styles.metricValue}>{weather.windSpeed} m/s</span>
        </div>
      </motion.div>

      {/* Expandable details */}
      <motion.button
        className={styles.detailsToggle}
        onClick={() => setShowDetails(!showDetails)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span>More Details</span>
        <motion.span
          animate={{ rotate: showDetails ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <FiChevronDown />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            className={styles.details}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {[
              {
                icon: <WiBarometer className={styles.detailIcon} />,
                label: "Pressure",
                value: `${weather.pressure} hPa`,
                delay: 0.05,
              },
              {
                icon: <FiEye className={styles.detailIcon} />,
                label: "Visibility",
                value: `${weather.visibility} km`,
                delay: 0.1,
              },
              {
                icon: <FiSunrise className={styles.detailIcon} />,
                label: "Sunrise",
                value: weather.sunrise,
                delay: 0.15,
              },
              {
                icon: <FiSunset className={styles.detailIcon} />,
                label: "Sunset",
                value: weather.sunset,
                delay: 0.2,
              },
            ].map(({ icon, label, value, delay }) => (
              <motion.div
                key={label}
                className={styles.detailItem}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay, duration: 0.3 }}
              >
                <span className={styles.detailLabel}>
                  {icon}
                  {label}
                </span>
                <span className={styles.detailValue}>{value}</span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default WeatherCard;
