import { Router } from 'express';
import { getWeatherByIpController, searchCityController, getWeatherByCoordinatesController } from '../controllers/weather.controller.js';


const weatherRoutes = Router();

// Get weather by client IP
weatherRoutes.get('/weatherbyip', getWeatherByIpController);

// Search city and get weather
weatherRoutes.get('/search', searchCityController);

// Get weather by coordinates
weatherRoutes.get('/getweather', getWeatherByCoordinatesController);

export default weatherRoutes;