import { Router } from 'express';
import { loginHandler, registerHandler } from './user.controller';

const userRoutes = Router();

userRoutes.post('/register', registerHandler);
userRoutes.post('/login', loginHandler);

export { userRoutes };
