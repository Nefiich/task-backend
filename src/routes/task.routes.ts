// task.routes.ts
import { Router } from 'express';
import {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask
} from '../controllers/task.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateDto, validateQueryParams } from '../middleware/validation.middleware';
import { CreateTaskDto, UpdateTaskDto, FilterTasksDto } from '../dto/task.dto';

const router = Router();

router.use(authenticate);

router.get('/', validateQueryParams(FilterTasksDto), getAllTasks);
router.get('/:id', getTaskById);
router.post('/', validateDto(CreateTaskDto), createTask);
router.put('/:id', validateDto(UpdateTaskDto, true), updateTask);
router.delete('/:id', deleteTask);

export default router;