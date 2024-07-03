'use client';
import './home.scss';
import { useEffect, useState } from 'react';

const Home = () => {
  const [inputValue, setInputValue] = useState('');
  const [weatherData, setWeatherData] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState('');
  const [city, setCity] = useState('');
  const [showSection, setShowSection] = useState(false);
  const [showCity, setShowCity] = useState(false);

  useEffect(() => {
    const date = new Date();
    setCurrentDate(date.toString().slice(0, 15));
  }, []);

  const getData = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue) {
      alert('Please Enter a city name');
      return;
    } else {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${inputValue}&appid=ca695dcbc66c5fa3d0cb955033fd918f`
      );
      const data = await res.json();
      displayWeather(data);
      setShowCity(true);
    }
  };

  const getLocationData = () => {
    if (!navigator.geolocation) {
      alert('geolocation is not supported!');
      return;
    } else {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&appid=ca695dcbc66c5fa3d0cb955033fd918f`
        );
        const data = await res.json();
        displayWeather(data);
        setShowCity(true);
      });
    }
  };

  const displayWeather = (data: any) => {
    const temp = (data.main.temp - 273.15).toFixed(1);

    setWeatherData({
      temp,
      humidity: data.main.humidity,
      feelsLike: (data.main.feels_like - 273.15).toFixed(1),
      description: data.weather[0].description,
      icon: data.weather[0].icon,
    });

    setCity(data.name);
    setShowSection(true);
  };

  return (
    <div className="container">
      <header className="header">
        <h5>Weather Information</h5>
        <p id="date">{currentDate}</p>
      </header>
      <form onSubmit={getData} className="form">
        <input
          id="search-input"
          type="text"
          placeholder='Enter your Location'
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="input"
        />
        <button type="submit" className="button">Search</button>
      </form>
      <button id="loc-btn" onClick={getLocationData} className="loc-btn">
        Use Current Location
      </button>
      <section style={{ display: showSection ? 'block' : 'none' }} className="section test">
        <h2 id="city">{city}</h2>
        {weatherData && (
          <>
            <p id="temperature-degree">Current Temperature:{weatherData.temp}°C</p>
            <p id="humidity-degree">Humidity:{weatherData.humidity} %</p>
            <p id="feelslike-degree">It feels like:{weatherData.feelsLike} °C</p>
            <p id="description-text">{weatherData.description}</p>
            <img
              id="description-img"
              src={`http://openweathermap.org/img/wn/${weatherData.icon}.png`}
              alt="Weather icon"
            />
          </>
        )}
      </section>
    </div>
  );
};

export default Home;
