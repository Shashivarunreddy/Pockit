'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export type AvatarUser = {
   id: string;
   name: string;
   email?: string;
   avatarUrl?: string | null;
};

export function initials(name: string): string {
   return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
}

type UserAvatarProps = {
   user: AvatarUser;
   className?: string;

   showTooltip?: boolean;
};

export function UserAvatar({ user, className, showTooltip = true }: UserAvatarProps) {
   const avatar = (
      <Avatar className={cn('size-6 text-xs', className)}>
         {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.name} /> : null}
         <AvatarFallback>{initials(user.name) || '?'}</AvatarFallback>
      </Avatar>
   );

   if (!showTooltip) return avatar;

   return (
      <Tooltip>
         <TooltipTrigger asChild>
            <span className="inline-flex">{avatar}</span>
         </TooltipTrigger>
         <TooltipContent>
            <p className="font-medium">{user.name}</p>
            {user.email ? <p className="text-muted-foreground">{user.email}</p> : null}
         </TooltipContent>
      </Tooltip>
   );
}
