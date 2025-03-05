// comment.dto.ts
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCommentDto {
    @IsNotEmpty({ message: 'Comment content is required' })
    @IsString({ message: 'Comment content must be a string' })
    @MaxLength(500, { message: 'Comment content cannot exceed 500 characters' })
    content!: string;
}

export class UpdateCommentDto {
    @IsNotEmpty({ message: 'Comment content is required' })
    @IsString({ message: 'Comment content must be a string' })
    @MaxLength(500, { message: 'Comment content cannot exceed 500 characters' })
    content!: string;
}