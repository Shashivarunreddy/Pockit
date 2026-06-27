'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, MoreHorizontal, Pencil, Trash2, Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { PROJECT_COLORS } from '@/lib/schemas';
import type { MyColumnData } from '@/server/queries/my-items';
import { updateMyColumn, deleteMyColumn } from '@/server/actions/my-items';
import { SortableMyItem } from '@/components/pm/my-items/item-card';
import { Input } from '@/components/ui/input';
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const DOT = '#8e8c99';

export function MyBoardColumn({
   column,
   onAddItem,
   onOpenItem,
}: {
   column: MyColumnData;
   onAddItem: (columnId: string) => void;
   onOpenItem: (itemId: string) => void;
}) {
   const router = useRouter();
   const { setNodeRef, isOver } = useDroppable({
      id: column.id,
      data: { type: 'column', columnId: column.id },
   });

   const [editing, setEditing] = useState(false);
   const [name, setName] = useState(column.name);
   const [confirmDelete, setConfirmDelete] = useState(false);
   const [isPending, startTransition] = useTransition();

   function saveName() {
      const trimmed = name.trim();
      setEditing(false);
      if (!trimmed || trimmed === column.name) {
         setName(column.name);
         return;
      }
      startTransition(async () => {
         const res = await updateMyColumn({ id: column.id, name: trimmed });
         if (res.error) {
            toast.error(res.error);
            setName(column.name);
            return;
         }
         router.refresh();
      });
   }

   function recolor(color: string) {
      startTransition(async () => {
         const res = await updateMyColumn({ id: column.id, color });
         if (res.error) {
            toast.error(res.error);
            return;
         }
         router.refresh();
      });
   }

   function remove() {
      startTransition(async () => {
         const res = await deleteMyColumn(column.id);
         if (res.error) {
            toast.error(res.error);
            return;
         }
         toast.success('Column deleted');
         setConfirmDelete(false);
         router.refresh();
      });
   }

   return (
      <div className="flex w-72 shrink-0 flex-col">
         <div className="mb-2 flex items-center gap-2 px-1">
            <span
               className="size-2.5 shrink-0 rounded-full"
               style={{ backgroundColor: column.color ?? DOT }}
            />

            {editing ? (
               <Input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={saveName}
                  onKeyDown={(e) => {
                     if (e.key === 'Enter') saveName();
                     if (e.key === 'Escape') {
                        setName(column.name);
                        setEditing(false);
                     }
                  }}
                  className="h-6 px-1 py-0 text-sm font-medium"
               />
            ) : (
               <button
                  type="button"
                  onDoubleClick={() => setEditing(true)}
                  className="truncate text-sm font-medium"
                  title="Double-click to rename"
               >
                  {column.name}
               </button>
            )}

            <span className="text-muted-foreground text-xs">{column.items.length}</span>
            {isPending ? <Loader2 className="text-muted-foreground size-3 animate-spin" /> : null}

            <div className="ml-auto flex items-center gap-0.5">
               <button
                  type="button"
                  onClick={() => onAddItem(column.id)}
                  className="text-muted-foreground hover:bg-accent hover:text-foreground flex size-6 items-center justify-center rounded-md transition-colors"
                  title={`Add item to ${column.name}`}
               >
                  <Plus className="size-4" />
               </button>

               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <button
                        type="button"
                        className="text-muted-foreground hover:bg-accent hover:text-foreground flex size-6 items-center justify-center rounded-md transition-colors"
                        title="Column options"
                     >
                        <MoreHorizontal className="size-4" />
                     </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                     <DropdownMenuItem onSelect={() => setEditing(true)}>
                        <Pencil className="size-4" />
                        Rename
                     </DropdownMenuItem>
                     <DropdownMenuSeparator />
                     <DropdownMenuLabel className="text-muted-foreground text-xs font-normal">
                        Color
                     </DropdownMenuLabel>
                     <div className="grid grid-cols-8 gap-1 px-2 py-1.5">
                        {PROJECT_COLORS.map((c) => (
                           <button
                              key={c}
                              type="button"
                              onClick={() => recolor(c)}
                              className={cn(
                                 'size-4 rounded-full ring-offset-1 transition-transform hover:scale-110',
                                 column.color === c && 'ring-foreground/40 ring-2'
                              )}
                              style={{ backgroundColor: c }}
                              aria-label={`Set color ${c}`}
                           />
                        ))}
                     </div>
                     <DropdownMenuSeparator />
                     <DropdownMenuItem
                        variant="destructive"
                        onSelect={() => setConfirmDelete(true)}
                     >
                        <Trash2 className="size-4" />
                        Delete column
                     </DropdownMenuItem>
                  </DropdownMenuContent>
               </DropdownMenu>
            </div>
         </div>

         <div
            ref={setNodeRef}
            className={cn(
               'flex flex-1 flex-col gap-2 rounded-lg p-2 transition-colors',
               isOver ? 'bg-accent/60' : 'bg-muted/40'
            )}
         >
            <SortableContext
               items={column.items.map((i) => i.id)}
               strategy={verticalListSortingStrategy}
            >
               {column.items.map((item) => (
                  <SortableMyItem key={item.id} item={item} onOpen={onOpenItem} />
               ))}
            </SortableContext>

            {column.items.length === 0 ? (
               <button
                  type="button"
                  onClick={() => onAddItem(column.id)}
                  className="text-muted-foreground/70 hover:text-foreground hover:border-foreground/20 flex items-center justify-center gap-1 rounded-md border border-dashed py-6 text-xs transition-colors"
               >
                  <Plus className="size-3.5" />
                  Add item
               </button>
            ) : null}
         </div>

         <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
            <AlertDialogContent>
               <AlertDialogHeader>
                  <AlertDialogTitle>Delete “{column.name}”?</AlertDialogTitle>
                  <AlertDialogDescription>
                     This permanently deletes the column and all{' '}
                     {column.items.length > 0 ? `${column.items.length} ` : ''}items in it. This
                     can’t be undone.
                  </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                     onClick={(e) => {
                        e.preventDefault();
                        remove();
                     }}
                     className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                     {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                     Delete
                  </AlertDialogAction>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
      </div>
   );
}
