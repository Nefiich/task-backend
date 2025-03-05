// index.ts
import { Router } from 'express';
import authRoutes from './auth.routes';
import taskRoutes from './task.routes';
import categoryRoutes from './category.routes';
import commentRoutes from './comment.routes';
import userRoutes from './user.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/categories', categoryRoutes);
router.use('/comments', commentRoutes);
router.use('/users', userRoutes);

export default router;