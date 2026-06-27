import type { Metadata } from 'next';
import { getAllUsers } from '@/server/queries/users';
import { UserAvatar } from '@/components/pm/user-avatar';
import { PageHeader } from '@/components/pm/page-header';

export const metadata: Metadata = { title: 'Members' };

export default async function MembersPage() {
   const users = await getAllUsers();

   return (
      <div className="flex flex-col">
         <PageHeader title="Members" subtitle={`${users.length} people in this workspace`} />

         <div className="grid gap-3 p-6 sm:grid-cols-2 lg:grid-cols-3">
            {users.map((user) => (
               <div key={user.id} className="bg-card flex items-center gap-3 rounded-lg border p-4">
                  <UserAvatar user={user} className="size-10 text-sm" showTooltip={false} />
                  <div className="min-w-0">
                     <p className="truncate font-medium">{user.name}</p>
                     <p className="text-muted-foreground truncate text-sm">{user.email}</p>
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
}
