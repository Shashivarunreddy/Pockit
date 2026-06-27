import type { ReactNode } from 'react';

type PageHeaderProps = {
   title: ReactNode;
   subtitle?: ReactNode;
   action?: ReactNode;
};

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
   return (
      <header className="bg-background/80 sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-4 border-b px-6 backdrop-blur">
         <div className="min-w-0">
            <h1 className="truncate text-base font-semibold leading-tight">{title}</h1>
            {subtitle ? <p className="text-muted-foreground truncate text-xs">{subtitle}</p> : null}
         </div>
         {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
      </header>
   );
}
