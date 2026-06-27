'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { createProjectSchema, updateProjectSchema } from '@/lib/schemas';

export type ProjectActionResult = { error?: string; id?: string };

export async function createProject(
   values: z.infer<typeof createProjectSchema>
): Promise<ProjectActionResult> {
   const user = await getCurrentUser();
   if (!user) return { error: 'Not authenticated' };

   const parsed = createProjectSchema.safeParse(values);
   if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };
   }

   const { name, description, color } = parsed.data;
   const project = await db.project.create({
      data: {
         name,
         description: description ? description : null,
         color: color ?? null,
         creatorId: user.id,
      },
      select: { id: true },
   });

   revalidatePath('/projects');
   return { id: project.id };
}

export async function updateProject(
   values: z.infer<typeof updateProjectSchema>
): Promise<ProjectActionResult> {
   const user = await getCurrentUser();
   if (!user) return { error: 'Not authenticated' };

   const parsed = updateProjectSchema.safeParse(values);
   if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };
   }

   const { id, name, description, color } = parsed.data;
   await db.project.update({
      where: { id },
      data: {
         ...(name !== undefined ? { name } : {}),
         ...(description !== undefined ? { description: description ? description : null } : {}),
         ...(color !== undefined ? { color: color ?? null } : {}),
      },
   });

   revalidatePath('/projects');
   revalidatePath(`/projects/${id}`);
   return { id };
}

export async function archiveProject(id: string): Promise<ProjectActionResult> {
   const user = await getCurrentUser();
   if (!user) return { error: 'Not authenticated' };

   const parsed = z.string().uuid().safeParse(id);
   if (!parsed.success) return { error: 'Invalid project id' };

   await db.project.update({
      where: { id: parsed.data },
      data: { archivedAt: new Date() },
   });

   revalidatePath('/projects');
   return { id: parsed.data };
}
