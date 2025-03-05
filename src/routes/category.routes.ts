// category.routes.ts
import { Router } from 'express';
import {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
} from '../controllers/category.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateDto } from '../middleware/validation.middleware';
import { CreateCategoryDto, UpdateCategoryDto } from '../dto/category.dto';

const router = Router();

router.use(authenticate);

router.get('/', getAllCategories);
router.get('/:id', getCategoryById);
router.post('/', validateDto(CreateCategoryDto), createCategory);
router.put('/:id', validateDto(UpdateCategoryDto, true), updateCategory);
router.delete('/:id', deleteCategory);

export default router;