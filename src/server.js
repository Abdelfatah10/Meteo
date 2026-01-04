import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import weatherRoutes from './routes/weather.routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT;
const DOMAIN = process.env.DOMAIN;

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    message: 'Too many requests, try again later.'
});


const app = express();

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



// app.use((req, res, next) => {
//     const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress).split(',')[0].trim();
//     console.log(`Visitor IP: ${ip} - ${req.method} ${req.url}`);
//     next();
// });

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// API routes
app.use('/api', limiter, weatherRoutes);

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Meteo.html'));
});

// 404 handler
app.use((req, res) => {
    res.status(404).send('404 Not Found');
});


// // Global error handler
// app.use((err, req, res, next) => {
//     if (process.env.NODE_ENV === 'development') {
//         console.error(err);
//     }

//     const statusCode = err.statusCode || 500;

//     res.status(statusCode).json({
//         success: false,
//         message: statusCode === 500
//             ? 'Internal server error'
//             : err.message
//     });
// });





app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});