import {
  fetchCurrentWeather,
  fetchForecast,
  fetchWeatherByLocation
} from "./api.js";

import { savePreferences, loadPreferences } from "./storage.js";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const currentWeatherDiv = document.getElementById("currentWeather");
const forecastDiv = document.getElementById("forecast");
const loading = document.getElementById("loading");
const errorDiv = document.getElementById("error");

let debounceTimer;

// Load weather by city
async function loadWeather(city) {
  try {
    loading.classList.remove("hidden");
    errorDiv.classList.add("hidden");

    const weather = await fetchCurrentWeather(city);
    const forecast = await fetchForecast(city);

    displayCurrentWeather(weather);
    displayForecast(forecast);

    savePreferences({ city });
  } catch (error) {
    showError(error.message);
  } finally {
    loading.classList.add("hidden");
  }
}

// Display current weather
function displayCurrentWeather(data) {
  currentWeatherDiv.innerHTML = `
    <h2>${data.name}</h2>
    <p>🌡️ ${data.main.temp} °C</p>
    <p>${data.weather[0].description}</p>
    <p>💧 Humidity: ${data.main.humidity}%</p>
    <p>💨 Wind Speed: ${data.wind.speed} m/s</p>
  `;
}

// Display 5-day forecast (one per day)
function displayForecast(data) {
  forecastDiv.innerHTML = "<h3>5-Day Forecast</h3>";

  const dailyForecast = data.list.filter(item =>
    item.dt_txt.includes("12:00:00")
  );

  dailyForecast.forEach(day => {
    const date = new Date(day.dt_txt).toDateString();
    forecastDiv.innerHTML += `
      <div>
        <p>${date}</p>
        <p>🌡️ ${day.main.temp} °C</p>
        <p>${day.weather[0].description}</p>
      </div>
    `;
  });
}

// Error UI
function showError(message) {
  errorDiv.innerHTML = `
    <p>⚠️ ${message}</p>
    <p>Please try again.</p>
  `;
  errorDiv.classList.remove("hidden");
}

// Button search
searchBtn.addEventListener("click", () => {
  if (cityInput.value.trim() !== "") {
    loadWeather(cityInput.value);
  }
});

// Debounced search
cityInput.addEventListener("input", () => {
  clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
    if (cityInput.value.trim() !== "") {
      loadWeather(cityInput.value);
    }
  }, 600);
});

// Geolocation
locationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(async position => {
    try {
      loading.classList.remove("hidden");

      const { latitude, longitude } = position.coords;
      const data = await fetchWeatherByLocation(latitude, longitude);

      displayCurrentWeather(data);
    } catch (error) {
      showError("Unable to fetch location weather");
    } finally {
      loading.classList.add("hidden");
    }
  });
});

// Load saved city on startup
const prefs = loadPreferences();
loadWeather(prefs.city);
