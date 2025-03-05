// jwt.util.ts
const jwt = require('jsonwebtoken');
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/jwt';

interface TokenPayload {
    userId: string;
    email: string;
    role: string;
}

export const generateToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, JWT_SECRET as jwt.Secret, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): TokenPayload => {
    try {
        return jwt.verify(token, JWT_SECRET as jwt.Secret) as TokenPayload;
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            throw new Error('Invalid token');
        }
        if (error instanceof jwt.TokenExpiredError) {
            throw new Error('Token expired');
        }
        throw new Error('Token verification failed');
    }
};

export const extractTokenFromHeader = (authorizationHeader?: string): string => {
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
        throw new Error('Authorization header missing or invalid');
    }

    return authorizationHeader.split(' ')[1];
};

export const decodeToken = (token: string): TokenPayload | null => {
    try {
        return jwt.decode(token) as TokenPayload;
    } catch (error) {
        return null;
    }
};