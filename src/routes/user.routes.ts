// user.routes.ts
import { Router } from 'express';
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
} from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/role.middleware';
import { validateDto } from '../middleware/validation.middleware';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';

const router = Router();

router.use(authenticate);
router.use(isAdmin);

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', validateDto(CreateUserDto), createUser);
router.put('/:id', validateDto(UpdateUserDto, true), updateUser);
router.delete('/:id', deleteUser);

export default router;