import { Router } from 'express';
import { getLocationFromIp, searchCity, getWeather } from '../services/weatherService.js';
import { getLocalNow } from '../utils/timeUtils.js';

const weatherRoutes = Router();


weatherRoutes.get('/weatherbyip', async (req, res) => {
    try {
        const clientIp = (req.headers['x-forwarded-for']?.split(',')[0] || req.ip)?.trim();
        const location = await getLocationFromIp(clientIp);
        if (!location || !location.lat || !location.lon) {
            throw new Error('Invalid location data');
        }
        const data = await getWeather(location.lat, location.lon);
        return res.status(200).json(data);
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Location fetch error:', error);
        }
        return res.status(400).json({ error: error.message || 'Failed to fetch location data' });
    }
});


weatherRoutes.get('/local-now', (req, res) => {
    try {
        const timezone = req.query.timezone;
        const localNow = getLocalNow(timezone);
        return res.status(200).json(localNow);
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Local time calculation error:', error);
        }
        return res.status(400).json({ error: error.message || 'Failed to calculate local time' });
    }
});


weatherRoutes.get('/search', async (req, res) => {
    try {
        const city = req.query.q;
        if (!city || typeof city !== 'string' || city.length > 100) {
            return res.status(400).json({ error: 'Invalid city name' });
        }
        const results = await searchCity(city);
        if (results.length === 0) {
            return res.status(404).json({ error: 'City not found' });
        }
        const { lat, lon } = results[0];
        const data = await getWeather(lat, lon);
        return res.status(200).json(data);
    } catch (err) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Search error:', err);
        }
        return res.status(500).json({ error: 'Search failed' });
    }
});


weatherRoutes.get('/getweather', async (req, res) => {
    try {
        const { lat, lon } = req.query;
        if (!lat || !lon) {
            return res.status(400).json({ error: 'Missing coordinates' });
        }
        if (lat.length > 20 || lon.length > 20 || isNaN(parseFloat(lat)) || isNaN(parseFloat(lon))) {
            return res.status(400).json({ error: 'Invalid coordinates' });
        }
        const data = await getWeather(lat, lon);
        return res.status(200).json(data);
    } catch (err) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Weather fetch error:', err);
        }
        return res.status(400).json({ error: err.message || 'Failed to fetch weather data' });
    }
});


export default weatherRoutes;