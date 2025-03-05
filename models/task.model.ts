import { Priority, TaskStatus } from './enums';
import { UserResponse } from './user.model';
import { Category } from './category.model';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  assigneeId?: string;
  categoryId?: string;
}

export interface TaskResponse extends Task {
  owner: UserResponse;
  assignee?: UserResponse;
  category?: Category;
}