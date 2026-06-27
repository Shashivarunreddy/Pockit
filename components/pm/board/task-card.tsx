'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MessageSquare, CalendarDays } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';

import { cn } from '@/lib/utils';
import type { TaskCardData } from '@/server/queries/tasks';
import { UserAvatar } from '@/components/pm/user-avatar';
import { PriorityBadge } from '@/components/pm/priority-badge';

export function TaskCardView({
   task,
   className,
   showProject,
}: {
   task: TaskCardData & { project?: { name: string; color: string | null } };
   className?: string;
   showProject?: boolean;
}) {
   const overdue =
      task.dueDate && task.status !== 'DONE' && isPast(task.dueDate) && !isToday(task.dueDate);

   return (
      <div
         className={cn(
            'bg-card flex flex-col gap-2 rounded-lg border p-3 text-left shadow-xs',
            className
         )}
      >
         {showProject && task.project ? (
            <div className="flex items-center gap-1.5">
               <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: task.project.color ?? '#8e8c99' }}
               />
               <span className="text-muted-foreground truncate text-xs">{task.project.name}</span>
            </div>
         ) : null}

         <p className="text-sm font-medium leading-snug">{task.title}</p>

         <div className="flex items-center gap-2">
            <PriorityBadge priority={task.priority} />
            {task.dueDate ? (
               <span
                  className={cn(
                     'inline-flex items-center gap-1 text-[11px]',
                     overdue ? 'text-destructive-foreground' : 'text-muted-foreground'
                  )}
               >
                  <CalendarDays className="size-3" />
                  {format(task.dueDate, 'MMM d')}
               </span>
            ) : null}

            <div className="ml-auto flex items-center gap-2">
               {task.commentCount > 0 ? (
                  <span className="text-muted-foreground inline-flex items-center gap-0.5 text-[11px]">
                     <MessageSquare className="size-3" />
                     {task.commentCount}
                  </span>
               ) : null}
               {task.assignee ? (
                  <UserAvatar user={task.assignee} className="size-5 text-[10px]" />
               ) : null}
            </div>
         </div>
      </div>
   );
}

export function SortableTaskCard({
   task,
   onOpen,
}: {
   task: TaskCardData;
   onOpen: (taskId: string) => void;
}) {
   const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: task.id,
      data: { type: 'task', status: task.status },
   });

   return (
      <button
         ref={setNodeRef}
         type="button"
         onClick={() => onOpen(task.id)}
         style={{ transform: CSS.Translate.toString(transform), transition }}
         className={cn(
            'w-full cursor-grab touch-none rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing',
            isDragging && 'opacity-40'
         )}
         {...attributes}
         {...listeners}
      >
         <TaskCardView task={task} className="hover:border-foreground/20 transition-colors" />
      </button>
   );
}
