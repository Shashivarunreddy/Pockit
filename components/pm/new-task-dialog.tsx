'use client';

import { useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

import { priorityEnum, type PriorityValue, type TaskStatusValue } from '@/lib/schemas';
import { PRIORITY_ORDER, PRIORITY_META, STATUS_META } from '@/lib/pm-constants';
import { createTask } from '@/server/actions/tasks';
import type { MemberUser } from '@/server/queries/users';
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
import { AssigneePicker } from '@/components/pm/assignee-picker';
import { DatePicker } from '@/components/pm/date-picker';

const formSchema = z.object({
   title: z.string().trim().min(1, 'Title is required').max(200),
   description: z.string().max(5000).optional(),
   priority: priorityEnum,
   assigneeId: z.string().nullable(),
   dueDate: z.date().nullable(),
});
type FormValues = z.infer<typeof formSchema>;

const DEFAULTS: FormValues = {
   title: '',
   description: '',
   priority: 'NONE',
   assigneeId: null,
   dueDate: null,
};

export function NewTaskDialog({
   projectId,
   users,
   status,
   open,
   onOpenChange,
}: {
   projectId: string;
   users: MemberUser[];
   status: TaskStatusValue | null;
   open: boolean;
   onOpenChange: (open: boolean) => void;
}) {
   const router = useRouter();
   const [isPending, startTransition] = useTransition();
   const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: DEFAULTS });

   useEffect(() => {
      if (open) form.reset(DEFAULTS);
   }, [open, form]);

   function onSubmit(values: FormValues) {
      startTransition(async () => {
         const result = await createTask({
            projectId,
            status: status ?? 'TODO',
            title: values.title,
            description: values.description,
            priority: values.priority,
            assigneeId: values.assigneeId,
            dueDate: values.dueDate,
         });
         if (result.error) {
            toast.error(result.error);
            return;
         }
         toast.success('Task created');
         onOpenChange(false);
         router.refresh();
      });
   }

   return (
      <Dialog open={open} onOpenChange={onOpenChange}>
         <DialogContent>
            <DialogHeader>
               <DialogTitle>New task</DialogTitle>
               <DialogDescription>
                  {status ? `Adding to "${STATUS_META[status].label}".` : 'Create a new task.'}
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
                              <Input placeholder="What needs to be done?" autoFocus {...field} />
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
                           <FormLabel>Description</FormLabel>
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
                  <FormField
                     control={form.control}
                     name="assigneeId"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Assignee</FormLabel>
                           <AssigneePicker
                              users={users}
                              value={field.value}
                              onChange={field.onChange}
                           />
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <DialogFooter>
                     <Button type="submit" disabled={isPending}>
                        {isPending && <Loader2 className="animate-spin" />}
                        Create task
                     </Button>
                  </DialogFooter>
               </form>
            </Form>
         </DialogContent>
      </Dialog>
   );
}
