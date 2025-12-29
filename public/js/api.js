// Weather API by IP
export async function getWeatherByIP() {
    try {
        const res = await fetch('/api/weatherbyip');
        return await res.json();
    } catch (err) {
        console.error('Failed to get location by IP:', err);
        return null;
    }
}

// Weather
export async function getWeatherData(lat, lon) {
    try {
        const res = await fetch(`/api/getweather?lat=${lat}&lon=${lon}`);
        return await res.json();
    } catch (err) {
        console.error('Failed to get weather data:', err);
        return null;
    }
}

export async function searchCityWeather(city) {
    try {
        const res = await fetch(`/api/search?q=${city}`);
        return await res.json();
    } catch (err) {
        console.error('Failed to search city weather:', err);
        return null;
    }
}

// Local Time
export async function getLocalTimeFromServer(timezoneOffset) {
    try {
        const res = await fetch(`/api/local-now?timezone=${timezoneOffset}`);
        return await res.json();
    } catch (err) {
        console.error('Failed to get local time:', err);
        return null;
    }
}