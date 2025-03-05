// user.controller.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';

const prisma = new PrismaClient();

export const getAllUsers = async (req: Request, res: Response): Promise<Response> => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
            }
        });

        return res.status(200).json({ users });
    } catch (error) {
        console.error('Get all users error:', error);
        return res.status(500).json({ message: 'An error occurred while fetching users' });
    }
};

export const getUserById = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({ user });
    } catch (error) {
        console.error('Get user by ID error:', error);
        return res.status(500).json({ message: 'An error occurred while fetching the user' });
    }
};

export const createUser = async (req: Request, res: Response): Promise<Response> => {
    try {
        const createUserDto = plainToInstance(CreateUserDto, req.body);
        const errors = await validate(createUserDto);

        if (errors.length > 0) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.map(error => ({
                    property: error.property,
                    constraints: error.constraints
                }))
            });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email: createUserDto.email }
        });

        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

        const user = await prisma.user.create({
            data: {
                email: createUserDto.email,
                password: hashedPassword,
                firstName: createUserDto.firstName,
                lastName: createUserDto.lastName,
                role: createUserDto.role || 'USER',
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
            }
        });

        return res.status(201).json({
            message: 'User created successfully',
            user
        });
    } catch (error) {
        console.error('Create user error:', error);
        return res.status(500).json({ message: 'An error occurred while creating the user' });
    }
};

export const updateUser = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;

        const updateUserDto = plainToInstance(UpdateUserDto, req.body);
        const errors = await validate(updateUserDto, { skipMissingProperties: true });

        if (errors.length > 0) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.map(error => ({
                    property: error.property,
                    constraints: error.constraints
                }))
            });
        }

        const existingUser = await prisma.user.findUnique({
            where: { id }
        });

        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (updateUserDto.email) {
            const userWithEmail = await prisma.user.findUnique({
                where: { email: updateUserDto.email }
            });

            if (userWithEmail && userWithEmail.id !== id) {
                return res.status(409).json({ message: 'Email already in use' });
            }
        }

        const updateData: any = {
            email: updateUserDto.email,
            firstName: updateUserDto.firstName,
            lastName: updateUserDto.lastName,
            role: updateUserDto.role,
        };

        if (updateUserDto.password) {
            updateData.password = await bcrypt.hash(updateUserDto.password, 10);
        }

        const user = await prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
            }
        });

        return res.status(200).json({
            message: 'User updated successfully',
            user
        });
    } catch (error) {
        console.error('Update user error:', error);
        return res.status(500).json({ message: 'An error occurred while updating the user' });
    }
};

export const deleteUser = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;

        const existingUser = await prisma.user.findUnique({
            where: { id }
        });

        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        await prisma.user.delete({
            where: { id }
        });

        return res.status(200).json({
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        return res.status(500).json({ message: 'An error occurred while deleting the user' });
    }
};