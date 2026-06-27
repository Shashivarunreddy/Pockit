'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
   DndContext,
   DragOverlay,
   PointerSensor,
   closestCorners,
   useSensor,
   useSensors,
   type DragEndEvent,
   type DragOverEvent,
   type DragStartEvent,
   type UniqueIdentifier,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

import type { TaskCardData } from '@/server/queries/tasks';
import type { MemberUser } from '@/server/queries/users';
import type { TaskStatusValue } from '@/lib/schemas';
import { STATUS_ORDER } from '@/lib/pm-constants';
import { moveTask } from '@/server/actions/tasks';
import { BoardColumn } from '@/components/pm/board/column';
import { TaskCardView } from '@/components/pm/board/task-card';
import { NewTaskDialog } from '@/components/pm/new-task-dialog';
import { TaskDetailDialog } from '@/components/pm/task-detail-dialog';

type Columns = Record<TaskStatusValue, TaskCardData[]>;

function groupByStatus(tasks: TaskCardData[]): Columns {
   const columns = Object.fromEntries(
      STATUS_ORDER.map((s) => [s, [] as TaskCardData[]] as const)
   ) as Columns;
   for (const task of tasks) columns[task.status]?.push(task);
   return columns;
}

const isStatus = (id: UniqueIdentifier): id is TaskStatusValue =>
   STATUS_ORDER.includes(id as TaskStatusValue);

function columnOf(columns: Columns, taskId: UniqueIdentifier): TaskStatusValue | null {
   for (const status of STATUS_ORDER) {
      if (columns[status].some((t) => t.id === taskId)) return status;
   }
   return null;
}

function midpointPosition(items: TaskCardData[], index: number): number {
   const prev = items[index - 1]?.position;
   const next = items[index + 1]?.position;
   if (prev == null && next == null) return 1000;
   if (prev == null) return next! / 2;
   if (next == null) return prev + 1000;
   return (prev + next) / 2;
}

export function Board({
   projectId,
   initialTasks,
   users,
   initialOpenTaskId = null,
}: {
   projectId: string;
   initialTasks: TaskCardData[];
   users: MemberUser[];
   initialOpenTaskId?: string | null;
}) {
   const router = useRouter();
   const [columns, setColumns] = useState<Columns>(() => groupByStatus(initialTasks));
   const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
   const [openTaskId, setOpenTaskId] = useState<string | null>(initialOpenTaskId);
   const [newTaskStatus, setNewTaskStatus] = useState<TaskStatusValue | null>(null);

   useEffect(() => {
      setColumns(groupByStatus(initialTasks));
   }, [initialTasks]);

   const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

   const activeTask = useMemo(() => {
      if (!activeId) return null;
      for (const status of STATUS_ORDER) {
         const found = columns[status].find((t) => t.id === activeId);
         if (found) return found;
      }
      return null;
   }, [activeId, columns]);

   function onDragStart(event: DragStartEvent) {
      setActiveId(event.active.id);
   }

   function onDragOver(event: DragOverEvent) {
      const { active, over } = event;
      if (!over) return;
      const activeColumn = columnOf(columns, active.id);
      const overColumn = isStatus(over.id) ? over.id : columnOf(columns, over.id);
      if (!activeColumn || !overColumn || activeColumn === overColumn) return;

      setColumns((prev) => {
         const activeItems = [...prev[activeColumn]];
         const overItems = [...prev[overColumn]];
         const activeIndex = activeItems.findIndex((t) => t.id === active.id);
         if (activeIndex < 0) return prev;
         const [moved] = activeItems.splice(activeIndex, 1);
         const overIndex = isStatus(over.id)
            ? overItems.length
            : overItems.findIndex((t) => t.id === over.id);
         const insertAt = overIndex < 0 ? overItems.length : overIndex;
         overItems.splice(insertAt, 0, { ...moved, status: overColumn });
         return { ...prev, [activeColumn]: activeItems, [overColumn]: overItems };
      });
   }

   function onDragEnd(event: DragEndEvent) {
      const { active, over } = event;
      setActiveId(null);
      if (!over) return;

      const finalColumn = isStatus(over.id) ? over.id : columnOf(columns, over.id);
      if (!finalColumn) return;

      const items = [...columns[finalColumn]];
      const oldIndex = items.findIndex((t) => t.id === active.id);
      if (oldIndex < 0) return;

      let newIndex = isStatus(over.id)
         ? items.length - 1
         : items.findIndex((t) => t.id === over.id);
      if (newIndex < 0) newIndex = items.length - 1;

      const reordered = oldIndex === newIndex ? items : arrayMove(items, oldIndex, newIndex);
      const index = reordered.findIndex((t) => t.id === active.id);
      const position = midpointPosition(reordered, index);
      reordered[index] = { ...reordered[index], status: finalColumn, position };

      setColumns((prev) => ({ ...prev, [finalColumn]: reordered }));

      moveTask({ id: String(active.id), status: finalColumn, position }).then((result) => {
         if (result?.error) {
            toast.error(result.error);
            router.refresh();
         }
      });
   }

   return (
      <>
         <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
         >
            <div className="flex h-full gap-4 overflow-x-auto p-6">
               {STATUS_ORDER.map((status) => (
                  <BoardColumn
                     key={status}
                     status={status}
                     tasks={columns[status]}
                     onOpenTask={setOpenTaskId}
                     onAddTask={setNewTaskStatus}
                  />
               ))}
            </div>

            <DragOverlay>
               {activeTask ? (
                  <TaskCardView task={activeTask} className="rotate-2 shadow-lg" />
               ) : null}
            </DragOverlay>
         </DndContext>

         <NewTaskDialog
            projectId={projectId}
            users={users}
            status={newTaskStatus}
            open={newTaskStatus !== null}
            onOpenChange={(open) => {
               if (!open) setNewTaskStatus(null);
            }}
         />

         <TaskDetailDialog
            taskId={openTaskId}
            users={users}
            open={openTaskId !== null}
            onOpenChange={(open) => {
               if (!open) setOpenTaskId(null);
            }}
         />
      </>
   );
}
