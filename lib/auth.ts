import 'server-only';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { db } from '@/lib/db';
import { sessionOptions, type SessionData } from '@/lib/session';

async function getSession() {
   const cookieStore = await cookies();
   return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export function hashPassword(password: string): Promise<string> {
   return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
   return bcrypt.compare(password, hash);
}

const publicUserSelect = {
   id: true,
   name: true,
   email: true,
   avatarUrl: true,
   role: true,
   status: true,
} as const;

export type Role = 'MEMBER' | 'ADMIN';
export type UserStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type CurrentUser = {
   id: string;
   name: string;
   email: string;
   avatarUrl: string | null;
   role: Role;
   status: UserStatus;
};

export const NOT_VERIFIED_MESSAGE =
   'Your profile is not verified yet — please wait for an admin to approve it.';
const REJECTED_MESSAGE = 'Your account access has been declined. Please contact an administrator.';

export async function signUp(name: string, email: string, password: string): Promise<CurrentUser> {
   const normalizedEmail = email.trim().toLowerCase();

   const existing = await db.user.findUnique({ where: { email: normalizedEmail } });
   if (existing) {
      throw new Error('An account with this email already exists.');
   }

   const passwordHash = await hashPassword(password);
   const user = await db.user.create({
      data: {
         name: name.trim(),
         email: normalizedEmail,
         passwordHash,
         role: 'MEMBER',
         status: 'PENDING',
      },
      select: publicUserSelect,
   });

   return user as CurrentUser;
}

export async function signIn(email: string, password: string): Promise<CurrentUser> {
   const normalizedEmail = email.trim().toLowerCase();

   const user = await db.user.findUnique({ where: { email: normalizedEmail } });
   if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw new Error('Invalid email or password.');
   }

   if (user.status === 'PENDING') throw new Error(NOT_VERIFIED_MESSAGE);
   if (user.status === 'REJECTED') throw new Error(REJECTED_MESSAGE);

   const session = await getSession();
   session.userId = user.id;
   await session.save();

   return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      role: user.role as Role,
      status: user.status as UserStatus,
   };
}

export async function signOut(): Promise<void> {
   const session = await getSession();
   session.destroy();
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
   const session = await getSession();
   if (!session.userId) return null;

   const user = await db.user.findUnique({
      where: { id: session.userId },
      select: publicUserSelect,
   });

   if (!user || user.status !== 'APPROVED') return null;

   return user as CurrentUser;
}
