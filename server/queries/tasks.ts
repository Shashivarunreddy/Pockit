import 'server-only';
import { db } from '@/lib/db';
import type { TaskStatusValue, PriorityValue } from '@/lib/schemas';

export type TaskAssignee = { id: string; name: string; avatarUrl: string | null };

export type TaskCardData = {
   id: string;
   projectId: string;
   title: string;
   description: string | null;
   status: TaskStatusValue;
   priority: PriorityValue;
   position: number;
   dueDate: Date | null;
   assignee: TaskAssignee | null;
   commentCount: number;
};

const taskCardSelect = {
   id: true,
   projectId: true,
   title: true,
   description: true,
   status: true,
   priority: true,
   position: true,
   dueDate: true,
   assignee: { select: { id: true, name: true, avatarUrl: true } },
   _count: { select: { comments: true } },
} as const;

type TaskCardRow = {
   id: string;
   projectId: string;
   title: string;
   description: string | null;
   status: string;
   priority: string;
   position: number;
   dueDate: Date | null;
   assignee: TaskAssignee | null;
   _count: { comments: number };
};

function toCard(t: TaskCardRow): TaskCardData {
   return {
      id: t.id,
      projectId: t.projectId,
      title: t.title,
      description: t.description,
      status: t.status as TaskStatusValue,
      priority: t.priority as PriorityValue,
      position: t.position,
      dueDate: t.dueDate,
      assignee: t.assignee,
      commentCount: t._count.comments,
   };
}

export async function getProjectTasks(projectId: string): Promise<TaskCardData[]> {
   const tasks = await db.task.findMany({
      where: { projectId, archivedAt: null },
      orderBy: [{ status: 'asc' }, { position: 'asc' }],
      select: taskCardSelect,
   });
   return tasks.map(toCard);
}

export type MyTaskCard = TaskCardData & {
   project: { id: string; name: string; color: string | null };
};

export async function getMyTasks(userId: string): Promise<MyTaskCard[]> {
   const tasks = await db.task.findMany({
      where: { assigneeId: userId, archivedAt: null },
      orderBy: [{ status: 'asc' }, { dueDate: 'asc' }, { position: 'asc' }],

      select: {
         id: true,
         projectId: true,
         title: true,
         description: true,
         status: true,
         priority: true,
         position: true,
         dueDate: true,
         assignee: { select: { id: true, name: true, avatarUrl: true } },
         _count: { select: { comments: true } },
         project: { select: { id: true, name: true, color: true } },
      },
   });
   return tasks.map(
      (t: TaskCardRow & { project: { id: string; name: string; color: string | null } }) => ({
         ...toCard(t),
         project: t.project,
      })
   );
}

export type TaskDetailData = {
   id: string;
   projectId: string;
   title: string;
   description: string | null;
   status: TaskStatusValue;
   priority: PriorityValue;
   dueDate: Date | null;
   createdAt: Date;
   completedAt: Date | null;
   assignee: TaskAssignee | null;
   creator: TaskAssignee;
   project: { id: string; name: string };
};

export async function getTaskById(id: string): Promise<TaskDetailData | null> {
   const task = await db.task.findFirst({
      where: { id, archivedAt: null },
      select: {
         id: true,
         projectId: true,
         title: true,
         description: true,
         status: true,
         priority: true,
         dueDate: true,
         createdAt: true,
         completedAt: true,
         assignee: { select: { id: true, name: true, avatarUrl: true } },
         creator: { select: { id: true, name: true, avatarUrl: true } },
         project: { select: { id: true, name: true } },
      },
   });
   if (!task) return null;
   return {
      ...task,
      status: task.status as TaskStatusValue,
      priority: task.priority as PriorityValue,
   };
}
