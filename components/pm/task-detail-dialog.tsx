'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Archive, Loader2 } from 'lucide-react';

import type { MemberUser } from '@/server/queries/users';
import type { TaskDetailData } from '@/server/queries/tasks';
import type { CommentData } from '@/server/queries/comments';
import { loadTaskDetail, updateTask, assignTask, archiveTask } from '@/server/actions/tasks';
import { STATUS_ORDER, STATUS_META, PRIORITY_ORDER, PRIORITY_META } from '@/lib/pm-constants';
import type { TaskStatusValue, PriorityValue } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/components/ui/select';
import { AssigneePicker } from '@/components/pm/assignee-picker';
import { DatePicker } from '@/components/pm/date-picker';
import { CommentThread } from '@/components/pm/comment-thread';

export function TaskDetailDialog({
   taskId,
   users,
   open,
   onOpenChange,
}: {
   taskId: string | null;
   users: MemberUser[];
   open: boolean;
   onOpenChange: (open: boolean) => void;
}) {
   const router = useRouter();
   const [task, setTask] = useState<TaskDetailData | null>(null);
   const [comments, setComments] = useState<CommentData[]>([]);
   const [loading, setLoading] = useState(false);
   const [isSaving, startSave] = useTransition();
   const changed = useRef(false);
   const savedText = useRef<{ title: string; description: string }>({ title: '', description: '' });

   useEffect(() => {
      if (!open || !taskId) return;
      let cancelled = false;
      setLoading(true);
      setTask(null);
      loadTaskDetail(taskId)
         .then((res) => {
            if (cancelled) return;
            if (res.error || !res.task) {
               toast.error(res.error ?? 'Failed to load task');
               onOpenChange(false);
               return;
            }
            setTask(res.task);
            setComments(res.comments ?? []);
            savedText.current = {
               title: res.task.title,
               description: res.task.description ?? '',
            };
         })
         .finally(() => {
            if (!cancelled) setLoading(false);
         });
      return () => {
         cancelled = true;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [open, taskId]);

   function handleOpenChange(next: boolean) {
      if (!next && changed.current) {
         router.refresh();
         changed.current = false;
      }
      onOpenChange(next);
   }

   function save(data: Parameters<typeof updateTask>[0]) {
      startSave(async () => {
         const res = await updateTask(data);
         if (res.error) {
            toast.error(res.error);
            return;
         }
         changed.current = true;
      });
   }

   function onAssign(assigneeId: string | null) {
      if (!task) return;
      const assignee = assigneeId ? (users.find((u) => u.id === assigneeId) ?? null) : null;
      setTask({ ...task, assignee });
      startSave(async () => {
         const res = await assignTask({ id: task.id, assigneeId });
         if (res.error) {
            toast.error(res.error);
            return;
         }
         changed.current = true;
      });
   }

   function onArchive() {
      if (!task) return;
      startSave(async () => {
         const res = await archiveTask(task.id);
         if (res.error) {
            toast.error(res.error);
            return;
         }
         toast.success('Task archived');
         changed.current = true;
         handleOpenChange(false);
      });
   }

   return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
         <DialogContent className="max-h-[85vh] gap-0 overflow-y-auto p-0 sm:max-w-2xl">
            <DialogTitle className="sr-only">{task?.title ?? 'Task details'}</DialogTitle>
            {loading || !task ? (
               <div className="flex items-center justify-center py-24">
                  <Loader2 className="text-muted-foreground size-6 animate-spin" />
               </div>
            ) : (
               <div className="flex flex-col">
                  <DialogHeader className="space-y-0 border-b px-6 py-4 text-left">
                     <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-xs">{task.project.name}</span>
                        {isSaving ? (
                           <Loader2 className="text-muted-foreground size-3 animate-spin" />
                        ) : null}
                        <Button
                           variant="ghost"
                           size="icon"
                           className="ml-auto size-7"
                           onClick={onArchive}
                           title="Archive task"
                        >
                           <Archive className="size-4" />
                        </Button>
                     </div>
                     <Input
                        defaultValue={task.title}
                        onBlur={(e) => {
                           const value = e.target.value.trim();
                           if (value && value !== savedText.current.title) {
                              savedText.current.title = value;
                              save({ id: task.id, title: value });
                           }
                        }}
                        className="border-0 px-0 text-lg font-semibold shadow-none focus-visible:ring-0"
                        placeholder="Task title"
                     />
                  </DialogHeader>

                  <div className="grid gap-6 px-6 py-5 sm:grid-cols-[1fr_220px]">
                     <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                           <Label className="text-muted-foreground text-xs">Description</Label>
                           <Textarea
                              defaultValue={task.description ?? ''}
                              rows={5}
                              placeholder="Add a description..."
                              onBlur={(e) => {
                                 const value = e.target.value;
                                 if (value !== savedText.current.description) {
                                    savedText.current.description = value;
                                    save({ id: task.id, description: value });
                                 }
                              }}
                           />
                        </div>
                     </div>

                     <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                           <Label className="text-muted-foreground text-xs">Status</Label>
                           <Select
                              value={task.status}
                              onValueChange={(v) => {
                                 setTask({ ...task, status: v as TaskStatusValue });
                                 save({ id: task.id, status: v as TaskStatusValue });
                              }}
                           >
                              <SelectTrigger>
                                 <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                 {STATUS_ORDER.map((s) => (
                                    <SelectItem key={s} value={s}>
                                       <span
                                          className="size-2 rounded-full"
                                          style={{ backgroundColor: STATUS_META[s].color }}
                                       />
                                       {STATUS_META[s].label}
                                    </SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                           <Label className="text-muted-foreground text-xs">Priority</Label>
                           <Select
                              value={task.priority}
                              onValueChange={(v) => {
                                 setTask({ ...task, priority: v as PriorityValue });
                                 save({ id: task.id, priority: v as PriorityValue });
                              }}
                           >
                              <SelectTrigger>
                                 <SelectValue />
                              </SelectTrigger>
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
                        </div>

                        <div className="flex flex-col gap-1.5">
                           <Label className="text-muted-foreground text-xs">Assignee</Label>
                           <AssigneePicker
                              users={users}
                              value={task.assignee?.id ?? null}
                              onChange={onAssign}
                           />
                        </div>

                        <div className="flex flex-col gap-1.5">
                           <Label className="text-muted-foreground text-xs">Due date</Label>
                           <DatePicker
                              value={task.dueDate}
                              onChange={(date) => {
                                 setTask({ ...task, dueDate: date });
                                 save({ id: task.id, dueDate: date });
                              }}
                           />
                        </div>
                     </div>
                  </div>

                  <Separator />

                  <div className="px-6 py-5">
                     <CommentThread
                        taskId={task.id}
                        initialComments={comments}
                        onChanged={() => {
                           changed.current = true;
                        }}
                     />
                  </div>
               </div>
            )}
         </DialogContent>
      </Dialog>
   );
}
