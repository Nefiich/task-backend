// category.controller.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateCategoryDto, UpdateCategoryDto } from '../dto/category.dto';

const prisma = new PrismaClient();

export const getAllCategories = async (req: Request, res: Response): Promise<Response> => {
    try {
        const userId = req.user.userId;

        const categories = await prisma.category.findMany({
            where: { userId },
            orderBy: { name: 'asc' }
        });

        return res.status(200).json({ categories });
    } catch (error) {
        console.error('Get all categories error:', error);
        return res.status(500).json({ message: 'An error occurred while fetching categories' });
    }
};

export const getCategoryById = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const category = await prisma.category.findFirst({
            where: {
                id,
                userId
            }
        });

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        return res.status(200).json({ category });
    } catch (error) {
        console.error('Get category by ID error:', error);
        return res.status(500).json({ message: 'An error occurred while fetching the category' });
    }
};

export const createCategory = async (req: Request, res: Response): Promise<Response> => {
    try {
        const userId = req.user.userId;

        const createCategoryDto = plainToInstance(CreateCategoryDto, req.body);
        const errors = await validate(createCategoryDto);

        if (errors.length > 0) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.map(error => ({
                    property: error.property,
                    constraints: error.constraints
                }))
            });
        }

        const existingCategory = await prisma.category.findFirst({
            where: {
                name: createCategoryDto.name,
                userId
            }
        });

        if (existingCategory) {
            return res.status(409).json({ message: 'Category with this name already exists' });
        }

        const category = await prisma.category.create({
            data: {
                name: createCategoryDto.name,
                description: createCategoryDto.description,
                userId
            }
        });

        return res.status(201).json({
            message: 'Category created successfully',
            category
        });
    } catch (error) {
        console.error('Create category error:', error);
        return res.status(500).json({ message: 'An error occurred while creating the category' });
    }
};

export const updateCategory = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const updateCategoryDto = plainToInstance(UpdateCategoryDto, req.body);
        const errors = await validate(updateCategoryDto, { skipMissingProperties: true });

        if (errors.length > 0) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.map(error => ({
                    property: error.property,
                    constraints: error.constraints
                }))
            });
        }

        const existingCategory = await prisma.category.findFirst({
            where: {
                id,
                userId
            }
        });

        if (!existingCategory) {
            return res.status(404).json({ message: 'Category not found or you do not have permission to update it' });
        }

        if (updateCategoryDto.name) {
            const categoryWithName = await prisma.category.findFirst({
                where: {
                    name: updateCategoryDto.name,
                    userId,
                    id: { not: id }
                }
            });

            if (categoryWithName) {
                return res.status(409).json({ message: 'Category with this name already exists' });
            }
        }

        const category = await prisma.category.update({
            where: { id },
            data: {
                name: updateCategoryDto.name,
                description: updateCategoryDto.description
            }
        });

        return res.status(200).json({
            message: 'Category updated successfully',
            category
        });
    } catch (error) {
        console.error('Update category error:', error);
        return res.status(500).json({ message: 'An error occurred while updating the category' });
    }
};

export const deleteCategory = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const existingCategory = await prisma.category.findFirst({
            where: {
                id,
                userId
            }
        });

        if (!existingCategory) {
            return res.status(404).json({ message: 'Category not found or you do not have permission to delete it' });
        }

        await prisma.category.delete({
            where: { id }
        });

        return res.status(200).json({
            message: 'Category deleted successfully'
        });
    } catch (error) {
        console.error('Delete category error:', error);
        return res.status(500).json({ message: 'An error occurred while deleting the category' });
    }
};