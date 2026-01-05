import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import weatherRoutes from './routes/weather.routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOMAIN = process.env.DOMAIN;

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    keyGenerator: ipKeyGenerator,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests, try again later.'
});


const app = express();

// Trust proxy settings
app.set('trust proxy', 1);
// Disable the 'X-Powered-By' header for security
app.disable('x-powered-by');
// Use Helmet to set various HTTP headers for security
app.use(helmet());
// Enable CORS for specified domain
app.use(cors({
    origin: [
        DOMAIN
    ],
    methods: ['GET']
}));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// Status check endpoint
app.get('/ping', (req, res) => {
    res.status(200).send('pong');
});

// API routes
app.use('/api', limiter, weatherRoutes);



// 404 handler
app.use((req, res) => {
    res.status(404).send('404 Not Found');
});

// Global error handler
app.use((err, req, res, next) => {
    if (process.env.NODE_ENV === 'development') {
        console.error(err);
    }

    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

export default app;