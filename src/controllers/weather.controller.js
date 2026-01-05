import { getLocationFromIp, searchCity, getWeather } from '../services/weather.service.js';
import { getLocalNow } from '../utils/timeUtils.js';



// Get weather by client IP
export async function getWeatherByIpController(req, res) {
    try {
        const clientIp = (req.headers['x-forwarded-for']?.split(',')[0] || req.ip)?.trim();
        const location = await getLocationFromIp(clientIp);
        if (!location || !location.lat || !location.lon) {
            return res.status(502).json({
                success: false,
                message: 'Weather service is temporarily unavailable'
            });
        }
        const data = await getWeather(location.lat, location.lon);
        if (!data || !data.city || !data.list) {
            return res.status(502).json({
                success: false,
                message: 'Weather service is temporarily unavailable'
            });
        }
        const localTime = getLocalNow(data.city.timezone);
        if (!localTime) {
            return res.status(502).json({
                success: false,
                message: 'Weather service is temporarily unavailable'
            });
        }
        return res.status(200).json({
            success: true,
            data,
            localTime
        });
    } catch (err) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Weather fetch error:', err);
        }
        const status = err.statusCode || 500;
        return res.status(status).json({
            success: false,
            message: 'Weather service is temporarily unavailable'
        });
    }
}

// Search city and get weather
export async function searchCityController(req, res) {
    try {
        const city = req.query.q;
        if (!city || typeof city !== 'string' || city.length > 100 || /[^a-zA-Z\s'-]/.test(city)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid city parameter'
            });
        }
        const results = await searchCity(city);
        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'City not found'
            });
        }
        const { lat, lon } = results[0];
        if (!lat || !lon || isNaN(Number(lat)) || isNaN(Number(lon)) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
            return res.status(502).json({
                success: false,
                message: 'Weather service is temporarily unavailable'
            });
        }
        const data = await getWeather(lat, lon);
        if (!data || !data.city || !data.list) {
            return res.status(502).json({
                success: false,
                message: 'Weather service is temporarily unavailable'
            });
        }
        const localTime = getLocalNow(data.city.timezone);
        if (!localTime) {
            return res.status(502).json({
                success: false,
                message: 'Weather service is temporarily unavailable'
            });
        }
        return res.status(200).json({
            success: true,
            data,
            localTime
        });
    } catch (err) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Weather fetch error:', err);
        }
        const status = err.statusCode || 500;
        return res.status(status).json({
            success: false,
            message: 'Weather service is temporarily unavailable'
        });
    }
}

// Get weather by coordinates
export async function getWeatherByCoordinatesController(req, res) {
    try {
        const { lat, lon } = req.query;
        if (!lat || !lon) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }
        const latitude = Number(lat);
        const longitude = Number(lon);

        if (Number.isNaN(latitude) || Number.isNaN(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            return res.status(400).json({
                success: false,
                message: 'Invalid coordinates'
            });
        }
        const data = await getWeather(latitude, longitude);
        if (!data || !data.city || !data.list) {
            return res.status(502).json({
                success: false,
                message: 'Weather service is temporarily unavailable'
            });
        }
        const localTime = getLocalNow(data.city.timezone);
        if (!localTime) {
            return res.status(502).json({
                success: false,
                message: 'Weather service is temporarily unavailable'
            });
        }
        return res.status(200).json({
            success: true,
            data,
            localTime
        });
    } catch (err) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Weather fetch error:', err);
        }
        const status = err.statusCode || 500;
        return res.status(status).json({
            success: false,
            message: 'Weather service is temporarily unavailable'
        });
    }
}