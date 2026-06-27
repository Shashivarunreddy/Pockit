import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getCurrentUser } from '@/lib/auth';
import { getUsersForAdmin } from '@/server/queries/users';
import { PageHeader } from '@/components/pm/page-header';
import { UserManager } from '@/components/pm/admin/user-manager';

export const metadata: Metadata = { title: 'User management' };

export default async function AdminPage() {
   const user = await getCurrentUser();
   if (!user) redirect('/login');
   if (user.role !== 'ADMIN') redirect('/dashboard');

   const users = await getUsersForAdmin();
   const pending = users.filter((u) => u.status === 'PENDING').length;

   return (
      <div className="flex flex-col">
         <PageHeader
            title="User management"
            subtitle={
               pending > 0
                  ? `${pending} ${pending === 1 ? 'account' : 'accounts'} awaiting approval`
                  : 'All accounts reviewed'
            }
         />
         <UserManager initialUsers={users} currentUserId={user.id} />
      </div>
   );
}
