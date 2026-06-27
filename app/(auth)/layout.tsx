import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { Brand } from '@/components/pm/brand';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
   const user = await getCurrentUser();
   if (user) redirect('/dashboard');

   return (
      <div className="bg-muted/30 relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12">
         <div
            aria-hidden
            className="bg-primary/10 pointer-events-none absolute -top-32 left-1/2 size-96 -translate-x-1/2 rounded-full blur-3xl"
         />

         <div className="relative flex w-full max-w-sm flex-col gap-8">
            <Brand size="lg" className="justify-center" />
            {children}
            <p className="text-muted-foreground text-center text-xs">
               © {new Date().getFullYear()} PocKit. All rights reserved.
            </p>
         </div>
      </div>
   );
}
