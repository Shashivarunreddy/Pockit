'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { createProjectSchema, type CreateProjectValues, PROJECT_COLORS } from '@/lib/schemas';
import { createProject } from '@/server/actions/projects';
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
   DialogTrigger,
} from '@/components/ui/dialog';
import {
   Form,
   FormControl,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
} from '@/components/ui/form';

export function NewProjectDialog() {
   const [open, setOpen] = useState(false);
   const [isPending, startTransition] = useTransition();
   const router = useRouter();

   const form = useForm<CreateProjectValues>({
      resolver: zodResolver(createProjectSchema),
      defaultValues: { name: '', description: '', color: PROJECT_COLORS[0] },
   });

   function onSubmit(values: CreateProjectValues) {
      startTransition(async () => {
         const result = await createProject(values);
         if (result.error) {
            toast.error(result.error);
            return;
         }
         toast.success('Project created');
         setOpen(false);
         form.reset({ name: '', description: '', color: PROJECT_COLORS[0] });
         if (result.id) router.push(`/projects/${result.id}`);
      });
   }

   return (
      <Dialog open={open} onOpenChange={setOpen}>
         <DialogTrigger asChild>
            <Button size="sm">
               <Plus className="size-4" />
               New project
            </Button>
         </DialogTrigger>
         <DialogContent>
            <DialogHeader>
               <DialogTitle>New project</DialogTitle>
               <DialogDescription>Create a project to organize related tasks.</DialogDescription>
            </DialogHeader>

            <Form {...form}>
               <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                  <FormField
                     control={form.control}
                     name="name"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Name</FormLabel>
                           <FormControl>
                              <Input placeholder="Website Revamp" autoFocus {...field} />
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
                              <Textarea
                                 rows={3}
                                 placeholder="What is this project about?"
                                 {...field}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={form.control}
                     name="color"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Color</FormLabel>
                           <FormControl>
                              <div className="flex flex-wrap gap-2">
                                 {PROJECT_COLORS.map((color) => (
                                    <button
                                       key={color}
                                       type="button"
                                       onClick={() => field.onChange(color)}
                                       className={cn(
                                          'size-7 rounded-full ring-offset-2 ring-offset-background transition',
                                          field.value === color
                                             ? 'ring-foreground ring-2'
                                             : 'hover:scale-110'
                                       )}
                                       style={{ backgroundColor: color }}
                                       aria-label={`Select color ${color}`}
                                    />
                                 ))}
                              </div>
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <DialogFooter>
                     <Button type="submit" disabled={isPending}>
                        {isPending && <Loader2 className="animate-spin" />}
                        Create project
                     </Button>
                  </DialogFooter>
               </form>
            </Form>
         </DialogContent>
      </Dialog>
   );
}
