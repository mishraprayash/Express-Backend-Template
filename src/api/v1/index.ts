import { Router } from 'express';
import userRoutes from '../../modules/users/routes/user.routes';

const v1Router = Router();

// Health check
v1Router.get('/health', (req, res) => {
  res.json({ status: 'ok', version: 'v1' });
});

// API routes
v1Router.use('/users', userRoutes);

export default v1Router;
