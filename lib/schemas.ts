import { z } from 'zod';

export const signupSchema = z.object({
   name: z.string().trim().min(1, 'Name is required').max(80),
   email: z.string().trim().email('Enter a valid email'),
   password: z.string().min(8, 'Password must be at least 8 characters'),
});
export type SignupValues = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
   email: z.string().trim().email('Enter a valid email'),
   password: z.string().min(1, 'Password is required'),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const PROJECT_COLORS = [
   '#6e56cf',
   '#0091ff',
   '#12a594',
   '#30a46c',
   '#f5a623',
   '#e5484d',
   '#d6409f',
   '#8e8c99',
] as const;

export const createProjectSchema = z.object({
   name: z.string().trim().min(1, 'Project name is required').max(80),
   description: z.string().trim().max(2000).optional().or(z.literal('')),
   color: z.string().trim().optional(),
});
export type CreateProjectValues = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = createProjectSchema.partial().extend({
   id: z.string().uuid(),
});
export type UpdateProjectValues = z.infer<typeof updateProjectSchema>;

export const taskStatusEnum = z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']);
export type TaskStatusValue = z.infer<typeof taskStatusEnum>;

export const priorityEnum = z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH', 'URGENT']);
export type PriorityValue = z.infer<typeof priorityEnum>;

export const createTaskSchema = z.object({
   projectId: z.string().uuid(),
   title: z.string().trim().min(1, 'Title is required').max(200),
   description: z.string().trim().max(5000).optional().or(z.literal('')),
   status: taskStatusEnum.default('TODO'),
   priority: priorityEnum.default('NONE'),
   assigneeId: z.string().uuid().nullable().optional(),
   dueDate: z.coerce.date().nullable().optional(),
});
export type CreateTaskValues = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = z.object({
   id: z.string().uuid(),
   title: z.string().trim().min(1).max(200).optional(),
   description: z.string().trim().max(5000).nullable().optional(),
   status: taskStatusEnum.optional(),
   priority: priorityEnum.optional(),
   assigneeId: z.string().uuid().nullable().optional(),
   dueDate: z.coerce.date().nullable().optional(),
});
export type UpdateTaskValues = z.infer<typeof updateTaskSchema>;

export const moveTaskSchema = z.object({
   id: z.string().uuid(),
   status: taskStatusEnum,
   position: z.number(),
});

export const assignTaskSchema = z.object({
   id: z.string().uuid(),
   assigneeId: z.string().uuid().nullable(),
});

export const createMyColumnSchema = z.object({
   name: z.string().trim().min(1, 'Column name is required').max(60),
   color: z.string().trim().optional(),
});
export type CreateMyColumnValues = z.infer<typeof createMyColumnSchema>;

export const updateMyColumnSchema = z.object({
   id: z.string().uuid(),
   name: z.string().trim().min(1, 'Column name is required').max(60).optional(),
   color: z.string().trim().nullable().optional(),
});
export type UpdateMyColumnValues = z.infer<typeof updateMyColumnSchema>;

export const createMyItemSchema = z.object({
   columnId: z.string().uuid(),
   title: z.string().trim().min(1, 'Title is required').max(200),
   description: z.string().trim().max(5000).optional().or(z.literal('')),
   priority: priorityEnum.default('NONE'),
   dueDate: z.coerce.date().nullable().optional(),
});
export type CreateMyItemValues = z.infer<typeof createMyItemSchema>;

export const updateMyItemSchema = z.object({
   id: z.string().uuid(),
   title: z.string().trim().min(1).max(200).optional(),
   description: z.string().trim().max(5000).nullable().optional(),
   priority: priorityEnum.optional(),
   dueDate: z.coerce.date().nullable().optional(),
});
export type UpdateMyItemValues = z.infer<typeof updateMyItemSchema>;

export const moveMyItemSchema = z.object({
   id: z.string().uuid(),
   columnId: z.string().uuid(),
   position: z.number(),
});

export const addCommentSchema = z.object({
   taskId: z.string().uuid(),
   body: z.string().trim().min(1, 'Comment cannot be empty').max(5000),
});
export type AddCommentValues = z.infer<typeof addCommentSchema>;
