// task.service.ts
import { PrismaClient } from '@prisma/client';
import { CreateTaskDto, UpdateTaskDto, FilterTasksDto } from '../dto/task.dto';

const prisma = new PrismaClient();

export const getAllTasks = async (userId: string, filterDto: FilterTasksDto) => {
    const { status, priority, dueDate, categoryId, sortBy = 'createdAt', order = 'desc' } = filterDto;

    const filters: any = { userId };

    if (status) {
        filters.status = status;
    }

    if (priority) {
        filters.priority = priority;
    }

    if (dueDate) {
        const date = new Date(dueDate);
        filters.dueDate = {
            gte: new Date(date.setHours(0, 0, 0, 0)),
            lt: new Date(date.setHours(23, 59, 59, 999))
        };
    }

    if (categoryId) {
        filters.categoryId = categoryId;
    }

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

    return tasks;
};

export const getTaskById = async (id: string, userId: string) => {
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
        throw new Error('Task not found');
    }

    return task;
};

export const createTask = async (createTaskDto: CreateTaskDto, userId: string) => {
    if (createTaskDto.categoryId) {
        const category = await prisma.category.findFirst({
            where: {
                id: createTaskDto.categoryId,
                userId
            }
        });

        if (!category) {
            throw new Error('Category not found or does not belong to you');
        }
    }

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

    return task;
};

export const updateTask = async (id: string, updateTaskDto: UpdateTaskDto, userId: string) => {
    const existingTask = await prisma.task.findFirst({
        where: {
            id,
            userId
        }
    });

    if (!existingTask) {
        throw new Error('Task not found or you do not have permission to update it');
    }

    if (updateTaskDto.categoryId) {
        const category = await prisma.category.findFirst({
            where: {
                id: updateTaskDto.categoryId,
                userId
            }
        });

        if (!category) {
            throw new Error('Category not found or does not belong to you');
        }
    }

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

    return task;
};

export const deleteTask = async (id: string, userId: string) => {
    const existingTask = await prisma.task.findFirst({
        where: {
            id,
            userId
        }
    });

    if (!existingTask) {
        throw new Error('Task not found or you do not have permission to delete it');
    }

    await prisma.task.delete({
        where: { id }
    });

    return true;
};