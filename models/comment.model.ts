import { UserResponse } from './user.model';

export interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  taskId: string;
  userId: string;
}

export interface CommentResponse extends Comment {
  user: UserResponse;
}