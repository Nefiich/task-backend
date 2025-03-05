// comment.service.ts
import { PrismaClient } from '@prisma/client';
import { CreateCommentDto, UpdateCommentDto } from '../dto/comment.dto';

const prisma = new PrismaClient();

export const getTaskComments = async (taskId: string) => {
    const task = await prisma.task.findUnique({
        where: {
            id: taskId
        }
    });

    if (!task) {
        throw new Error('Task not found');
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

    return comments;
};

export const createComment = async (taskId: string, createCommentDto: CreateCommentDto, userId: string) => {
    const task = await prisma.task.findUnique({
        where: {
            id: taskId
        }
    });

    if (!task) {
        throw new Error('Task not found');
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

    return comment;
};

export const updateComment = async (id: string, updateCommentDto: UpdateCommentDto, userId: string) => {
    const existingComment = await prisma.comment.findFirst({
        where: {
            id,
            userId
        }
    });

    if (!existingComment) {
        throw new Error('Comment not found or you do not have permission to update it');
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

    return comment;
};

export const deleteComment = async (id: string, userId: string, isAdmin: boolean) => {
    const comment = await prisma.comment.findUnique({
        where: { id },
        include: { task: true }
    });

    if (!comment) {
        throw new Error('Comment not found');
    }

    if (comment.userId !== userId && comment.task.userId !== userId && !isAdmin) {
        throw new Error('You do not have permission to delete this comment');
    }

    await prisma.comment.delete({
        where: { id }
    });

    return true;
};