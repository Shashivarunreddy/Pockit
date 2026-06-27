import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getCurrentUser } from '@/lib/auth';
import { getMyBoard } from '@/server/queries/my-items';
import { PageHeader } from '@/components/pm/page-header';
import { MyBoard } from '@/components/pm/my-items/board';

export const metadata: Metadata = { title: 'My Items' };

export default async function MyItemsPage() {
   const user = await getCurrentUser();
   if (!user) redirect('/login');

   const columns = await getMyBoard(user.id);
   const itemCount = columns.reduce((sum, c) => sum + c.items.length, 0);

   return (
      <div className="flex h-full flex-col">
         <PageHeader
            title="My Items"
            subtitle={`Your private board · ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
         />
         <div className="min-h-0 flex-1">
            <MyBoard initialColumns={columns} />
         </div>
      </div>
   );
}
