'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown, UserCircle2, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { MemberUser } from '@/server/queries/users';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
   Command,
   CommandEmpty,
   CommandGroup,
   CommandInput,
   CommandItem,
   CommandList,
} from '@/components/ui/command';
import { UserAvatar } from '@/components/pm/user-avatar';

type AssigneePickerProps = {
   users: MemberUser[];
   value: string | null;
   onChange: (userId: string | null) => void;
   disabled?: boolean;
   className?: string;
};

export function AssigneePicker({
   users,
   value,
   onChange,
   disabled,
   className,
}: AssigneePickerProps) {
   const [open, setOpen] = useState(false);
   const selected = users.find((u) => u.id === value) ?? null;

   return (
      <Popover open={open} onOpenChange={setOpen}>
         <PopoverTrigger asChild>
            <Button
               type="button"
               variant="outline"
               role="combobox"
               aria-expanded={open}
               disabled={disabled}
               className={cn('w-full justify-between font-normal', className)}
            >
               <span className="flex items-center gap-2 truncate">
                  {selected ? (
                     <>
                        <UserAvatar user={selected} showTooltip={false} className="size-5" />
                        <span className="truncate">{selected.name}</span>
                     </>
                  ) : (
                     <>
                        <UserCircle2 className="text-muted-foreground size-4" />
                        <span className="text-muted-foreground">Unassigned</span>
                     </>
                  )}
               </span>
               <ChevronsUpDown className="text-muted-foreground size-4 shrink-0" />
            </Button>
         </PopoverTrigger>
         <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
            <Command>
               <CommandInput placeholder="Search people..." />
               <CommandList>
                  <CommandEmpty>No people found.</CommandEmpty>
                  <CommandGroup>
                     <CommandItem
                        value="unassigned"
                        onSelect={() => {
                           onChange(null);
                           setOpen(false);
                        }}
                     >
                        <UserCircle2 className="text-muted-foreground size-4" />
                        <span>Unassigned</span>
                        <Check
                           className={cn(
                              'ml-auto size-4',
                              value === null ? 'opacity-100' : 'opacity-0'
                           )}
                        />
                     </CommandItem>
                     {users.map((user) => (
                        <CommandItem
                           key={user.id}
                           value={`${user.name} ${user.email}`}
                           onSelect={() => {
                              onChange(user.id);
                              setOpen(false);
                           }}
                        >
                           <UserAvatar user={user} showTooltip={false} className="size-5" />
                           <span className="truncate">{user.name}</span>
                           <Check
                              className={cn(
                                 'ml-auto size-4',
                                 value === user.id ? 'opacity-100' : 'opacity-0'
                              )}
                           />
                        </CommandItem>
                     ))}
                  </CommandGroup>
               </CommandList>
            </Command>
         </PopoverContent>
      </Popover>
   );
}

/** Compact inline variant with a clear button — used in the task detail panel. */
export function AssigneeField({ users, value, onChange, disabled }: AssigneePickerProps) {
   return (
      <div className="flex items-center gap-2">
         <AssigneePicker users={users} value={value} onChange={onChange} disabled={disabled} />
         {value ? (
            <Button
               type="button"
               variant="ghost"
               size="icon"
               className="size-8 shrink-0"
               onClick={() => onChange(null)}
               disabled={disabled}
               title="Clear assignee"
            >
               <X className="size-4" />
            </Button>
         ) : null}
      </div>
   );
}
