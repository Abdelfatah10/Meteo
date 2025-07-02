import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import path, { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Meteo.html'));
});
const ipGeoKey = process.env.IPGEO_API_KEY ;

app.get('/location', async (req, res) => {
  try {
    const clientIp =
      req.headers['x-forwarded-for']?.split(',')[0] || req.ip;

    const response = await fetch(
      `https://api.ipgeolocation.io/ipgeo?apiKey=${ipGeoKey}&ip=${clientIp}`
    );

    const data = await response.json();

    if (data && data.latitude && data.longitude) {
      res.json({
        city: data.city,
        country: data.country_name,
        lat: data.latitude,
        lon: data.longitude
      });
    } else {
      res.status(500).json({ error: 'Failed to get location' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Request failed' });
  }
});


app.get('/search', async (req, res) => {
  const city = req.query.q;

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`, {
      headers: {
        'User-Agent': 'Meteo/1.0 (email@gmail.com)' 
      }
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Search failed' });
  }
});

app.get('/getweather', async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Missing coordinates' });
  }

  try {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API_KEY}&units=metric`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});



app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
}); 
