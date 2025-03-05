// category.dto.ts
import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateCategoryDto {
    @IsNotEmpty({ message: 'Category name is required' })
    @IsString({ message: 'Category name must be a string' })
    @MaxLength(50, { message: 'Category name cannot exceed 50 characters' })
    name!: string;

    @IsOptional()
    @IsString({ message: 'Description must be a string' })
    @MaxLength(200, { message: 'Description cannot exceed 200 characters' })
    description?: string;
}

export class UpdateCategoryDto {
    @IsOptional()
    @IsString({ message: 'Category name must be a string' })
    @MaxLength(50, { message: 'Category name cannot exceed 50 characters' })
    name?: string;

    @IsOptional()
    @IsString({ message: 'Description must be a string' })
    @MaxLength(200, { message: 'Description cannot exceed 200 characters' })
    description?: string;
}