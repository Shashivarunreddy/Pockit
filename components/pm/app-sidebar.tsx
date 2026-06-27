'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import {
   LayoutDashboard,
   FolderKanban,
   Users,
   ListTodo,
   LogOut,
   ShieldCheck,
   type LucideIcon,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { logoutAction } from '@/server/actions/auth';
import { UserAvatar, type AvatarUser } from '@/components/pm/user-avatar';
import { BrandMark } from '@/components/pm/brand';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { Sidebar, SidebarBody, useSidebar } from '@/components/ui/aceternity/sidebar';

const NAV = [
   { href: '/dashboard', label: 'My Tasks', icon: LayoutDashboard },
   { href: '/my-items', label: 'My Items', icon: ListTodo },
   { href: '/projects', label: 'Projects', icon: FolderKanban },
   { href: '/members', label: 'Members', icon: Users },
];

const ADMIN_NAV = { href: '/admin', label: 'Admin', icon: ShieldCheck };

/** Label that collapses/expands with the sidebar. */
function AnimatedLabel({ children, className }: { children: React.ReactNode; className?: string }) {
   const { open, animate } = useSidebar();
   return (
      <motion.span
         animate={{
            display: animate ? (open ? 'inline-block' : 'none') : 'inline-block',
            opacity: animate ? (open ? 1 : 0) : 1,
         }}
         className={cn('whitespace-pre inline-block !p-0 !m-0 transition duration-150', className)}
      >
         {children}
      </motion.span>
   );
}

/** A nav row using Next.js client navigation + active state, animated like SidebarLink. */
function NavLink({ href, label, icon: Icon }: { href: string; label: string; icon: LucideIcon }) {
   const pathname = usePathname();
   const active = pathname === href || pathname.startsWith(`${href}/`);

   return (
      <Link
         href={href}
         className={cn(
            'group/sidebar flex items-center justify-start gap-2 rounded-md px-2 py-2 transition-colors',
            active
               ? 'bg-neutral-200 dark:bg-neutral-700'
               : 'hover:bg-neutral-200/60 dark:hover:bg-neutral-700/50'
         )}
      >
         <Icon
            className={cn(
               'h-5 w-5 shrink-0',
               active
                  ? 'text-neutral-900 dark:text-white'
                  : 'text-neutral-700 dark:text-neutral-200'
            )}
         />
         <AnimatedLabel
            className={cn(
               'text-sm group-hover/sidebar:translate-x-1',
               active
                  ? 'font-medium text-neutral-900 dark:text-white'
                  : 'text-neutral-700 dark:text-neutral-200'
            )}
         >
            {label}
         </AnimatedLabel>
      </Link>
   );
}

function SidebarBrand() {
   return (
      <Link href="/dashboard" className="flex items-center gap-2 px-1 py-1">
         <BrandMark size="sm" />
         <AnimatedLabel className="text-base font-semibold tracking-tight text-neutral-900 dark:text-white">
            PocKit
         </AnimatedLabel>
      </Link>
   );
}

function SidebarFooter({ user }: { user: AvatarUser }) {
   const { open } = useSidebar();

   return (
      <div className="flex flex-col gap-2 border-t border-neutral-200 pt-3 dark:border-neutral-700">
         <div className="flex items-center gap-2 px-1">
            <UserAvatar user={user} showTooltip={false} className="size-7 shrink-0" />
            <div className="min-w-0 flex-1">
               <AnimatedLabel className="block max-w-[180px] truncate text-sm font-medium text-neutral-900 dark:text-white">
                  {user.name}
               </AnimatedLabel>
               {user.email ? (
                  <AnimatedLabel className="block max-w-[180px] truncate text-xs text-neutral-500 dark:text-neutral-400">
                     {user.email}
                  </AnimatedLabel>
               ) : null}
            </div>
         </div>

         <div
            className={cn(
               'flex gap-1 px-1',
               open ? 'flex-row items-center' : 'flex-col items-start'
            )}
         >
            <ThemeToggle />
            <form action={logoutAction}>
               <button
                  type="submit"
                  title="Log out"
                  className="flex size-8 items-center justify-center rounded-md text-neutral-600 transition-colors hover:bg-neutral-200 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-white"
               >
                  <LogOut className="size-4" />
                  <span className="sr-only">Log out</span>
               </button>
            </form>
         </div>
      </div>
   );
}

export function AppSidebar({ user, isAdmin = false }: { user: AvatarUser; isAdmin?: boolean }) {
   const nav = isAdmin ? [...NAV, ADMIN_NAV] : NAV;

   return (
      <Sidebar>
         <SidebarBody className="justify-between gap-6">
            <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
               <SidebarBrand />
               <nav className="mt-6 flex flex-col gap-1">
                  {nav.map((item) => (
                     <NavLink key={item.href} {...item} />
                  ))}
               </nav>
            </div>
            <SidebarFooter user={user} />
         </SidebarBody>
      </Sidebar>
   );
}
