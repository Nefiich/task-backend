// auth.controller.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

import { LoginDto, RegisterDto } from '../dto/auth.dto';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/jwt';

const prisma = new PrismaClient();

/**
 * User registration controller
 */
export const register = async (req: Request, res: Response): Promise<Response> => {
    try {
        // Validate request body
        const registerDto = plainToInstance(RegisterDto, req.body);
        const errors = await validate(registerDto);

        if (errors.length > 0) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.map(error => ({
                    property: error.property,
                    constraints: error.constraints
                }))
            });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: registerDto.email }
        });

        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        // Create the user
        const user = await prisma.user.create({
            data: {
                email: registerDto.email,
                password: hashedPassword,
                firstName: registerDto.firstName,
                lastName: registerDto.lastName,
                role: registerDto.role || 'USER',
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
            message: 'User registered successfully',
            user
        });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ message: 'An error occurred during registration' });
    }
};

/**
 * User login controller
 */
export const login = async (req: Request, res: Response): Promise<Response> => {
    try {
        // Validate request body
        const loginDto = plainToInstance(LoginDto, req.body);
        const errors = await validate(loginDto);

        if (errors.length > 0) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.map(error => ({
                    property: error.property,
                    constraints: error.constraints
                }))
            });
        }

        // Find the user
        const user = await prisma.user.findUnique({
            where: { email: loginDto.email }
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        return res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'An error occurred during login' });
    }
};

/**
 * Get current user information
 */
export const getCurrentUser = async (req: Request, res: Response): Promise<Response> => {
    try {
        // The user ID is set by the auth middleware
        const userId = req.user.userId;

        const user = await prisma.user.findUnique({
            where: { id: userId },
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
        console.error('Get current user error:', error);
        return res.status(500).json({ message: 'An error occurred while fetching user information' });
    }
};

/**
 * Logout (client-side)
 */
export const logout = (_req: Request, res: Response): Response => {
    // JWT is stateless, so we don't need to do anything on the server
    // The client should remove the token
    return res.status(200).json({ message: 'Logged out successfully' });
};