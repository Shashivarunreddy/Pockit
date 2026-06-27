'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Check, X, Trash2, Loader2, ShieldCheck, Clock, Ban } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { AdminUserRow } from '@/server/queries/users';
import { approveUser, rejectUser, deleteUser } from '@/server/actions/admin';
import { UserAvatar } from '@/components/pm/user-avatar';
import { Button } from '@/components/ui/button';
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

type Action = (id: string) => Promise<{ error?: string; id?: string }>;

function StatusBadge({ status }: { status: AdminUserRow['status'] }) {
   const map = {
      PENDING: {
         label: 'Pending',
         className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      },
      APPROVED: {
         label: 'Approved',
         className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      },
      REJECTED: { label: 'Revoked', className: 'bg-destructive/10 text-destructive' },
   } as const;
   const meta = map[status];
   return (
      <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-medium', meta.className)}>
         {meta.label}
      </span>
   );
}

function UserRow({
   user,
   isSelf,
   onAct,
   onDelete,
}: {
   user: AdminUserRow;
   isSelf: boolean;
   onAct: (action: Action, id: string, success: string) => void;
   onDelete: (user: AdminUserRow) => void;
}) {
   const [isPending, startTransition] = useTransition();
   const run = (action: Action, success: string) => () =>
      startTransition(() => onAct(action, user.id, success));

   return (
      <div className="bg-card flex items-center gap-3 rounded-lg border p-3">
         <UserAvatar user={user} className="size-9 text-sm" showTooltip={false} />
         <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
               <p className="truncate text-sm font-medium">{user.name}</p>
               {user.role === 'ADMIN' ? (
                  <span className="text-primary inline-flex items-center gap-0.5 text-[11px] font-medium">
                     <ShieldCheck className="size-3" />
                     Admin
                  </span>
               ) : null}
               {isSelf ? <span className="text-muted-foreground text-[11px]">(you)</span> : null}
            </div>
            <p className="text-muted-foreground truncate text-xs">{user.email}</p>
         </div>

         <span className="text-muted-foreground hidden text-xs sm:block">
            {format(user.createdAt, 'MMM d, yyyy')}
         </span>
         <StatusBadge status={user.status} />

         {isPending ? <Loader2 className="text-muted-foreground size-4 animate-spin" /> : null}

         {!isSelf ? (
            <div className="flex shrink-0 items-center gap-1">
               {user.status !== 'APPROVED' ? (
                  <Button
                     size="sm"
                     variant="default"
                     className="h-8"
                     disabled={isPending}
                     onClick={run(approveUser, `${user.name} approved`)}
                  >
                     <Check className="size-4" />
                     Approve
                  </Button>
               ) : null}
               {user.status !== 'REJECTED' ? (
                  <Button
                     size="sm"
                     variant="outline"
                     className="h-8"
                     disabled={isPending}
                     onClick={run(rejectUser, `${user.name}'s access revoked`)}
                     title="Revoke access"
                  >
                     <X className="size-4" />
                     {user.status === 'PENDING' ? 'Decline' : 'Revoke'}
                  </Button>
               ) : null}
               <Button
                  size="icon"
                  variant="ghost"
                  className="text-muted-foreground hover:text-destructive size-8"
                  disabled={isPending}
                  onClick={() => onDelete(user)}
                  title="Delete account"
               >
                  <Trash2 className="size-4" />
               </Button>
            </div>
         ) : null}
      </div>
   );
}

function Section({
   title,
   icon: Icon,
   users,
   currentUserId,
   onAct,
   onDelete,
}: {
   title: string;
   icon: typeof Clock;
   users: AdminUserRow[];
   currentUserId: string;
   onAct: (action: Action, id: string, success: string) => void;
   onDelete: (user: AdminUserRow) => void;
}) {
   if (users.length === 0) return null;
   return (
      <section className="flex flex-col gap-3">
         <div className="flex items-center gap-2">
            <Icon className="text-muted-foreground size-4" />
            <h2 className="text-sm font-medium">{title}</h2>
            <span className="text-muted-foreground text-xs">{users.length}</span>
         </div>
         <div className="flex flex-col gap-2">
            {users.map((user) => (
               <UserRow
                  key={user.id}
                  user={user}
                  isSelf={user.id === currentUserId}
                  onAct={onAct}
                  onDelete={onDelete}
               />
            ))}
         </div>
      </section>
   );
}

export function UserManager({
   initialUsers,
   currentUserId,
}: {
   initialUsers: AdminUserRow[];
   currentUserId: string;
}) {
   const router = useRouter();
   const [toDelete, setToDelete] = useState<AdminUserRow | null>(null);
   const [isDeleting, startDelete] = useTransition();

   function onAct(action: Action, id: string, success: string) {
      action(id).then((res) => {
         if (res.error) {
            toast.error(res.error);
            return;
         }
         toast.success(success);
         router.refresh();
      });
   }

   function confirmDelete() {
      if (!toDelete) return;
      const name = toDelete.name;
      startDelete(async () => {
         const res = await deleteUser(toDelete.id);
         if (res.error) {
            toast.error(res.error);
            return;
         }
         toast.success(`${name} deleted`);
         setToDelete(null);
         router.refresh();
      });
   }

   const pending = initialUsers.filter((u) => u.status === 'PENDING');
   const approved = initialUsers.filter((u) => u.status === 'APPROVED');
   const rejected = initialUsers.filter((u) => u.status === 'REJECTED');

   return (
      <div className="flex flex-col gap-8 p-6">
         <Section
            title="Awaiting approval"
            icon={Clock}
            users={pending}
            currentUserId={currentUserId}
            onAct={onAct}
            onDelete={setToDelete}
         />
         <Section
            title="Members"
            icon={ShieldCheck}
            users={approved}
            currentUserId={currentUserId}
            onAct={onAct}
            onDelete={setToDelete}
         />
         <Section
            title="Revoked"
            icon={Ban}
            users={rejected}
            currentUserId={currentUserId}
            onAct={onAct}
            onDelete={setToDelete}
         />

         {initialUsers.length === 0 ? (
            <p className="text-muted-foreground text-sm">No accounts yet.</p>
         ) : null}

         <AlertDialog open={toDelete !== null} onOpenChange={(open) => !open && setToDelete(null)}>
            <AlertDialogContent>
               <AlertDialogHeader>
                  <AlertDialogTitle>Delete “{toDelete?.name}”?</AlertDialogTitle>
                  <AlertDialogDescription>
                     This permanently removes the account. This can’t be undone. If they own
                     projects or tasks, revoke their access instead.
                  </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                     onClick={(e) => {
                        e.preventDefault();
                        confirmDelete();
                     }}
                     className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                     {isDeleting ? <Loader2 className="size-4 animate-spin" /> : null}
                     Delete
                  </AlertDialogAction>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
      </div>
   );
}
