import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middleware/errorHandler';
import { userRoutes } from './features/users/index';
import { assetRoutes } from './features/assets';
import { ticketRoutes } from './features/tickets/ticket.routes';

const app: Express = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(userRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/tickets', ticketRoutes);

app.get('/health', (_request, response) => {
  response.status(200).json({ status: 'ok' });
});

app.use(errorHandler);

export { app };
