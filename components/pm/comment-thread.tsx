'use client';

import { useState, useTransition } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { Send, Loader2 } from 'lucide-react';

import type { CommentData } from '@/server/queries/comments';
import { addComment } from '@/server/actions/comments';
import { UserAvatar } from '@/components/pm/user-avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

function CommentRow({ comment }: { comment: CommentData }) {
   return (
      <div className="flex items-start gap-2.5">
         <Tooltip>
            <TooltipTrigger asChild>
               <span className="mt-0.5 inline-flex">
                  <UserAvatar user={comment.author} showTooltip={false} className="size-6" />
               </span>
            </TooltipTrigger>
            <TooltipContent>
               <p className="font-medium">{comment.author.name}</p>
               <p className="text-muted-foreground">
                  {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
               </p>
            </TooltipContent>
         </Tooltip>
         <div className="bg-muted text-foreground min-w-0 flex-1 rounded-lg rounded-tl-none px-3 py-2 text-sm whitespace-pre-wrap">
            {comment.body}
         </div>
      </div>
   );
}

export function CommentThread({
   taskId,
   initialComments,
   onChanged,
}: {
   taskId: string;
   initialComments: CommentData[];
   onChanged?: () => void;
}) {
   const [comments, setComments] = useState<CommentData[]>(initialComments);
   const [body, setBody] = useState('');
   const [isPending, startTransition] = useTransition();

   function submit() {
      const trimmed = body.trim();
      if (!trimmed) return;
      startTransition(async () => {
         const result = await addComment({ taskId, body: trimmed });
         if (result.error || !result.comment) {
            toast.error(result.error ?? 'Could not post comment');
            return;
         }
         setComments((prev) => [...prev, result.comment!]);
         setBody('');
         onChanged?.();
      });
   }

   return (
      <div className="flex flex-col gap-4">
         <p className="text-sm font-medium">
            Comments {comments.length > 0 ? `(${comments.length})` : ''}
         </p>

         {comments.length > 0 ? (
            <div className="flex flex-col gap-3">
               {comments.map((c) => (
                  <CommentRow key={c.id} comment={c} />
               ))}
            </div>
         ) : (
            <p className="text-muted-foreground text-sm">
               No comments yet. Start the conversation.
            </p>
         )}

         <div className="flex items-end gap-2">
            <Textarea
               rows={2}
               value={body}
               onChange={(e) => setBody(e.target.value)}
               placeholder="Write a comment..."
               className="min-h-0 resize-none"
               onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                     e.preventDefault();
                     submit();
                  }
               }}
            />
            <Button
               type="button"
               size="icon"
               onClick={submit}
               disabled={isPending || body.trim().length === 0}
               title="Post comment (⌘/Ctrl + Enter)"
            >
               {isPending ? <Loader2 className="animate-spin" /> : <Send className="size-4" />}
            </Button>
         </div>
      </div>
   );
}
