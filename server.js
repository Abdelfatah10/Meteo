import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import weatherRoutes from './routes/weather.routes.js';


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const PORT = process.env.PORT || 4000;
const DOMAIN = process.env.DOMAIN;

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    message: 'Too many requests, try again later.'
});

app.use(cors({
  origin: [
    DOMAIN
  ],
  methods: ['GET']
}));

app.use(helmet());

app.use(morgan('combined'));

app.disable('x-powered-by');

app.use(express.static(path.join(__dirname, 'public')));


app.use('/api', limiter, weatherRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Meteo.html'));
});



app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});