import { showWarningBox, showSpinner, hideSpinner, setIsCurrentLocation } from "./js/uiHelpers.js";
import { updateCurrentWeather, updateForecast } from "./js/ui.js";
import { getWeatherByIP, getWeatherData, searchCityWeather } from "./js/api.js";


// Hide Warning Box
document.getElementById('warning').addEventListener('click', () => {
    const box = document.getElementById('location-warning');
    if (box) box.style.display = 'none';
});

// Current Location
document.getElementById('CurrentLocation').addEventListener('click', async() => {
    showSpinner();
    document.getElementById('cityInput').value = '';
    navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const weatherData = await getWeatherData(lat, lon);
        if (!weatherData || weatherData.error) {
            alert(weatherData.error);
            hideSpinner();
            return;
        }
        setIsCurrentLocation(true);
        updateCurrentWeather(weatherData);
        updateForecast(weatherData);
    }, (err) => {
        alert("Location access denied or unavailable.");
        hideSpinner();
    });
});

// Search City
document.getElementById('searchCity').addEventListener('click', async() => {
    setIsCurrentLocation(false);
    const city = document.getElementById('cityInput').value.trim();
    document.getElementById('cityInput').value = '';

    if (!city) return alert('Enter a city name!');

    showSpinner(); 
    try {
        const weatherData = await searchCityWeather(city);
        if (!weatherData || weatherData.error) {
            alert(weatherData.error);
            hideSpinner();
            return;
        }
        await updateCurrentWeather(weatherData);
        await updateForecast(weatherData);
    } catch (err) {
        alert("An error occurred while fetching weather.");
        hideSpinner();
        console.error(err);
    } 
});



// Initial
async function init() {
    showSpinner();
    try {
        setIsCurrentLocation(false);
        const weatherData = await getWeatherByIP();
        updateCurrentWeather(weatherData);
        updateForecast(weatherData);
        showWarningBox();
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
}

init();