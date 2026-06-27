import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SignupForm } from './signup-form';

export const metadata: Metadata = { title: 'Sign up' };

export default function SignupPage() {
   return (
      <Card>
         <CardHeader className="text-center">
            <CardTitle className="text-xl">Create your account</CardTitle>
            <CardDescription>Join your team&apos;s PocKit workspace</CardDescription>
         </CardHeader>
         <CardContent className="flex flex-col gap-6">
            <SignupForm />
            <p className="text-muted-foreground text-center text-sm">
               Already have an account?{' '}
               <Link href="/login" className="text-foreground font-medium hover:underline">
                  Log in
               </Link>
            </p>
         </CardContent>
      </Card>
   );
}
