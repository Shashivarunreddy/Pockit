import { cn } from '@/lib/utils';
import { PRIORITY_META } from '@/lib/pm-constants';
import type { PriorityValue } from '@/lib/schemas';

export function PriorityBadge({
   priority,
   className,
}: {
   priority: PriorityValue;
   className?: string;
}) {
   if (priority === 'NONE') return null;
   const meta = PRIORITY_META[priority];
   return (
      <span
         className={cn(
            'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium',
            className
         )}
         style={{ color: meta.color, backgroundColor: `${meta.color}1a` }}
      >
         <span className="size-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
         {meta.label}
      </span>
   );
}
