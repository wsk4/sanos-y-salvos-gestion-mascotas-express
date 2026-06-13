import express from 'express';
import cors from 'cors';
import mascotaRoutes from './routes/mascota.routes.js';
import healthRoutes from './routes/health.routes.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();
/*
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        process.env.BFF_URL,
        process.env.FRONTEND_URL,
    ].filter(Boolean),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'Cache-Control'],
    credentials: true,
}));
*/
app.use(express.json());

app.use('/api/v1/mascotas', mascotaRoutes);
app.use('/health', healthRoutes);

app.use(errorHandler);

export default app;