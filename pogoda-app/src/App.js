// src/App.js
import React, { useState } from 'react';
import { WiDaySunny, WiRain, WiSnow, WiCloudy, WiThunderstorm, WiSmog } from 'react-icons/wi';
import './App.css';

// W rzeczywistej aplikacji klucz API powinien być w zmiennych środowiskowych
const apiKey = 'd790ca786ef5a8a2e7653183e8a7cc1a'; // Zastąp swoim kluczem API z OpenWeatherMap

const weatherConditions = {
  Thunderstorm: {
    color: '#616161',
    title: 'Burza',
    subtitle: 'Uważaj na błyskawice!',
    icon: <WiThunderstorm size={64} />
  },
  Drizzle: {
    color: '#0044CC',
    title: 'Mżawka',
    subtitle: 'Lekkie opady',
    icon: <WiRain size={64} />
  },
  Rain: {
    color: '#005BEA',
    title: 'Deszcz',
    subtitle: 'Weź parasol',
    icon: <WiRain size={64} />
  },
  Snow: {
    color: '#00d2ff',
    title: 'Śnieg',
    subtitle: 'Ubierz się ciepło',
    icon: <WiSnow size={64} />
  },
  Clear: {
    color: '#f7b733',
    title: 'Słonecznie',
    subtitle: 'Idealna pogoda!',
    icon: <WiDaySunny size={64} />
  },
  Clouds: {
    color: '#1F1C2C',
    title: 'Pochmurno',
    subtitle: 'Może przejaśni się później',
    icon: <WiCloudy size={64} />
  },
  Mist: {
    color: '#3CD3AD',
    title: 'Mgła',
    subtitle: 'Uważaj na drodze',
    icon: <WiSmog size={64} />
  }
};

function App() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getWeather = async () => {
    if (!city.trim()) {
      alert('Proszę wpisać nazwę miasta');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city.trim()}&appid=${apiKey}&units=metric&lang=pl`
      );
      
      if (!response.ok) {
        throw new Error(`Błąd HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data || !data.weather || data.weather.length === 0) {
        throw new Error('Nie udało się pobrać danych pogodowych.');
      }
      
      setWeatherData(data);
    } catch (error) {
      console.error('Błąd:', error);
      setError(error.message || 'Wystąpił błąd podczas pobierania danych');
    } finally {
      setLoading(false);
    }
  };

  const getLocationWeather = () => {
    if (navigator.geolocation) {
      setLoading(true);
      setError(null);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=pl`
          )
            .then(response => {
              if (!response.ok) {
                throw new Error(`Błąd HTTP: ${response.status}`);
              }
              return response.json();
            })
            .then(data => {
              setWeatherData(data);
              setCity(data.name); // Aktualizuje pole z nazwą miasta
            })
            .catch(error => {
              console.error('Błąd:', error);
              setError(error.message || 'Wystąpił błąd podczas pobierania danych');
            })
            .finally(() => {
              setLoading(false);
            });
        },
        (error) => {
          setLoading(false);
          if (error.code === error.PERMISSION_DENIED) {
            setError('Aby pobrać pogodę dla Twojej lokalizacji, musisz zezwolić na dostęp do lokalizacji.');
          } else {
            setError(`Błąd geolokalizacji: ${error.message}`);
          }
        }
      );
    } else {
      setError('Twoja przeglądarka nie wspiera geolokalizacji');
    }
  };

  const condition = weatherData
    ? weatherConditions[weatherData.weather[0].main] || weatherConditions.Clear
    : weatherConditions.Clear;

  return (
    <div className="App" style={{ backgroundColor: condition.color }}>
      <div className="container">
        <h1 className="app-title">Prognoza pogody</h1>
        
        <div className="search-container">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Wpisz nazwę miasta"
            className="search-input"
          />
          <button onClick={getWeather} className="search-button">
            Sprawdź pogodę
          </button>
          <button onClick={getLocationWeather} className="location-button">
            Użyj mojej lokalizacji
          </button>
        </div>
        
        {loading && <div className="loading">Ładowanie danych...</div>}
        
        {error && <div className="error-message">{error}</div>}
        
        {weatherData && !loading && !error && (
          <div id="weatherInfo">
            <div className="weather-header">
              <h2>{weatherData.name}, {weatherData.sys.country}</h2>
              <div className="weather-icon">{condition.icon}</div>
              <h3 className="weather-condition">{condition.title}</h3>
              <p className="weather-subtitle">{condition.subtitle}</p>
              <p className="weather-description">{weatherData.weather[0].description}</p>
            </div>
            
            <div className="weather-details">
              <div className="weather-detail">
                <h4>Temperatura</h4>
                <p>{Math.round(weatherData.main.temp)}°C</p>
                <p className="detail-range">
                  Min: {Math.round(weatherData.main.temp_min)}°C / 
                  Max: {Math.round(weatherData.main.temp_max)}°C
                </p>
              </div>
              
              <div className="weather-detail">
                <h4>Ciśnienie</h4>
                <p>{weatherData.main.pressure} hPa</p>
              </div>
              
              <div className="weather-detail">
                <h4>Wilgotność</h4>
                <p>{weatherData.main.humidity}%</p>
              </div>
              
              <div className="weather-detail">
                <h4>Wiatr</h4>
                <p>{weatherData.wind.speed} m/s</p>
                <p className="detail-direction">
                  Kierunek: {weatherData.wind.deg}°
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;