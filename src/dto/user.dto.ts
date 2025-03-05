// user.dto.ts
import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Invalid email format' })
    email: string;

    @IsNotEmpty({ message: 'Password is required' })
    @IsString({ message: 'Password must be a string' })
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    password: string;

    @IsNotEmpty({ message: 'First name is required' })
    @IsString({ message: 'First name must be a string' })
    firstName: string;

    @IsNotEmpty({ message: 'Last name is required' })
    @IsString({ message: 'Last name must be a string' })
    lastName: string;

    @IsOptional()
    @IsEnum(Role, { message: 'Role must be either ADMIN or USER' })
    role?: Role;
}

export class UpdateUserDto {
    @IsOptional()
    @IsEmail({}, { message: 'Invalid email format' })
    email?: string;

    @IsOptional()
    @IsString({ message: 'Password must be a string' })
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    password?: string;

    @IsOptional()
    @IsString({ message: 'First name must be a string' })
    firstName?: string;

    @IsOptional()
    @IsString({ message: 'Last name must be a string' })
    lastName?: string;

    @IsOptional()
    @IsEnum(Role, { message: 'Role must be either ADMIN or USER' })
    role?: Role;
}