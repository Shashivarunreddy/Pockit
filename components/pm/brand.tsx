import { Boxes } from 'lucide-react';
import { cn } from '@/lib/utils';

const SIZES = {
   sm: { box: 'size-7', icon: 'size-4', text: 'text-base' },
   md: { box: 'size-9', icon: 'size-5', text: 'text-lg' },
   lg: { box: 'size-12', icon: 'size-7', text: 'text-2xl' },
} as const;

type BrandSize = keyof typeof SIZES;

export function BrandMark({ size = 'md', className }: { size?: BrandSize; className?: string }) {
   const s = SIZES[size];
   return (
      <div
         className={cn(
            'bg-primary text-primary-foreground flex shrink-0 items-center justify-center rounded-lg',
            s.box,
            className
         )}
      >
         <Boxes className={s.icon} />
      </div>
   );
}

export function Brand({ size = 'md', className }: { size?: BrandSize; className?: string }) {
   const s = SIZES[size];
   return (
      <div className={cn('flex items-center gap-2', className)}>
         <BrandMark size={size} />
         <span className={cn('font-semibold tracking-tight', s.text)}>
            Poc<span className="text-muted-foreground font-normal">Kit</span>
         </span>
      </div>
   );
}
