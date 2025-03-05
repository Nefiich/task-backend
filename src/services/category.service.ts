// category.service.ts
import { PrismaClient } from '@prisma/client';
import { CreateCategoryDto, UpdateCategoryDto } from '../dto/category.dto';

const prisma = new PrismaClient();

export const getAllCategories = async (userId: string) => {
    const categories = await prisma.category.findMany({
        where: { userId },
        orderBy: { name: 'asc' }
    });

    return categories;
};

export const getCategoryById = async (id: string, userId: string) => {
    const category = await prisma.category.findFirst({
        where: {
            id,
            userId
        }
    });

    if (!category) {
        throw new Error('Category not found');
    }

    return category;
};

export const createCategory = async (createCategoryDto: CreateCategoryDto, userId: string) => {
    const existingCategory = await prisma.category.findFirst({
        where: {
            name: createCategoryDto.name,
            userId
        }
    });

    if (existingCategory) {
        throw new Error('Category with this name already exists');
    }

    const category = await prisma.category.create({
        data: {
            name: createCategoryDto.name,
            description: createCategoryDto.description,
            userId
        }
    });

    return category;
};

export const updateCategory = async (id: string, updateCategoryDto: UpdateCategoryDto, userId: string) => {
    const existingCategory = await prisma.category.findFirst({
        where: {
            id,
            userId
        }
    });

    if (!existingCategory) {
        throw new Error('Category not found or you do not have permission to update it');
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
            throw new Error('Category with this name already exists');
        }
    }

    const category = await prisma.category.update({
        where: { id },
        data: {
            name: updateCategoryDto.name,
            description: updateCategoryDto.description
        }
    });

    return category;
};

export const deleteCategory = async (id: string, userId: string) => {
    const existingCategory = await prisma.category.findFirst({
        where: {
            id,
            userId
        }
    });

    if (!existingCategory) {
        throw new Error('Category not found or you do not have permission to delete it');
    }

    await prisma.category.delete({
        where: { id }
    });

    return true;
};