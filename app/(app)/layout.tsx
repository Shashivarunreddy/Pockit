import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { AppSidebar } from '@/components/pm/app-sidebar';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
   const user = await getCurrentUser();
   if (!user) redirect('/login');

   const isAdmin = user.role === 'ADMIN';

   return (
      <div className="bg-background flex h-screen flex-col overflow-hidden md:flex-row">
         <AppSidebar user={user} isAdmin={isAdmin} />
         <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">{children}</main>
      </div>
   );
}
