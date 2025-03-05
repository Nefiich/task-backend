// validation.util.ts
import { ValidationError } from 'class-validator';

export interface FormattedError {
    property: string;
    constraints: string[];
}

export const formatValidationErrors = (errors: ValidationError[]): FormattedError[] => {
    return errors.map(error => {
        const formattedError: FormattedError = {
            property: error.property,
            constraints: []
        };

        if (error.constraints) {
            formattedError.constraints = Object.values(error.constraints);
        }

        if (error.children && error.children.length > 0) {
            const childErrors = formatValidationErrors(error.children);
            childErrors.forEach(childError => {
                formattedError.constraints.push(
                    ...childError.constraints.map(constraint =>
                        `${childError.property}: ${constraint}`
                    )
                );
            });
        }

        return formattedError;
    });
};

export const isValidUUID = (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
};

export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
};

export const sanitizeInput = (input: string): string => {
    return input
        .trim()
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

export const isValidDate = (dateString: string): boolean => {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
};

export const parseQueryParam = <T>(
    value: string | undefined,
    defaultValue: T,
    parser: (val: string) => T
): T => {
    if (value === undefined) {
        return defaultValue;
    }

    try {
        return parser(value);
    } catch (error) {
        return defaultValue;
    }
};

export const parseBooleanQueryParam = (value: string | undefined, defaultValue: boolean): boolean => {
    if (value === undefined) {
        return defaultValue;
    }

    return ['true', '1', 'yes'].includes(value.toLowerCase());
};

export const parseNumberQueryParam = (value: string | undefined, defaultValue: number): number => {
    if (value === undefined) {
        return defaultValue;
    }

    const parsed = Number(value);
    return isNaN(parsed) ? defaultValue : parsed;
};