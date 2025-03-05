// comment.controller.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateCommentDto, UpdateCommentDto } from '../dto/comment.dto';

const prisma = new PrismaClient();

export const getTaskComments = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { taskId } = req.params;
        const userId = req.user.userId;

        const task = await prisma.task.findFirst({
            where: {
                id: taskId,
            }
        });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const comments = await prisma.comment.findMany({
            where: {
                taskId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return res.status(200).json({ comments });
    } catch (error) {
        console.error('Get task comments error:', error);
        return res.status(500).json({ message: 'An error occurred while fetching comments' });
    }
};

export const createComment = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { taskId } = req.params;
        const userId = req.user.userId;

        const createCommentDto = plainToInstance(CreateCommentDto, req.body);
        const errors = await validate(createCommentDto);

        if (errors.length > 0) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.map(error => ({
                    property: error.property,
                    constraints: error.constraints
                }))
            });
        }

        const task = await prisma.task.findFirst({
            where: {
                id: taskId
            }
        });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const comment = await prisma.comment.create({
            data: {
                content: createCommentDto.content,
                taskId,
                userId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });

        return res.status(201).json({
            message: 'Comment added successfully',
            comment
        });
    } catch (error) {
        console.error('Create comment error:', error);
        return res.status(500).json({ message: 'An error occurred while creating the comment' });
    }
};

export const updateComment = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const updateCommentDto = plainToInstance(UpdateCommentDto, req.body);
        const errors = await validate(updateCommentDto);

        if (errors.length > 0) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.map(error => ({
                    property: error.property,
                    constraints: error.constraints
                }))
            });
        }

        const existingComment = await prisma.comment.findFirst({
            where: {
                id,
                userId
            }
        });

        if (!existingComment) {
            return res.status(404).json({ message: 'Comment not found or you do not have permission to update it' });
        }

        const comment = await prisma.comment.update({
            where: { id },
            data: {
                content: updateCommentDto.content
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });

        return res.status(200).json({
            message: 'Comment updated successfully',
            comment
        });
    } catch (error) {
        console.error('Update comment error:', error);
        return res.status(500).json({ message: 'An error occurred while updating the comment' });
    }
};

export const deleteComment = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const isAdmin = req.user.role === 'ADMIN';

        const comment = await prisma.comment.findUnique({
            where: { id },
            include: { task: true }
        });

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (comment.userId !== userId && comment.task.userId !== userId && !isAdmin) {
            return res.status(403).json({ message: 'You do not have permission to delete this comment' });
        }

        await prisma.comment.delete({
            where: { id }
        });

        return res.status(200).json({
            message: 'Comment deleted successfully'
        });
    } catch (error) {
        console.error('Delete comment error:', error);
        return res.status(500).json({ message: 'An error occurred while deleting the comment' });
    }
};