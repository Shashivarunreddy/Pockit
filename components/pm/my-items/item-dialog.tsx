'use client';

import { useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { z } from 'zod';
import { Loader2, Trash2 } from 'lucide-react';

import { priorityEnum, type PriorityValue } from '@/lib/schemas';
import { PRIORITY_ORDER, PRIORITY_META } from '@/lib/pm-constants';
import { createMyItem, updateMyItem, deleteMyItem } from '@/server/actions/my-items';
import type { MyItemData } from '@/server/queries/my-items';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
} from '@/components/ui/dialog';
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/components/ui/select';
import {
   Form,
   FormControl,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
} from '@/components/ui/form';
import { DatePicker } from '@/components/pm/date-picker';

const formSchema = z.object({
   title: z.string().trim().min(1, 'Title is required').max(200),
   description: z.string().max(5000).optional(),
   priority: priorityEnum,
   dueDate: z.date().nullable(),
});
type FormValues = z.infer<typeof formSchema>;

const EMPTY: FormValues = { title: '', description: '', priority: 'NONE', dueDate: null };

export function MyItemDialog({
   open,
   onOpenChange,
   columnId,
   columnName,
   item,
}: {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   columnId: string | null;
   columnName?: string;
   item?: MyItemData | null;
}) {
   const router = useRouter();
   const [isPending, startTransition] = useTransition();
   const [isDeleting, startDelete] = useTransition();
   const editing = Boolean(item);
   const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: EMPTY });

   useEffect(() => {
      if (!open) return;
      form.reset(
         item
            ? {
                 title: item.title,
                 description: item.description ?? '',
                 priority: item.priority,
                 dueDate: item.dueDate,
              }
            : EMPTY
      );
   }, [open, item, form]);

   function onSubmit(values: FormValues) {
      startTransition(async () => {
         const res =
            item != null
               ? await updateMyItem({
                    id: item.id,
                    title: values.title,
                    description: values.description ?? '',
                    priority: values.priority,
                    dueDate: values.dueDate,
                 })
               : columnId != null
                 ? await createMyItem({
                      columnId,
                      title: values.title,
                      description: values.description,
                      priority: values.priority,
                      dueDate: values.dueDate,
                   })
                 : { error: 'No column selected' };

         if (res.error) {
            toast.error(res.error);
            return;
         }
         toast.success(editing ? 'Item updated' : 'Item added');
         onOpenChange(false);
         router.refresh();
      });
   }

   function onDelete() {
      if (!item) return;
      startDelete(async () => {
         const res = await deleteMyItem(item.id);
         if (res.error) {
            toast.error(res.error);
            return;
         }
         toast.success('Item deleted');
         onOpenChange(false);
         router.refresh();
      });
   }

   return (
      <Dialog open={open} onOpenChange={onOpenChange}>
         <DialogContent>
            <DialogHeader>
               <DialogTitle>{editing ? 'Edit item' : 'New item'}</DialogTitle>
               <DialogDescription>
                  {editing
                     ? 'Update this private to-do.'
                     : columnName
                       ? `Adding to “${columnName}”.`
                       : 'Add a private to-do.'}
               </DialogDescription>
            </DialogHeader>

            <Form {...form}>
               <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                  <FormField
                     control={form.control}
                     name="title"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Title</FormLabel>
                           <FormControl>
                              <Input placeholder="What do you need to do?" autoFocus {...field} />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={form.control}
                     name="description"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Notes</FormLabel>
                           <FormControl>
                              <Textarea rows={3} placeholder="Add more detail..." {...field} />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                     <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel>Priority</FormLabel>
                              <Select
                                 value={field.value}
                                 onValueChange={(v) => field.onChange(v as PriorityValue)}
                              >
                                 <FormControl>
                                    <SelectTrigger>
                                       <SelectValue />
                                    </SelectTrigger>
                                 </FormControl>
                                 <SelectContent>
                                    {PRIORITY_ORDER.map((p) => (
                                       <SelectItem key={p} value={p}>
                                          <span
                                             className="size-2 rounded-full"
                                             style={{ backgroundColor: PRIORITY_META[p].color }}
                                          />
                                          {PRIORITY_META[p].label}
                                       </SelectItem>
                                    ))}
                                 </SelectContent>
                              </Select>
                              <FormMessage />
                           </FormItem>
                        )}
                     />
                     <FormField
                        control={form.control}
                        name="dueDate"
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel>Due date</FormLabel>
                              <DatePicker value={field.value} onChange={field.onChange} />
                              <FormMessage />
                           </FormItem>
                        )}
                     />
                  </div>
                  <DialogFooter className="sm:justify-between">
                     {editing ? (
                        <Button
                           type="button"
                           variant="ghost"
                           className="text-destructive-foreground hover:bg-destructive/10"
                           onClick={onDelete}
                           disabled={isDeleting}
                        >
                           {isDeleting ? (
                              <Loader2 className="animate-spin" />
                           ) : (
                              <Trash2 className="size-4" />
                           )}
                           Delete
                        </Button>
                     ) : (
                        <span />
                     )}
                     <Button type="submit" disabled={isPending}>
                        {isPending && <Loader2 className="animate-spin" />}
                        {editing ? 'Save' : 'Add item'}
                     </Button>
                  </DialogFooter>
               </form>
            </Form>
         </DialogContent>
      </Dialog>
   );
}
