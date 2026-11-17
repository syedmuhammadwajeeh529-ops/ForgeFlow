import cors from 'cors';
import { env } from './env.js';

const allowedOrigins = new Set([
  env.frontendUrl,
  'http://localhost:5173',
  'http://127.0.0.1:5173'
]);

const corsOptions = {
  origin(origin, callback) {
    // Requests without Origin are typically server-to-server or local health checks.
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);

    const error = new Error('This origin is not allowed by the ForgeFlow API.');
    error.statusCode = 403;
    return callback(error);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
};

export default cors(corsOptions);
