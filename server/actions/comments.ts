'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { addCommentSchema } from '@/lib/schemas';
import type { CommentData } from '@/server/queries/comments';

export type AddCommentResult = { error?: string; comment?: CommentData };

export async function addComment(
   values: z.infer<typeof addCommentSchema>
): Promise<AddCommentResult> {
   const user = await getCurrentUser();
   if (!user) return { error: 'Not authenticated' };

   const parsed = addCommentSchema.safeParse(values);
   if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };
   }

   const comment = await db.comment.create({
      data: { taskId: parsed.data.taskId, authorId: user.id, body: parsed.data.body },
      select: {
         id: true,
         body: true,
         createdAt: true,
         author: { select: { id: true, name: true, avatarUrl: true } },
      },
   });

   const task = await db.task.findUnique({
      where: { id: parsed.data.taskId },
      select: { projectId: true },
   });
   if (task) {
      revalidatePath(`/projects/${task.projectId}`);
      revalidatePath('/dashboard');
   }

   return { comment };
}
