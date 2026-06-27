'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { MoreHorizontal, Archive } from 'lucide-react';

import type { ProjectListItem } from '@/server/queries/projects';
import { archiveProject } from '@/server/actions/projects';
import { UserAvatar } from '@/components/pm/user-avatar';
import { Button } from '@/components/ui/button';
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ProjectCard({ project }: { project: ProjectListItem }) {
   const [isPending, startTransition] = useTransition();
   const router = useRouter();

   function onArchive() {
      startTransition(async () => {
         const result = await archiveProject(project.id);
         if (result.error) {
            toast.error(result.error);
            return;
         }
         toast.success('Project archived');
         router.refresh();
      });
   }

   return (
      <div className="group bg-card hover:border-foreground/20 relative flex flex-col gap-4 rounded-lg border p-5 transition-colors">
         <Link
            href={`/projects/${project.id}`}
            className="absolute inset-0 z-0 rounded-lg"
            aria-label={`Open ${project.name}`}
         />

         <div className="relative z-10 flex items-start justify-between gap-2">
            <span
               className="size-3 shrink-0 rounded-full"
               style={{ backgroundColor: project.color ?? '#8e8c99' }}
            />
            <DropdownMenu>
               <DropdownMenuTrigger asChild>
                  <Button
                     variant="ghost"
                     size="icon"
                     className="size-7 opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
                     disabled={isPending}
                  >
                     <MoreHorizontal className="size-4" />
                     <span className="sr-only">Project actions</span>
                  </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end">
                  <DropdownMenuItem variant="destructive" onClick={onArchive}>
                     <Archive className="size-4" />
                     Archive
                  </DropdownMenuItem>
               </DropdownMenuContent>
            </DropdownMenu>
         </div>

         <div className="pointer-events-none flex flex-col gap-2">
            <h3 className="font-semibold leading-tight">{project.name}</h3>
            {project.description ? (
               <p className="text-muted-foreground line-clamp-2 text-sm">{project.description}</p>
            ) : (
               <p className="text-muted-foreground/60 text-sm italic">No description</p>
            )}
         </div>

         <div className="pointer-events-none mt-auto flex items-center justify-between">
            <span className="text-muted-foreground text-xs">
               {project.taskCount} {project.taskCount === 1 ? 'task' : 'tasks'}
            </span>
            <UserAvatar user={project.creator} className="size-6" showTooltip={false} />
         </div>
      </div>
   );
}
