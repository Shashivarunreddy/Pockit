import 'server-only';
import { db } from '@/lib/db';

export type MemberUser = {
   id: string;
   name: string;
   email: string;
   avatarUrl: string | null;
};

export async function getAllUsers(): Promise<MemberUser[]> {
   return db.user.findMany({
      where: { status: 'APPROVED' },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, email: true, avatarUrl: true },
   });
}

export type AdminUserRow = {
   id: string;
   name: string;
   email: string;
   avatarUrl: string | null;
   role: 'MEMBER' | 'ADMIN';
   status: 'PENDING' | 'APPROVED' | 'REJECTED';
   createdAt: Date;
};

export async function getUsersForAdmin(): Promise<AdminUserRow[]> {
   const rows = await db.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
         id: true,
         name: true,
         email: true,
         avatarUrl: true,
         role: true,
         status: true,
         createdAt: true,
      },
   });
   return rows as AdminUserRow[];
}
