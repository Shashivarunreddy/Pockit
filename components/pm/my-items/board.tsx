'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
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
import { Plus, Loader2, X } from 'lucide-react';

import type { MyColumnData, MyItemData } from '@/server/queries/my-items';
import { moveMyItem, createMyColumn } from '@/server/actions/my-items';
import { MyBoardColumn } from '@/components/pm/my-items/column';
import { MyItemView } from '@/components/pm/my-items/item-card';
import { MyItemDialog } from '@/components/pm/my-items/item-dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function findItem(columns: MyColumnData[], id: UniqueIdentifier): MyItemData | null {
   for (const col of columns) {
      const found = col.items.find((i) => i.id === id);
      if (found) return found;
   }
   return null;
}

function columnIdOf(columns: MyColumnData[], itemId: UniqueIdentifier): string | null {
   for (const col of columns) {
      if (col.items.some((i) => i.id === itemId)) return col.id;
   }
   return null;
}

function midpointPosition(items: MyItemData[], index: number): number {
   const prev = items[index - 1]?.position;
   const next = items[index + 1]?.position;
   if (prev == null && next == null) return 1000;
   if (prev == null) return next! / 2;
   if (next == null) return prev + 1000;
   return (prev + next) / 2;
}

export function MyBoard({ initialColumns }: { initialColumns: MyColumnData[] }) {
   const router = useRouter();
   const [columns, setColumns] = useState<MyColumnData[]>(initialColumns);
   const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

   const [newItemColumnId, setNewItemColumnId] = useState<string | null>(null);
   const [editItemId, setEditItemId] = useState<string | null>(null);

   const [addingColumn, setAddingColumn] = useState(false);
   const [newColumnName, setNewColumnName] = useState('');
   const [isCreatingColumn, startCreateColumn] = useTransition();

   useEffect(() => {
      setColumns(initialColumns);
   }, [initialColumns]);

   const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

   const columnIds = useMemo(() => new Set(columns.map((c) => c.id)), [columns]);
   const isColumn = (id: UniqueIdentifier) => columnIds.has(id as string);

   const activeItem = activeId ? findItem(columns, activeId) : null;
   const editItem = editItemId ? findItem(columns, editItemId) : null;
   const newItemColumnName = columns.find((c) => c.id === newItemColumnId)?.name;

   function onDragStart(event: DragStartEvent) {
      setActiveId(event.active.id);
   }

   function onDragOver(event: DragOverEvent) {
      const { active, over } = event;
      if (!over) return;
      const fromCol = columnIdOf(columns, active.id);
      const toCol = isColumn(over.id) ? (over.id as string) : columnIdOf(columns, over.id);
      if (!fromCol || !toCol || fromCol === toCol) return;

      setColumns((prev) => {
         const from = prev.find((c) => c.id === fromCol);
         const to = prev.find((c) => c.id === toCol);
         if (!from || !to) return prev;
         const activeIndex = from.items.findIndex((i) => i.id === active.id);
         if (activeIndex < 0) return prev;

         const moved = { ...from.items[activeIndex], columnId: toCol };
         const overIndex = isColumn(over.id)
            ? to.items.length
            : to.items.findIndex((i) => i.id === over.id);
         const insertAt = overIndex < 0 ? to.items.length : overIndex;

         return prev.map((c) => {
            if (c.id === fromCol) {
               return { ...c, items: c.items.filter((i) => i.id !== active.id) };
            }
            if (c.id === toCol) {
               const items = [...c.items];
               items.splice(insertAt, 0, moved);
               return { ...c, items };
            }
            return c;
         });
      });
   }

   function onDragEnd(event: DragEndEvent) {
      const { active, over } = event;
      setActiveId(null);
      if (!over) return;

      const finalCol = isColumn(over.id) ? (over.id as string) : columnIdOf(columns, over.id);
      if (!finalCol) return;
      const col = columns.find((c) => c.id === finalCol);
      if (!col) return;

      const items = [...col.items];
      const oldIndex = items.findIndex((i) => i.id === active.id);
      if (oldIndex < 0) return;

      let newIndex = isColumn(over.id)
         ? items.length - 1
         : items.findIndex((i) => i.id === over.id);
      if (newIndex < 0) newIndex = items.length - 1;

      const reordered = oldIndex === newIndex ? items : arrayMove(items, oldIndex, newIndex);
      const index = reordered.findIndex((i) => i.id === active.id);
      const position = midpointPosition(reordered, index);
      reordered[index] = { ...reordered[index], columnId: finalCol, position };

      setColumns((prev) => prev.map((c) => (c.id === finalCol ? { ...c, items: reordered } : c)));

      moveMyItem({ id: String(active.id), columnId: finalCol, position }).then((result) => {
         if (result?.error) {
            toast.error(result.error);
            router.refresh();
         }
      });
   }

   function submitNewColumn() {
      const name = newColumnName.trim();
      if (!name) {
         setAddingColumn(false);
         return;
      }
      startCreateColumn(async () => {
         const res = await createMyColumn({ name });
         if (res.error) {
            toast.error(res.error);
            return;
         }
         setNewColumnName('');
         setAddingColumn(false);
         router.refresh();
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
               {columns.map((column) => (
                  <MyBoardColumn
                     key={column.id}
                     column={column}
                     onAddItem={setNewItemColumnId}
                     onOpenItem={setEditItemId}
                  />
               ))}

               <div className="w-72 shrink-0">
                  {addingColumn ? (
                     <div className="flex items-center gap-1">
                        <Input
                           autoFocus
                           value={newColumnName}
                           onChange={(e) => setNewColumnName(e.target.value)}
                           onBlur={submitNewColumn}
                           onKeyDown={(e) => {
                              if (e.key === 'Enter') submitNewColumn();
                              if (e.key === 'Escape') {
                                 setNewColumnName('');
                                 setAddingColumn(false);
                              }
                           }}
                           placeholder="Column name"
                           className="h-9"
                        />
                        {isCreatingColumn ? (
                           <Loader2 className="text-muted-foreground size-4 animate-spin" />
                        ) : (
                           <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onMouseDown={(e) => {
                                 e.preventDefault();
                                 setNewColumnName('');
                                 setAddingColumn(false);
                              }}
                           >
                              <X className="size-4" />
                           </Button>
                        )}
                     </div>
                  ) : (
                     <button
                        type="button"
                        onClick={() => setAddingColumn(true)}
                        className="text-muted-foreground/70 hover:text-foreground hover:border-foreground/20 flex w-full items-center justify-center gap-1 rounded-lg border border-dashed py-3 text-sm transition-colors"
                     >
                        <Plus className="size-4" />
                        Add column
                     </button>
                  )}
               </div>
            </div>

            <DragOverlay>
               {activeItem ? <MyItemView item={activeItem} className="rotate-2 shadow-lg" /> : null}
            </DragOverlay>
         </DndContext>

         <MyItemDialog
            open={newItemColumnId !== null}
            onOpenChange={(open) => {
               if (!open) setNewItemColumnId(null);
            }}
            columnId={newItemColumnId}
            columnName={newItemColumnName}
         />

         <MyItemDialog
            open={editItemId !== null}
            onOpenChange={(open) => {
               if (!open) setEditItemId(null);
            }}
            columnId={null}
            item={editItem}
         />
      </>
   );
}
