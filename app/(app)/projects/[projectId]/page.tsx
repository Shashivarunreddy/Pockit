import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

import { getProjectById } from '@/server/queries/projects';
import { getProjectTasks } from '@/server/queries/tasks';
import { getAllUsers } from '@/server/queries/users';
import { PageHeader } from '@/components/pm/page-header';
import { Board } from '@/components/pm/board/board';

export const metadata: Metadata = { title: 'Board' };

export default async function ProjectBoardPage({
   params,
   searchParams,
}: {
   params: Promise<{ projectId: string }>;
   searchParams: Promise<{ task?: string }>;
}) {
   const { projectId } = await params;
   const { task: openTaskId } = await searchParams;

   const project = await getProjectById(projectId);
   if (!project) notFound();

   const [tasks, users] = await Promise.all([getProjectTasks(projectId), getAllUsers()]);

   return (
      <div className="flex h-full flex-col">
         <PageHeader
            title={
               <span className="flex items-center gap-2">
                  <span
                     className="size-3 rounded-full"
                     style={{ backgroundColor: project.color ?? '#8e8c99' }}
                  />
                  {project.name}
               </span>
            }
            subtitle={project.description ?? undefined}
            action={
               <Link
                  href="/projects"
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
               >
                  <ChevronLeft className="size-4" />
                  All projects
               </Link>
            }
         />

         <div className="min-h-0 flex-1">
            <Board
               projectId={projectId}
               initialTasks={tasks}
               users={users}
               initialOpenTaskId={openTaskId ?? null}
            />
         </div>
      </div>
   );
}
