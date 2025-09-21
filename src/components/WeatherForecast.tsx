import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ForecastResponse } from '@/types/weather';
import { getWeatherIconUrl, convertTemperature } from '@/config/weather';
import { format } from 'date-fns';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { FiTrendingUp, FiDroplet, FiWind, FiEye, FiGrid } from 'react-icons/fi';
import styles from './WeatherForecast.module.scss';
import Image from 'next/image';

interface WeatherForecastProps {
  forecast: ForecastResponse;
  unit: 'celsius' | 'fahrenheit';
}

const WeatherForecast: React.FC<WeatherForecastProps> = ({ forecast, unit }) => {
  const [viewMode, setViewMode] = useState<'cards' | 'chart'>('cards');
  const [selectedDay, setSelectedDay] = useState(0);

  // Group forecast by day
  const groupedForecast = useMemo(() => {
    return forecast.list.reduce((acc, item) => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    }, {} as Record<string, typeof forecast.list>);
  }, [forecast]);

  // Prepare chart data
  const chartData = useMemo(() => {
    return forecast.list.slice(0, 24).map((item, index) => ({
      time: format(new Date(item.dt * 1000), 'HH:mm'),
      temp: parseFloat(convertTemperature(item.main.temp, unit)),
      humidity: item.main.humidity,
      windSpeed: item.wind.speed,
      rain: (item.pop * 100),
      pressure: item.main.pressure,
      visibility: item.visibility / 1000,
    }));
  }, [forecast.list, unit]);

  const convertTemp = (temp: number) => {
    return unit === 'fahrenheit' 
      ? ((temp * 9/5) + 32).toFixed(1)
      : temp.toFixed(1);
  };

  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    }
  };

  const getMinMaxTemp = (dayItems: typeof forecast.list) => {
    const temps = dayItems.map(item => item.main.temp);
    return {
      min: Math.min(...temps),
      max: Math.max(...temps),
    };
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.tooltip}>
          <p className={styles.tooltipTime}>{label}</p>
          <p className={styles.tooltipTemp}>
            {payload[0].value}°{unit === 'celsius' ? 'C' : 'F'}
          </p>
          <p className={styles.tooltipHumidity}>
            Humidity: {payload[1]?.value}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      className={styles.forecastContainer}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.div 
        className={styles.forecastHeader}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h3 className={styles.forecastTitle}>5-Day Forecast</h3>
        <div className={styles.viewToggle}>
          <motion.button
            className={`${styles.toggleButton} ${viewMode === 'cards' ? styles.active : ''}`}
            onClick={() => setViewMode('cards')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiGrid />
            Cards
          </motion.button>
          <motion.button
            className={`${styles.toggleButton} ${viewMode === 'chart' ? styles.active : ''}`}
            onClick={() => setViewMode('chart')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiTrendingUp />
            Chart
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {viewMode === 'cards' ? (
          <motion.div 
            key="cards"
            className={styles.forecastGrid}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            {Object.entries(groupedForecast).slice(0, 5).map(([date, dayItems], index) => {
              const dayName = getDayName(date);
              const minMax = getMinMaxTemp(dayItems);
              const mainWeather = dayItems[Math.floor(dayItems.length / 2)];
              
              return (
                <motion.div 
                  key={date} 
                  className={`${styles.forecastDay} ${selectedDay === index ? styles.selected : ''}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  onClick={() => setSelectedDay(index)}
                >
                  <motion.div 
                    className={styles.dayHeader}
                    whileHover={{ scale: 1.05 }}
                  >
                    <h4 className={styles.dayName}>{dayName}</h4>
                    <p className={styles.dayDate}>
                      {format(new Date(date), 'MMM d')}
                    </p>
                  </motion.div>
                  
                  <motion.div 
                    className={styles.dayWeather}
                    whileHover={{ scale: 1.1 }}
                  >
                    <Image
                      src={getWeatherIconUrl(mainWeather.weather[0].icon, '2x')}
                      alt={mainWeather.weather[0].description}
                      className={styles.weatherIcon}
                      width={50}
                      height={50}
                    />
                    <p className={styles.weatherDescription}>
                      {mainWeather.weather[0].description}
                    </p>
                  </motion.div>
                  
                  <div className={styles.dayTemps}>
                    <span className={styles.maxTemp}>
                      {convertTemp(minMax.max)}°{unit === 'celsius' ? 'C' : 'F'}
                    </span>
                    <span className={styles.minTemp}>
                      {convertTemp(minMax.min)}°{unit === 'celsius' ? 'C' : 'F'}
                    </span>
                  </div>
                  
                  <div className={styles.dayDetails}>
                    <motion.div 
                      className={styles.detailItem}
                      whileHover={{ scale: 1.05 }}
                    >
                      <FiDroplet className={styles.detailIcon} />
                      <span className={styles.detailValue}>{mainWeather.main.humidity}%</span>
                    </motion.div>
                    <motion.div 
                      className={styles.detailItem}
                      whileHover={{ scale: 1.05 }}
                    >
                      <FiWind className={styles.detailIcon} />
                      <span className={styles.detailValue}>{mainWeather.wind.speed} m/s</span>
                    </motion.div>
                    <motion.div 
                      className={styles.detailItem}
                      whileHover={{ scale: 1.05 }}
                    >
                      <FiEye className={styles.detailIcon} />
                      <span className={styles.detailValue}>{(mainWeather.pop * 100).toFixed(0)}%</span>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div 
            key="chart"
            className={styles.chartContainer}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <div className={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#764ba2" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="time" 
                    stroke="rgba(255,255,255,0.7)"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.7)"
                    fontSize={12}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="temp"
                    stroke="#667eea"
                    fill="url(#tempGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className={styles.chartStats}>
              <motion.div 
                className={styles.statItem}
                whileHover={{ scale: 1.05 }}
              >
                <FiDroplet className={styles.statIcon} />
                <span className={styles.statLabel}>Avg Humidity</span>
                <span className={styles.statValue}>
                  {(chartData.reduce((acc, item) => acc + item.humidity, 0) / chartData.length).toFixed(0)}%
                </span>
              </motion.div>
              <motion.div 
                className={styles.statItem}
                whileHover={{ scale: 1.05 }}
              >
                <FiWind className={styles.statIcon} />
                <span className={styles.statLabel}>Avg Wind</span>
                <span className={styles.statValue}>
                  {(chartData.reduce((acc, item) => acc + item.windSpeed, 0) / chartData.length).toFixed(1)} m/s
                </span>
              </motion.div>
              <motion.div 
                className={styles.statItem}
                whileHover={{ scale: 1.05 }}
              >
                <FiEye className={styles.statIcon} />
                <span className={styles.statLabel}>Max Rain</span>
                <span className={styles.statValue}>
                  {Math.max(...chartData.map(item => item.rain)).toFixed(0)}%
                </span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default WeatherForecast;
