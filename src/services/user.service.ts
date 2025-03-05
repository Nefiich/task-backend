// user.service.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';

const prisma = new PrismaClient();

export const getAllUsers = async () => {
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

    return users;
};

export const getUserById = async (id: string) => {
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
        throw new Error('User not found');
    }

    return user;
};

export const createUser = async (createUserDto: CreateUserDto) => {
    const existingUser = await prisma.user.findUnique({
        where: { email: createUserDto.email }
    });

    if (existingUser) {
        throw new Error('User with this email already exists');
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

    return user;
};

export const updateUser = async (id: string, updateUserDto: UpdateUserDto) => {
    const existingUser = await prisma.user.findUnique({
        where: { id }
    });

    if (!existingUser) {
        throw new Error('User not found');
    }

    if (updateUserDto.email) {
        const userWithEmail = await prisma.user.findUnique({
            where: { email: updateUserDto.email }
        });

        if (userWithEmail && userWithEmail.id !== id) {
            throw new Error('Email already in use');
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

    return user;
};

export const deleteUser = async (id: string) => {
    const existingUser = await prisma.user.findUnique({
        where: { id }
    });

    if (!existingUser) {
        throw new Error('User not found');
    }

    await prisma.user.delete({
        where: { id }
    });

    return true;
};