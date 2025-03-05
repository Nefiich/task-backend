// auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
const jwt = require('jsonwebtoken');
import { PrismaClient } from '@prisma/client';
import { JWT_SECRET } from '../config/jwt';

const prisma = new PrismaClient();

declare global {
    namespace Express {
        interface Request {
            user: {
                userId: string;
                email: string;
                role: string;
            };
        }
    }
}

export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, JWT_SECRET) as {
            userId: string;
            email: string;
            role: string;
        };

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId }
        });

        if (!user) {
            return res.status(401).json({ message: 'User no longer exists' });
        }

        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role
        };

        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: 'Token expired' });
        }
        console.error('Authentication error:', error);
        return res.status(500).json({ message: 'An error occurred during authentication' });
    }
};