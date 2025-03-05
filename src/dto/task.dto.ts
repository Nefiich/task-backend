// task.dto.ts
import { IsNotEmpty, IsString, IsEnum, IsOptional, IsUUID, IsDateString } from 'class-validator';
import { TaskStatus, TaskPriority } from '@prisma/client';

export class CreateTaskDto {
    @IsNotEmpty({ message: 'Title is required' })
    @IsString({ message: 'Title must be a string' })
    title!: string;

    @IsOptional()
    @IsString({ message: 'Description must be a string' })
    description?: string;

    @IsOptional()
    @IsEnum(TaskStatus, { message: 'Status must be a valid task status' })
    status?: TaskStatus;

    @IsOptional()
    @IsEnum(TaskPriority, { message: 'Priority must be a valid task priority' })
    priority?: TaskPriority;

    @IsOptional()
    @IsDateString({}, { message: 'Due date must be a valid date string' })
    dueDate?: string;

    @IsOptional()
    @IsUUID('4', { message: 'Category ID must be a valid UUID' })
    categoryId?: string;
}

export class UpdateTaskDto {
    @IsOptional()
    @IsString({ message: 'Title must be a string' })
    title?: string;

    @IsOptional()
    @IsString({ message: 'Description must be a string' })
    description?: string;

    @IsOptional()
    @IsEnum(TaskStatus, { message: 'Status must be a valid task status' })
    status?: TaskStatus;

    @IsOptional()
    @IsEnum(TaskPriority, { message: 'Priority must be a valid task priority' })
    priority?: TaskPriority;

    @IsOptional()
    @IsDateString({}, { message: 'Due date must be a valid date string' })
    dueDate?: string;

    @IsOptional()
    @IsUUID('4', { message: 'Category ID must be a valid UUID' })
    categoryId?: string;
}

export class FilterTasksDto {
    @IsOptional()
    @IsEnum(TaskStatus, { message: 'Status must be a valid task status' })
    status?: TaskStatus;

    @IsOptional()
    @IsEnum(TaskPriority, { message: 'Priority must be a valid task priority' })
    priority?: TaskPriority;

    @IsOptional()
    @IsDateString({}, { message: 'Due date must be a valid date string' })
    dueDate?: string;

    @IsOptional()
    @IsUUID('4', { message: 'Category ID must be a valid UUID' })
    categoryId?: string;

    @IsOptional()
    @IsString()
    sortBy?: string;

    @IsOptional()
    @IsString()
    order?: 'asc' | 'desc';
}