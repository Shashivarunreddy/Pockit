'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export type AdminActionResult = { error?: string; id?: string };

const idSchema = z.string().uuid();

async function requireAdmin() {
   const user = await getCurrentUser();
   if (!user || user.role !== 'ADMIN') return null;
   return user;
}

function revalidate() {
   revalidatePath('/admin');
   revalidatePath('/members');
}

export async function approveUser(id: string): Promise<AdminActionResult> {
   const admin = await requireAdmin();
   if (!admin) return { error: 'Not authorized' };

   const parsed = idSchema.safeParse(id);
   if (!parsed.success) return { error: 'Invalid user id' };

   const { count } = await db.user.updateMany({
      where: { id: parsed.data },
      data: { status: 'APPROVED', approvedAt: new Date() },
   });
   if (count === 0) return { error: 'User not found' };

   revalidate();
   return { id: parsed.data };
}

export async function rejectUser(id: string): Promise<AdminActionResult> {
   const admin = await requireAdmin();
   if (!admin) return { error: 'Not authorized' };

   const parsed = idSchema.safeParse(id);
   if (!parsed.success) return { error: 'Invalid user id' };
   if (parsed.data === admin.id) return { error: 'You can’t revoke your own admin access.' };

   const { count } = await db.user.updateMany({
      where: { id: parsed.data },
      data: { status: 'REJECTED', approvedAt: null },
   });
   if (count === 0) return { error: 'User not found' };

   revalidate();
   return { id: parsed.data };
}

export async function deleteUser(id: string): Promise<AdminActionResult> {
   const admin = await requireAdmin();
   if (!admin) return { error: 'Not authorized' };

   const parsed = idSchema.safeParse(id);
   if (!parsed.success) return { error: 'Invalid user id' };
   if (parsed.data === admin.id) return { error: 'You can’t delete your own account.' };

   try {
      await db.user.delete({ where: { id: parsed.data } });
   } catch {
      return {
         error: 'Can’t delete: this user still owns projects, tasks, or comments. Revoke instead.',
      };
   }

   revalidate();
   return { id: parsed.data };
}
