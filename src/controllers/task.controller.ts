// task.controller.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

import { CreateTaskDto, UpdateTaskDto } from '../dto/task.dto';

const prisma = new PrismaClient();

/**
 * Get all tasks with filtering and sorting
 */
export const getAllTasks = async (req: Request, res: Response): Promise<Response> => {
    try {
        const userId = req.user.userId;
        const { status, priority, dueDate, categoryId, sortBy = 'createdAt', order = 'desc' } = req.query;

        // Build filters
        const filters: any = { userId };

        if (status) {
            filters.status = status;
        }

        if (priority) {
            filters.priority = priority;
        }

        if (dueDate) {
            const date = new Date(dueDate as string);
            filters.dueDate = {
                gte: new Date(date.setHours(0, 0, 0, 0)),
                lt: new Date(date.setHours(23, 59, 59, 999))
            };
        }

        if (categoryId) {
            filters.categoryId = categoryId;
        }

        // Execute query with filters and sorting
        const tasks = await prisma.task.findMany({
            where: filters,
            orderBy: {
                [sortBy as string]: order
            },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        return res.status(200).json({ tasks });
    } catch (error) {
        console.error('Get all tasks error:', error);
        return res.status(500).json({ message: 'An error occurred while fetching tasks' });
    }
};

/**
 * Get task by ID
 */
export const getTaskById = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const task = await prisma.task.findFirst({
            where: {
                id,
                userId
            },
            include: {
                category: true,
                comments: {
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
                }
            }
        });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        return res.status(200).json({ task });
    } catch (error) {
        console.error('Get task by ID error:', error);
        return res.status(500).json({ message: 'An error occurred while fetching the task' });
    }
};

/**
 * Create a new task
 */
export const createTask = async (req: Request, res: Response): Promise<Response> => {
    try {
        const userId = req.user.userId;

        // Validate request body
        const createTaskDto = plainToInstance(CreateTaskDto, req.body);
        const errors = await validate(createTaskDto);

        if (errors.length > 0) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.map(error => ({
                    property: error.property,
                    constraints: error.constraints
                }))
            });
        }

        // If category ID is provided, verify it belongs to the user
        if (createTaskDto.categoryId) {
            const category = await prisma.category.findFirst({
                where: {
                    id: createTaskDto.categoryId,
                    userId
                }
            });

            if (!category) {
                return res.status(404).json({ message: 'Category not found or does not belong to you' });
            }
        }

        // Create the task
        const task = await prisma.task.create({
            data: {
                title: createTaskDto.title,
                description: createTaskDto.description,
                status: createTaskDto.status || 'PENDING',
                priority: createTaskDto.priority || 'MEDIUM',
                dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
                userId,
                categoryId: createTaskDto.categoryId
            }
        });

        return res.status(201).json({
            message: 'Task created successfully',
            task
        });
    } catch (error) {
        console.error('Create task error:', error);
        return res.status(500).json({ message: 'An error occurred while creating the task' });
    }
};

/**
 * Update a task
 */
export const updateTask = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        // Validate request body
        const updateTaskDto = plainToInstance(UpdateTaskDto, req.body);
        const errors = await validate(updateTaskDto, { skipMissingProperties: true });

        if (errors.length > 0) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.map(error => ({
                    property: error.property,
                    constraints: error.constraints
                }))
            });
        }

        // Check if task exists and belongs to the user
        const existingTask = await prisma.task.findFirst({
            where: {
                id,
                userId
            }
        });

        if (!existingTask) {
            return res.status(404).json({ message: 'Task not found or you do not have permission to update it' });
        }

        // If category ID is provided, verify it belongs to the user
        if (updateTaskDto.categoryId) {
            const category = await prisma.category.findFirst({
                where: {
                    id: updateTaskDto.categoryId,
                    userId
                }
            });

            if (!category) {
                return res.status(404).json({ message: 'Category not found or does not belong to you' });
            }
        }

        // Update the task
        const task = await prisma.task.update({
            where: { id },
            data: {
                title: updateTaskDto.title,
                description: updateTaskDto.description,
                status: updateTaskDto.status,
                priority: updateTaskDto.priority,
                dueDate: updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : undefined,
                categoryId: updateTaskDto.categoryId
            }
        });

        return res.status(200).json({
            message: 'Task updated successfully',
            task
        });
    } catch (error) {
        console.error('Update task error:', error);
        return res.status(500).json({ message: 'An error occurred while updating the task' });
    }
};

/**
 * Delete a task
 */
export const deleteTask = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        // Check if task exists and belongs to the user
        const existingTask = await prisma.task.findFirst({
            where: {
                id,
                userId
            }
        });

        if (!existingTask) {
            return res.status(404).json({ message: 'Task not found or you do not have permission to delete it' });
        }

        // Delete the task
        await prisma.task.delete({
            where: { id }
        });

        return res.status(200).json({
            message: 'Task deleted successfully'
        });
    } catch (error) {
        console.error('Delete task error:', error);
        return res.status(500).json({ message: 'An error occurred while deleting the task' });
    }
};