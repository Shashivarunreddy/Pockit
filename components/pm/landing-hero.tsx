'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { ArrowRight, LogIn } from 'lucide-react';

import { Brand } from '@/components/pm/brand';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { TextFlippingBoard } from '@/components/ui/aceternity/text-flipping-board';
import { HoverBorderGradient } from '@/components/ui/aceternity/hover-border-gradient';

const MESSAGES: string[] = [
   'POCKIT \nPROJECTS IN \nYOUR POCKET',
   'PLAN. TRACK. \nSHIP IT.',
   'KANBAN BOARDS \nMADE SIMPLE',
   'FROM BACKLOG \nTO DONE',
   'TASKS, COMMENTS \n& TEAMS IN \nONE PLACE',
];

export function LandingHero() {
   const [msgIdx, setMsgIdx] = useState(0);

   const next = useCallback(() => setMsgIdx((i) => (i + 1) % MESSAGES.length), []);

   useEffect(() => {
      const id = setInterval(next, 6000);
      return () => clearInterval(id);
   }, [next]);

   return (
      <div className="relative flex min-h-screen flex-col overflow-hidden bg-white dark:bg-neutral-950">
         {/* ambient glow */}
         <div
            aria-hidden
            className="bg-primary/10 pointer-events-none absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full blur-3xl"
         />

         {/* top bar */}
         <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
            <Brand size="md" />
            <div className="flex items-center gap-3">
               <ThemeToggle />
               <Link
                  href="/login"
                  className="text-muted-foreground hover:text-foreground hidden text-sm font-medium transition-colors sm:inline"
               >
                  Sign in
               </Link>
            </div>
         </header>

         {/* hero */}
         <main className="relative z-10 flex flex-1 flex-col items-center justify-center gap-10 px-4 pb-20 text-center">
            <div className="flex flex-col items-center gap-3">
               <span className="bg-muted text-muted-foreground rounded-full border px-3 py-1 text-xs font-medium tracking-wide uppercase">
                  Pocket Project Management Toolkit
               </span>
               <h1 className="max-w-2xl text-3xl font-bold tracking-tight text-balance sm:text-5xl">
                  Everything your team is working on, in one tidy place.
               </h1>
               <p className="text-muted-foreground max-w-xl text-base text-balance sm:text-lg">
                  PocKit keeps projects, tasks, personal to-dos and team conversations together —
                  fast, focused and a little bit fun.
               </p>
            </div>

            <TextFlippingBoard text={MESSAGES[msgIdx]} className="max-w-2xl" />

            <div className="flex flex-col items-center gap-4 sm:flex-row">
               <Link href="/signup" aria-label="Sign up">
                  <HoverBorderGradient
                     as="div"
                     containerClassName="rounded-full"
                     className="flex items-center gap-2 bg-white text-black dark:bg-black dark:text-white"
                  >
                     <span>Get started — it&apos;s free</span>
                     <ArrowRight className="size-4" />
                  </HoverBorderGradient>
               </Link>
               <Link href="/login" aria-label="Sign in">
                  <HoverBorderGradient
                     as="div"
                     containerClassName="rounded-full"
                     className="flex items-center gap-2 bg-white text-black dark:bg-black dark:text-white"
                  >
                     <LogIn className="size-4" />
                     <span>Sign in</span>
                  </HoverBorderGradient>
               </Link>
            </div>
         </main>

         <footer className="text-muted-foreground relative z-10 px-6 py-6 text-center text-xs">
            © {new Date().getFullYear()} PocKit — Pocket Project Management Toolkit.
         </footer>
      </div>
   );
}
