// auth.routes.ts
import { Router } from 'express';
import { register, login, getCurrentUser, logout } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateDto } from '../middleware/validation.middleware';
import { RegisterDto, LoginDto } from '../dto/auth.dto';

const router = Router();

router.post('/register', validateDto(RegisterDto), register);
router.post('/login', validateDto(LoginDto), login);
router.post('/logout', logout);
router.get('/me', authenticate, getCurrentUser);

export default router;