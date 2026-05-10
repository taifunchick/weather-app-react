import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FaHeart, FaRegHeart, FaSearch, FaTrash, FaSun, FaMoon } from 'react-icons/fa';
import { WiDaySunny, WiRain, WiSnow, WiCloudy, WiThunderstorm, WiFog, WiHumidity, WiStrongWind, WiBarometer } from 'react-icons/wi';
import './App.css';

const API_KEY = '2c17355d95d03d10b67c4dcd9861d2cb';

function App() {
  const [city, setCity] = useState('London');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [unit, setUnit] = useState('metric');
  const [darkMode, setDarkMode] = useState(true);
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    const savedFavorites = localStorage.getItem('weather_favorites');
    const savedUnit = localStorage.getItem('weather_unit');
    const savedTheme = localStorage.getItem('weather_theme');
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    if (savedUnit) setUnit(savedUnit);
    if (savedTheme) setDarkMode(savedTheme === 'dark');
    fetchWeather('London');
  }, []);

  useEffect(() => {
    localStorage.setItem('weather_favorites', JSON.stringify(favorites));
    localStorage.setItem('weather_unit', unit);
    localStorage.setItem('weather_theme', darkMode ? 'dark' : 'light');
  }, [favorites, unit, darkMode]);

  const fetchWeather = async (cityName) => {
    setLoading(true);
    try {
      const weatherRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=${unit}`
      );
      setWeather(weatherRes.data);
      
      const forecastRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=${unit}`
      );
      setForecast(forecastRes.data);
      
      toast.success(`${weatherRes.data.name} weather loaded!`);
    } catch (error) {
      toast.error('City not found!');
    }
    setLoading(false);
  };

  const handleSearch = () => {
    if (searchInput.trim()) {
      fetchWeather(searchInput);
      setCity(searchInput);
      setSearchInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const addToFavorites = () => {
    if (weather && !favorites.includes(weather.name)) {
      setFavorites([...favorites, weather.name]);
      toast.success(`${weather.name} added to favorites!`);
    }
  };

  const removeFavorite = (cityName) => {
    setFavorites(favorites.filter(fav => fav !== cityName));
    toast.success(`${cityName} removed!`);
  };

  const getWeatherIcon = (id) => {
    if (id >= 200 && id < 300) return <WiThunderstorm size={80} />;
    if (id >= 300 && id < 500) return <WiRain size={80} />;
    if (id >= 500 && id < 600) return <WiRain size={80} />;
    if (id >= 600 && id < 700) return <WiSnow size={80} />;
    if (id >= 700 && id < 800) return <WiFog size={80} />;
    if (id === 800) return <WiDaySunny size={80} />;
    return <WiCloudy size={80} />;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const tempUnit = unit === 'metric' ? '°C' : '°F';
  const speedUnit = unit === 'metric' ? 'm/s' : 'mph';

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <Toaster position="top-right" />
      
      <div className="container">
        <div className="header">
          <h1>🌤️ Weather App</h1>
          <button onClick={() => setDarkMode(!darkMode)} className="theme-btn">
            {darkMode ? <FaSun size={24} /> : <FaMoon size={24} />}
          </button>
        </div>

        <div className="search-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Enter city name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button onClick={handleSearch}>
              <FaSearch size={20} />
            </button>
          </div>
          
          <div className="unit-toggle">
            <button onClick={() => setUnit('metric')} className={unit === 'metric' ? 'active' : ''}>°C</button>
            <button onClick={() => setUnit('imperial')} className={unit === 'imperial' ? 'active' : ''}>°F</button>
          </div>
        </div>

        {favorites.length > 0 && (
          <div className="favorites-bar">
            <span>⭐ Favorites:</span>
            {favorites.map(fav => (
              <button key={fav} onClick={() => fetchWeather(fav)} className="fav-chip">
                {fav}
                <FaTrash size={12} onClick={(e) => { e.stopPropagation(); removeFavorite(fav); }} />
              </button>
            ))}
          </div>
        )}

        {loading && <div className="loader">Loading...</div>}

        {weather && !loading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="weather-card"
          >
            <div className="weather-header">
              <div>
                <h2>{weather.name}, {weather.sys.country}</h2>
                <p>{formatDate(weather.dt)}</p>
              </div>
              <button onClick={addToFavorites} className="favorite-btn">
                {favorites.includes(weather.name) ? <FaHeart color="red" size={28} /> : <FaRegHeart size={28} />}
              </button>
            </div>

            <div className="weather-main">
              {getWeatherIcon(weather.weather[0].id)}
              <div className="temp-main">
                <span className="temp-value">{Math.round(weather.main.temp)}</span>
                <span className="temp-unit">{tempUnit}</span>
              </div>
              <p className="weather-desc">{weather.weather[0].description}</p>
            </div>

            <div className="weather-details">
              <div className="detail">
                <WiHumidity size={40} />
                <div>
                  <span className="detail-value">{weather.main.humidity}%</span>
                  <span className="detail-label">Humidity</span>
                </div>
              </div>
              <div className="detail">
                <WiStrongWind size={40} />
                <div>
                  <span className="detail-value">{Math.round(weather.wind.speed)} {speedUnit}</span>
                  <span className="detail-label">Wind</span>
                </div>
              </div>
              <div className="detail">
                <WiBarometer size={40} />
                <div>
                  <span className="detail-value">{weather.main.pressure} hPa</span>
                  <span className="detail-label">Pressure</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {forecast && !loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="forecast-section"
          >
            <h3>📅 5-Day Forecast</h3>
            <div className="forecast-list">
              {forecast.list.filter((_, index) => index % 8 === 0).slice(0, 5).map((day, idx) => (
                <div key={idx} className="forecast-card">
                  <p className="forecast-date">{formatDate(day.dt)}</p>
                  {getWeatherIcon(day.weather[0].id)}
                  <p className="forecast-temp">{Math.round(day.main.temp)}{tempUnit}</p>
                  <p className="forecast-desc">{day.weather[0].description.slice(0, 15)}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="tips-section">
          <h3>💡 Weather Tips</h3>
          <div className="tips-list">
            <div className="tip">☂️ Low pressure = rain expected</div>
            <div className="tip">🧥 Humidity 70% = feels colder</div>
            <div className="tip">🕶️ UV index 3 = wear sunglasses</div>
            <div className="tip">💧 Drink more water in dry weather</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;