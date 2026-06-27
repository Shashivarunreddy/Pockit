import 'server-only';
import { db } from '@/lib/db';

export type CommentData = {
   id: string;
   body: string;
   createdAt: Date;
   author: { id: string; name: string; avatarUrl: string | null };
};

export async function getTaskComments(taskId: string): Promise<CommentData[]> {
   return db.comment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'asc' },
      select: {
         id: true,
         body: true,
         createdAt: true,
         author: { select: { id: true, name: true, avatarUrl: true } },
      },
   });
}
