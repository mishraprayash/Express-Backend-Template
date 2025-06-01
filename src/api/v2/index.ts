import { Router } from 'express';
import userRoutes from '../../modules/users/routes/user.routes.v2';

const v2Router = Router();

// Health check
v2Router.get('/health', (req, res) => {
  res.json({ status: 'ok', version: 'v2' });
});

// API routes
v2Router.use('/users', userRoutes);

export default v2Router;
