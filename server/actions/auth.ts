'use server';

import { redirect } from 'next/navigation';
import { signUp, signIn, signOut } from '@/lib/auth';
import { signupSchema, loginSchema, type SignupValues, type LoginValues } from '@/lib/schemas';
import { rateLimit, clientKey } from '@/lib/rate-limit';

export type ActionResult = { error?: string; pending?: boolean };

function tooMany(retryAfterSeconds: number): ActionResult {
   const mins = Math.ceil(retryAfterSeconds / 60);
   return {
      error: `Too many attempts. Try again in about ${mins} minute${mins === 1 ? '' : 's'}.`,
   };
}

export async function signupAction(values: SignupValues): Promise<ActionResult> {
   const limit = rateLimit(await clientKey('signup'), 5, 10 * 60 * 1000);
   if (!limit.ok) return tooMany(limit.retryAfterSeconds);

   const parsed = signupSchema.safeParse(values);
   if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };
   }

   try {
      await signUp(parsed.data.name, parsed.data.email, parsed.data.password);
   } catch (error) {
      return { error: error instanceof Error ? error.message : 'Sign up failed' };
   }

   return { pending: true };
}

export async function loginAction(values: LoginValues): Promise<ActionResult> {
   const limit = rateLimit(await clientKey('login'), 10, 5 * 60 * 1000);
   if (!limit.ok) return tooMany(limit.retryAfterSeconds);

   const parsed = loginSchema.safeParse(values);
   if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };
   }

   try {
      await signIn(parsed.data.email, parsed.data.password);
   } catch (error) {
      return { error: error instanceof Error ? error.message : 'Login failed' };
   }

   redirect('/dashboard');
}

export async function logoutAction(): Promise<void> {
   await signOut();
   redirect('/login');
}
