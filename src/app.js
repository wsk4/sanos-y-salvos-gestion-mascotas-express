import express from 'express';
import cors from 'cors';
import mascotaRoutes from './routes/mascota.routes.js';
import healthRoutes from './routes/health.routes.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/v1/mascotas', mascotaRoutes);
app.use('/health', healthRoutes);

app.use(errorHandler);

export default app;