import 'server-only';
import { db } from '@/lib/db';

export type ProjectListItem = {
   id: string;
   name: string;
   description: string | null;
   color: string | null;
   createdAt: Date;
   taskCount: number;
   creator: { id: string; name: string; avatarUrl: string | null };
};

const projectSelect = {
   id: true,
   name: true,
   description: true,
   color: true,
   createdAt: true,
   creator: { select: { id: true, name: true, avatarUrl: true } },
} as const;

export async function getProjects(): Promise<ProjectListItem[]> {
   const projects = await db.project.findMany({
      where: { archivedAt: null },
      orderBy: { createdAt: 'desc' },
      select: projectSelect,
   });

   const counts = await db.task.groupBy({
      by: ['projectId'],
      where: { archivedAt: null },
      _count: { _all: true },
   });
   const countMap = new Map(
      counts.map((c: { projectId: string; _count: { _all: number } }): [string, number] => [
         c.projectId,
         c._count._all,
      ])
   );

   return projects.map((p: Omit<ProjectListItem, 'taskCount'>) => ({
      ...p,
      taskCount: countMap.get(p.id) ?? 0,
   }));
}

export type ProjectDetail = {
   id: string;
   name: string;
   description: string | null;
   color: string | null;
   createdAt: Date;
   creator: { id: string; name: string; avatarUrl: string | null };
};

export async function getProjectById(id: string): Promise<ProjectDetail | null> {
   return db.project.findFirst({
      where: { id, archivedAt: null },
      select: projectSelect,
   });
}
