'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CalendarDays } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';

import { cn } from '@/lib/utils';
import type { MyItemData } from '@/server/queries/my-items';
import { PriorityBadge } from '@/components/pm/priority-badge';

export function MyItemView({ item, className }: { item: MyItemData; className?: string }) {
   const overdue = item.dueDate && isPast(item.dueDate) && !isToday(item.dueDate);

   return (
      <div
         className={cn(
            'bg-card flex flex-col gap-2 rounded-lg border p-3 text-left shadow-xs',
            className
         )}
      >
         <p className="text-sm font-medium leading-snug">{item.title}</p>

         {item.priority !== 'NONE' || item.dueDate ? (
            <div className="flex items-center gap-2">
               <PriorityBadge priority={item.priority} />
               {item.dueDate ? (
                  <span
                     className={cn(
                        'inline-flex items-center gap-1 text-[11px]',
                        overdue ? 'text-destructive-foreground' : 'text-muted-foreground'
                     )}
                  >
                     <CalendarDays className="size-3" />
                     {format(item.dueDate, 'MMM d')}
                  </span>
               ) : null}
            </div>
         ) : null}
      </div>
   );
}

export function SortableMyItem({
   item,
   onOpen,
}: {
   item: MyItemData;
   onOpen: (itemId: string) => void;
}) {
   const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: item.id,
      data: { type: 'item', columnId: item.columnId },
   });

   return (
      <button
         ref={setNodeRef}
         type="button"
         onClick={() => onOpen(item.id)}
         style={{ transform: CSS.Translate.toString(transform), transition }}
         className={cn(
            'focus-visible:ring-ring w-full cursor-grab touch-none rounded-lg outline-none focus-visible:ring-2 active:cursor-grabbing',
            isDragging && 'opacity-40'
         )}
         {...attributes}
         {...listeners}
      >
         <MyItemView item={item} className="hover:border-foreground/20 transition-colors" />
      </button>
   );
}
