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
  let clientIp = (req.headers['x-forwarded-for']?.split(',')[0] || req.ip)?.trim();
  const localIps = ['127.0.0.1', '::1', '::ffff:127.0.0.1'];
  const algerianFallbackIp = '105.235.132.1'; // Alg IP

  if (localIps.includes(clientIp)) {
    clientIp = algerianFallbackIp;
  }

  try {
    const response = await fetch(
      `https://api.ipgeolocation.io/ipgeo?apiKey=${ipGeoKey}&ip=${clientIp}`
    );
    const data = await response.json();
    if (data && data.latitude && data.longitude) {
      return res.json({
        city: data.city,
        country: data.country_name,
        lat: data.latitude,
        lon: data.longitude
      });
    } else {
      throw new Error('ipgeolocation returned incomplete data');
    }
  } catch (error1) {
    console.warn('ipgeolocation failed, trying ipinfo...', error1);

    try {
      const response = await fetch(`https://ipinfo.io/${clientIp}/json`);
      const data = await response.json();
      const [lat, lon] = data.loc.split(',');

      if (!lat || !lon) throw new Error('ipinfo returned invalid loc');

      return res.json({
        city: data.city,
        country: data.country,
        lat,
        lon
      });
    } catch (error2) {
      console.warn('ipinfo failed, trying ipwho.is...', error2);

      try {
        const response = await fetch(`https://ipwho.is/${clientIp}`);
        const data = await response.json();

        if (!data.success) throw new Error('ipwho.is failed');

        return res.json({
          city: data.city,
          country: data.country,
          lat: data.latitude,
          lon: data.longitude
        });
      } catch (error3) {
        console.error('All location fetch attempts failed:', error3);
        return res.status(500).json({
          city: 'Unknown',
          lat: 0,
          lon: 0,
          error: 'All location services failed'
        });
      }
    }
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


app.get('/local-now', (req, res) => {
  const timezone = parseInt(req.query.timezone); 

  if (isNaN(timezone)) {
    return res.status(400).send('Invalid timezone offset');
  }

  const nowUTC = new Date();
  const localTimestamp = nowUTC.getTime() + timezone * 1000;
  const local = new Date(localTimestamp);

  const formatterTime = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC'
  });

  const formatterDate = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC'
  });

  const formatterWeekday = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    timeZone: 'UTC'
  });

  res.json({
    time: formatterTime.format(local),
    date: formatterDate.format(local),
    weekday: formatterWeekday.format(local),
    hour: local.getUTCHours()
  });
});




app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
}); 
