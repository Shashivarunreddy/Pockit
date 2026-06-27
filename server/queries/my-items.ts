import 'server-only';
import { db } from '@/lib/db';
import { PROJECT_COLORS } from '@/lib/schemas';
import type { PriorityValue } from '@/lib/schemas';

export type MyItemData = {
   id: string;
   columnId: string;
   title: string;
   description: string | null;
   priority: PriorityValue;
   position: number;
   dueDate: Date | null;
};

export type MyColumnData = {
   id: string;
   name: string;
   color: string | null;
   position: number;
   items: MyItemData[];
};

type MyItemRow = {
   id: string;
   columnId: string;
   title: string;
   description: string | null;
   priority: string;
   position: number;
   dueDate: Date | null;
};

type MyColumnRow = {
   id: string;
   name: string;
   color: string | null;
   position: number;
   items: MyItemRow[];
};

function toItem(i: MyItemRow): MyItemData {
   return {
      id: i.id,
      columnId: i.columnId,
      title: i.title,
      description: i.description,
      priority: i.priority as PriorityValue,
      position: i.position,
      dueDate: i.dueDate,
   };
}

const DEFAULT_COLUMNS = [
   { name: 'To Do', color: PROJECT_COLORS[1] },
   { name: 'In Progress', color: PROJECT_COLORS[4] },
   { name: 'Done', color: PROJECT_COLORS[3] },
];

async function ensureDefaultColumns(userId: string): Promise<void> {
   const count = await db.myColumn.count({ where: { userId } });
   if (count > 0) return;
   await db.myColumn.createMany({
      data: DEFAULT_COLUMNS.map((c, i) => ({
         userId,
         name: c.name,
         color: c.color,
         position: (i + 1) * 1000,
      })),
   });
}

export async function getMyBoard(userId: string): Promise<MyColumnData[]> {
   await ensureDefaultColumns(userId);

   const columns = await db.myColumn.findMany({
      where: { userId },
      orderBy: { position: 'asc' },
      select: {
         id: true,
         name: true,
         color: true,
         position: true,
         items: {
            where: { userId },
            orderBy: { position: 'asc' },
            select: {
               id: true,
               columnId: true,
               title: true,
               description: true,
               priority: true,
               position: true,
               dueDate: true,
            },
         },
      },
   });

   return columns.map((c: MyColumnRow) => ({
      id: c.id,
      name: c.name,
      color: c.color,
      position: c.position,
      items: c.items.map(toItem),
   }));
}
