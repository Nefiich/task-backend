// role.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';

export const authorize = (roles: Role[] = []) => {
    return (req: Request, res: Response, next: NextFunction): Response | void => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        if (roles.length && !roles.includes(req.user.role as Role)) {
            return res.status(403).json({
                message: 'You do not have permission to access this resource'
            });
        }

        next();
    };
};

export const isAdmin = (req: Request, res: Response, next: NextFunction): Response | void => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({
            message: 'Admin access required'
        });
    }

    next();
};

export const isResourceOwner = (
    resourceGetter: (req: Request) => Promise<{ userId?: string; } | null>
) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Authentication required' });
            }

            // Admin can access any resource
            if (req.user.role === 'ADMIN') {
                return next();
            }

            const resource = await resourceGetter(req);

            if (!resource) {
                return res.status(404).json({ message: 'Resource not found' });
            }

            if (resource.userId !== req.user.userId) {
                return res.status(403).json({
                    message: 'You do not have permission to access this resource'
                });
            }

            next();
        } catch (error) {
            console.error('Resource owner check error:', error);
            return res.status(500).json({
                message: 'An error occurred while checking resource ownership'
            });
        }
    };
};