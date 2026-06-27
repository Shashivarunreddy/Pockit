'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { TaskCardData } from '@/server/queries/tasks';
import type { TaskStatusValue } from '@/lib/schemas';
import { STATUS_META } from '@/lib/pm-constants';
import { SortableTaskCard } from '@/components/pm/board/task-card';

export function BoardColumn({
   status,
   tasks,
   onOpenTask,
   onAddTask,
}: {
   status: TaskStatusValue;
   tasks: TaskCardData[];
   onOpenTask: (taskId: string) => void;
   onAddTask: (status: TaskStatusValue) => void;
}) {
   const meta = STATUS_META[status];
   const { setNodeRef, isOver } = useDroppable({ id: status, data: { type: 'column', status } });

   return (
      <div className="flex w-72 shrink-0 flex-col">
         <div className="mb-2 flex items-center gap-2 px-1">
            <span className="size-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
            <span className="text-sm font-medium">{meta.label}</span>
            <span className="text-muted-foreground text-xs">{tasks.length}</span>
            <button
               type="button"
               onClick={() => onAddTask(status)}
               className="text-muted-foreground hover:bg-accent hover:text-foreground ml-auto flex size-6 items-center justify-center rounded-md transition-colors"
               title={`Add task to ${meta.label}`}
            >
               <Plus className="size-4" />
            </button>
         </div>

         <div
            ref={setNodeRef}
            className={cn(
               'flex flex-1 flex-col gap-2 rounded-lg p-2 transition-colors',
               isOver ? 'bg-accent/60' : 'bg-muted/40'
            )}
         >
            <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
               {tasks.map((task) => (
                  <SortableTaskCard key={task.id} task={task} onOpen={onOpenTask} />
               ))}
            </SortableContext>

            {tasks.length === 0 ? (
               <button
                  type="button"
                  onClick={() => onAddTask(status)}
                  className="text-muted-foreground/70 hover:text-foreground hover:border-foreground/20 flex items-center justify-center gap-1 rounded-md border border-dashed py-6 text-xs transition-colors"
               >
                  <Plus className="size-3.5" />
                  Add task
               </button>
            ) : null}
         </div>
      </div>
   );
}
