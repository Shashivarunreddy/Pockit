import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';

import { getCurrentUser } from '@/lib/auth';
import { getMyTasks, type MyTaskCard } from '@/server/queries/tasks';
import { STATUS_ORDER, STATUS_META } from '@/lib/pm-constants';
import type { TaskStatusValue } from '@/lib/schemas';
import { PageHeader } from '@/components/pm/page-header';
import { TaskCardView } from '@/components/pm/board/task-card';

export const metadata: Metadata = { title: 'My Tasks' };

export default async function DashboardPage() {
   const user = await getCurrentUser();
   if (!user) redirect('/login');

   const tasks = await getMyTasks(user.id);

   const grouped = STATUS_ORDER.map((status) => ({
      status,
      tasks: tasks.filter((t) => t.status === status),
   })).filter((group) => group.tasks.length > 0);

   return (
      <div className="flex flex-col">
         <PageHeader
            title="My Tasks"
            subtitle={`${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'} assigned to you`}
         />

         {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 px-6 py-24 text-center">
               <div className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
                  <CheckCircle2 className="size-6" />
               </div>
               <div>
                  <p className="font-medium">Nothing assigned to you</p>
                  <p className="text-muted-foreground text-sm">
                     Tasks assigned to you across all projects will show up here.
                  </p>
               </div>
            </div>
         ) : (
            <div className="flex flex-col gap-8 p-6">
               {grouped.map(({ status, tasks: group }) => (
                  <StatusSection key={status} status={status} tasks={group} />
               ))}
            </div>
         )}
      </div>
   );
}

function StatusSection({ status, tasks }: { status: TaskStatusValue; tasks: MyTaskCard[] }) {
   const meta = STATUS_META[status];
   return (
      <section className="flex flex-col gap-3">
         <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
            <h2 className="text-sm font-medium">{meta.label}</h2>
            <span className="text-muted-foreground text-xs">{tasks.length}</span>
         </div>
         <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tasks.map((task) => (
               <Link
                  key={task.id}
                  href={`/projects/${task.projectId}?task=${task.id}`}
                  className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
               >
                  <TaskCardView
                     task={task}
                     showProject
                     className="hover:border-foreground/20 h-full transition-colors"
                  />
               </Link>
            ))}
         </div>
      </section>
   );
}
