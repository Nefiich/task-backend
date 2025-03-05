// validation.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';

export const validateDto = (dtoClass: any, skipMissingProperties = false) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const dto = plainToInstance(dtoClass, req.body);
        const errors = await validate(dto, { skipMissingProperties });

        if (errors.length > 0) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: formatValidationErrors(errors)
            });
        }

        req.body = dto;
        next();
    };
};

export const validateQueryParams = (dtoClass: any, skipMissingProperties = true) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const dto = plainToInstance(dtoClass, req.query);
        const errors = await validate(dto, { skipMissingProperties });

        if (errors.length > 0) {
            return res.status(400).json({
                message: 'Query parameter validation failed',
                errors: formatValidationErrors(errors)
            });
        }

        req.query = dto as any;
        next();
    };
};

const formatValidationErrors = (errors: ValidationError[]): Record<string, string[]> => {
    const result: Record<string, string[]> = {};

    errors.forEach(error => {
        if (error.constraints) {
            result[error.property] = Object.values(error.constraints);
        }

        if (error.children && error.children.length > 0) {
            const childErrors = formatValidationErrors(error.children);

            Object.keys(childErrors).forEach(key => {
                result[`${error.property}.${key}`] = childErrors[key];
            });
        }
    });

    return result;
};