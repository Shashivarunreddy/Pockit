'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import {
   createTaskSchema,
   updateTaskSchema,
   moveTaskSchema,
   assignTaskSchema,
} from '@/lib/schemas';
import { getTaskById, type TaskDetailData } from '@/server/queries/tasks';
import { getTaskComments, type CommentData } from '@/server/queries/comments';

export type TaskActionResult = { error?: string; id?: string };

export type TaskDetailResult = {
   error?: string;
   task?: TaskDetailData;
   comments?: CommentData[];
};

export async function loadTaskDetail(taskId: string): Promise<TaskDetailResult> {
   const user = await getCurrentUser();
   if (!user) return { error: 'Not authenticated' };

   const parsed = z.string().uuid().safeParse(taskId);
   if (!parsed.success) return { error: 'Invalid task id' };

   const [task, comments] = await Promise.all([
      getTaskById(parsed.data),
      getTaskComments(parsed.data),
   ]);
   if (!task) return { error: 'Task not found' };

   return { task, comments };
}

function revalidateTask(projectId: string) {
   revalidatePath(`/projects/${projectId}`);
   revalidatePath('/dashboard');
}

export async function createTask(
   values: z.infer<typeof createTaskSchema>
): Promise<TaskActionResult> {
   const user = await getCurrentUser();
   if (!user) return { error: 'Not authenticated' };

   const parsed = createTaskSchema.safeParse(values);
   if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };
   }
   const { projectId, title, description, status, priority, assigneeId, dueDate } = parsed.data;

   // Append to the bottom of the target column.
   const last = await db.task.findFirst({
      where: { projectId, status, archivedAt: null },
      orderBy: { position: 'desc' },
      select: { position: true },
   });
   const position = (last?.position ?? 0) + 1000;

   const task = await db.task.create({
      data: {
         projectId,
         title,
         description: description ? description : null,
         status,
         priority,
         position,
         assigneeId: assigneeId ?? null,
         creatorId: user.id,
         dueDate: dueDate ?? null,
         completedAt: status === 'DONE' ? new Date() : null,
      },
      select: { id: true },
   });

   revalidateTask(projectId);
   return { id: task.id };
}

export async function updateTask(
   values: z.infer<typeof updateTaskSchema>
): Promise<TaskActionResult> {
   const user = await getCurrentUser();
   if (!user) return { error: 'Not authenticated' };

   const parsed = updateTaskSchema.safeParse(values);
   if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };
   }
   const { id, title, description, status, priority, assigneeId, dueDate } = parsed.data;

   const task = await db.task.update({
      where: { id },
      data: {
         ...(title !== undefined ? { title } : {}),
         ...(description !== undefined ? { description: description ? description : null } : {}),
         ...(priority !== undefined ? { priority } : {}),
         ...(assigneeId !== undefined ? { assigneeId } : {}),
         ...(dueDate !== undefined ? { dueDate } : {}),
         ...(status !== undefined
            ? { status, completedAt: status === 'DONE' ? new Date() : null }
            : {}),
      },
      select: { projectId: true },
   });

   revalidateTask(task.projectId);
   return { id };
}

export async function moveTask(values: z.infer<typeof moveTaskSchema>): Promise<TaskActionResult> {
   const user = await getCurrentUser();
   if (!user) return { error: 'Not authenticated' };

   const parsed = moveTaskSchema.safeParse(values);
   if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };
   }
   const { id, status, position } = parsed.data;

   const task = await db.task.update({
      where: { id },
      data: { status, position, completedAt: status === 'DONE' ? new Date() : null },
      select: { projectId: true },
   });

   revalidateTask(task.projectId);
   return { id };
}

export async function assignTask(
   values: z.infer<typeof assignTaskSchema>
): Promise<TaskActionResult> {
   const user = await getCurrentUser();
   if (!user) return { error: 'Not authenticated' };

   const parsed = assignTaskSchema.safeParse(values);
   if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };
   }
   const { id, assigneeId } = parsed.data;

   const task = await db.task.update({
      where: { id },
      data: { assigneeId },
      select: { projectId: true },
   });

   revalidateTask(task.projectId);
   return { id };
}

export async function archiveTask(id: string): Promise<TaskActionResult> {
   const user = await getCurrentUser();
   if (!user) return { error: 'Not authenticated' };

   const parsed = z.string().uuid().safeParse(id);
   if (!parsed.success) return { error: 'Invalid task id' };

   const task = await db.task.update({
      where: { id: parsed.data },
      data: { archivedAt: new Date() },
      select: { projectId: true },
   });

   revalidateTask(task.projectId);
   return { id: parsed.data };
}
