'use client';

import { cn } from '@/lib/utils';

/** Aceternity-style animated underline that glows on hover. */
export function BottomGradient() {
   return (
      <>
         <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
         <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
      </>
   );
}

/** Aceternity-style gradient submit button. */
export function GradientSubmitButton({
   children,
   className,
   ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
   return (
      <button
         className={cn(
            'group/btn relative flex h-10 w-full items-center justify-center gap-2 rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] transition disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]',
            className
         )}
         {...props}
      >
         {children}
         <BottomGradient />
      </button>
   );
}
