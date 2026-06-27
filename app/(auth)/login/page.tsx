import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from './login-form';

export const metadata: Metadata = { title: 'Log in' };

export default function LoginPage() {
   return (
      <Card>
         <CardHeader className="text-center">
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription>Log in to your PocKit workspace</CardDescription>
         </CardHeader>
         <CardContent className="flex flex-col gap-6">
            <LoginForm />
            <p className="text-muted-foreground text-center text-sm">
               Don&apos;t have an account?{' '}
               <Link href="/signup" className="text-foreground font-medium hover:underline">
                  Sign up
               </Link>
            </p>
         </CardContent>
      </Card>
   );
}
