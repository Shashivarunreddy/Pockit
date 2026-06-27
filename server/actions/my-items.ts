'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import {
   createMyColumnSchema,
   updateMyColumnSchema,
   createMyItemSchema,
   updateMyItemSchema,
   moveMyItemSchema,
} from '@/lib/schemas';

export type MyActionResult = { error?: string; id?: string };

const PATH = '/my-items';

export async function createMyColumn(
   values: z.infer<typeof createMyColumnSchema>
): Promise<MyActionResult> {
   const user = await getCurrentUser();
   if (!user) return { error: 'Not authenticated' };

   const parsed = createMyColumnSchema.safeParse(values);
   if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };

   const last = await db.myColumn.findFirst({
      where: { userId: user.id },
      orderBy: { position: 'desc' },
      select: { position: true },
   });
   const position = (last?.position ?? 0) + 1000;

   const column = await db.myColumn.create({
      data: { userId: user.id, name: parsed.data.name, color: parsed.data.color ?? null, position },
      select: { id: true },
   });

   revalidatePath(PATH);
   return { id: column.id };
}

export async function updateMyColumn(
   values: z.infer<typeof updateMyColumnSchema>
): Promise<MyActionResult> {
   const user = await getCurrentUser();
   if (!user) return { error: 'Not authenticated' };

   const parsed = updateMyColumnSchema.safeParse(values);
   if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };
   const { id, name, color } = parsed.data;

   const { count } = await db.myColumn.updateMany({
      where: { id, userId: user.id },
      data: {
         ...(name !== undefined ? { name } : {}),
         ...(color !== undefined ? { color: color ?? null } : {}),
      },
   });
   if (count === 0) return { error: 'Column not found' };

   revalidatePath(PATH);
   return { id };
}

export async function deleteMyColumn(id: string): Promise<MyActionResult> {
   const user = await getCurrentUser();
   if (!user) return { error: 'Not authenticated' };

   const parsed = z.string().uuid().safeParse(id);
   if (!parsed.success) return { error: 'Invalid column id' };

   const { count } = await db.myColumn.deleteMany({
      where: { id: parsed.data, userId: user.id },
   });
   if (count === 0) return { error: 'Column not found' };

   revalidatePath(PATH);
   return { id: parsed.data };
}

export async function createMyItem(
   values: z.infer<typeof createMyItemSchema>
): Promise<MyActionResult> {
   const user = await getCurrentUser();
   if (!user) return { error: 'Not authenticated' };

   const parsed = createMyItemSchema.safeParse(values);
   if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };
   const { columnId, title, description, priority, dueDate } = parsed.data;

   const column = await db.myColumn.findFirst({
      where: { id: columnId, userId: user.id },
      select: { id: true },
   });
   if (!column) return { error: 'Column not found' };

   const last = await db.myItem.findFirst({
      where: { columnId, userId: user.id },
      orderBy: { position: 'desc' },
      select: { position: true },
   });
   const position = (last?.position ?? 0) + 1000;

   const item = await db.myItem.create({
      data: {
         userId: user.id,
         columnId,
         title,
         description: description ? description : null,
         priority,
         position,
         dueDate: dueDate ?? null,
      },
      select: { id: true },
   });

   revalidatePath(PATH);
   return { id: item.id };
}

export async function updateMyItem(
   values: z.infer<typeof updateMyItemSchema>
): Promise<MyActionResult> {
   const user = await getCurrentUser();
   if (!user) return { error: 'Not authenticated' };

   const parsed = updateMyItemSchema.safeParse(values);
   if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };
   const { id, title, description, priority, dueDate } = parsed.data;

   const { count } = await db.myItem.updateMany({
      where: { id, userId: user.id },
      data: {
         ...(title !== undefined ? { title } : {}),
         ...(description !== undefined ? { description: description ? description : null } : {}),
         ...(priority !== undefined ? { priority } : {}),
         ...(dueDate !== undefined ? { dueDate } : {}),
      },
   });
   if (count === 0) return { error: 'Item not found' };

   revalidatePath(PATH);
   return { id };
}

export async function moveMyItem(
   values: z.infer<typeof moveMyItemSchema>
): Promise<MyActionResult> {
   const user = await getCurrentUser();
   if (!user) return { error: 'Not authenticated' };

   const parsed = moveMyItemSchema.safeParse(values);
   if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };
   const { id, columnId, position } = parsed.data;

   const column = await db.myColumn.findFirst({
      where: { id: columnId, userId: user.id },
      select: { id: true },
   });
   if (!column) return { error: 'Column not found' };

   const { count } = await db.myItem.updateMany({
      where: { id, userId: user.id },
      data: { columnId, position },
   });
   if (count === 0) return { error: 'Item not found' };

   revalidatePath(PATH);
   return { id };
}

export async function deleteMyItem(id: string): Promise<MyActionResult> {
   const user = await getCurrentUser();
   if (!user) return { error: 'Not authenticated' };

   const parsed = z.string().uuid().safeParse(id);
   if (!parsed.success) return { error: 'Invalid item id' };

   const { count } = await db.myItem.deleteMany({
      where: { id: parsed.data, userId: user.id },
   });
   if (count === 0) return { error: 'Item not found' };

   revalidatePath(PATH);
   return { id: parsed.data };
}
