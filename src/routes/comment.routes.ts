// comment.routes.ts
import { Router } from 'express';
import {
    getTaskComments,
    createComment,
    updateComment,
    deleteComment
} from '../controllers/comment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateDto } from '../middleware/validation.middleware';
import { CreateCommentDto, UpdateCommentDto } from '../dto/comment.dto';

const router = Router();

router.use(authenticate);

router.get('/task/:taskId', getTaskComments);
router.post('/task/:taskId', validateDto(CreateCommentDto), createComment);
router.put('/:id', validateDto(UpdateCommentDto), updateComment);
router.delete('/:id', deleteComment);

export default router;