import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const ipGeoKey = process.env.IPGEO_API_KEY;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const FallbackIp = process.env.FALLBACK_IP;

/**
 * Fetch location data from IP using ipgeolocation API
 */
export const fetchFromIpGeoLocation = async (clientIp) => {
    const apiUrl = `https://api.ipgeolocation.io/ipgeo?apiKey=${ipGeoKey}&ip=${clientIp}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    if (data && data.latitude && data.longitude && data.city && data.country_name) {
        return {
            city: data.city,
            country: data.country_name,
            lat: data.latitude,
            lon: data.longitude
        };
    } else {
        throw new Error('ipgeolocation returned incomplete data');
    }
};

/**
 * Fetch location data from IP using ipinfo API
 */
export const fetchFromIpInfo = async (clientIp) => {
    const apiUrl = `https://ipinfo.io/${clientIp}/json`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    const [lat, lon] = data.loc.split(',');

    if (!lat || !lon) throw new Error('ipinfo returned invalid loc');

    return {
        city: data.city,
        country: data.country,
        lat,
        lon
    };
};

/**
 * Fetch location data from IP using ipwho.is API
 */
export const fetchFromIpWho = async (clientIp) => {
    const apiUrl = `https://ipwho.is/${clientIp}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data.success) throw new Error('ipwho.is failed');
    if (!data.city || !data.country || !data.latitude || !data.longitude) {
        throw new Error('ipwho.is returned incomplete data');
    }

    return {
        city: data.city,
        country: data.country,
        lat: data.latitude,
        lon: data.longitude
    };
};

/**
 * Get location from client IP with fallback to multiple APIs
 */
export const getLocationFromIp = async (clientIp) => {
    const localIps = ['127.0.0.1', '::1', '::ffff:127.0.0.1'];

    if (localIps.includes(clientIp)) {
        clientIp = FallbackIp;
    }

    try {
        return await fetchFromIpGeoLocation(clientIp);
    } catch (error1) {
        if (process.env.NODE_ENV === 'development') {
            console.warn('ipgeolocation failed, trying ipinfo...', error1);
        }

        try {
            return await fetchFromIpInfo(clientIp);
        } catch (error2) {
            if (process.env.NODE_ENV === 'development') {
                console.warn('ipinfo failed, trying ipwho.is...', error2);
            }

            try {
                return await fetchFromIpWho(clientIp);
            } catch (error3) {
                if (process.env.NODE_ENV === 'development') {
                    console.warn('ipwho.is failed:', error3);
                }
                throw new Error('All location services failed');
            }
        }
    }
};

/**
 * Search for city coordinates using OpenStreetMap Nominatim API
 */
export const searchCity = async (city) => {

    const apiUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`;

    const response = await fetch(apiUrl, {
        headers: {
            'User-Agent': 'Meteo/1.0 (email@gmail.com)'
        }
    });
    if (!response.ok) {
        throw new Error('Failed to search city');
    }
    const data = await response.json();
    return data;
};

/**
 * Fetch weather data from OpenWeatherMap API
 */
export const getWeather = async (lat, lon) => {

    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;

    const response = await fetch(apiUrl);
    if (!response.ok) {
        throw new Error('Failed to fetch weather data');
    }
    const data = await response.json();
    return data;
};