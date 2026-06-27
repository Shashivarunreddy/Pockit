'use client';

import { format } from 'date-fns';
import { CalendarDays, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export function DatePicker({
   value,
   onChange,
   disabled,
   className,
}: {
   value: Date | null;
   onChange: (date: Date | null) => void;
   disabled?: boolean;
   className?: string;
}) {
   return (
      <Popover>
         <PopoverTrigger asChild>
            <Button
               type="button"
               variant="outline"
               disabled={disabled}
               className={cn('w-full justify-start font-normal', className)}
            >
               <CalendarDays className="text-muted-foreground size-4" />
               {value ? (
                  format(value, 'PPP')
               ) : (
                  <span className="text-muted-foreground">No due date</span>
               )}
               {value ? (
                  <span
                     role="button"
                     tabIndex={0}
                     aria-label="Clear due date"
                     onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onChange(null);
                     }}
                     className="hover:text-foreground text-muted-foreground ml-auto"
                  >
                     <X className="size-3.5" />
                  </span>
               ) : null}
            </Button>
         </PopoverTrigger>
         <PopoverContent className="w-auto p-0" align="start">
            <Calendar
               mode="single"
               selected={value ?? undefined}
               onSelect={(date) => onChange(date ?? null)}
               initialFocus
            />
         </PopoverContent>
      </Popover>
   );
}
