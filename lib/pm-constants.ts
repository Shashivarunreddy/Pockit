import type { TaskStatusValue, PriorityValue } from '@/lib/schemas';

export const STATUS_ORDER: TaskStatusValue[] = [
   'BACKLOG',
   'TODO',
   'IN_PROGRESS',
   'IN_REVIEW',
   'DONE',
];

export const STATUS_META: Record<TaskStatusValue, { label: string; color: string }> = {
   BACKLOG: { label: 'Backlog', color: '#8e8c99' },
   TODO: { label: 'Todo', color: '#0091ff' },
   IN_PROGRESS: { label: 'In Progress', color: '#f5a623' },
   IN_REVIEW: { label: 'In Review', color: '#d6409f' },
   DONE: { label: 'Done', color: '#30a46c' },
};

export const PRIORITY_ORDER: PriorityValue[] = ['URGENT', 'HIGH', 'MEDIUM', 'LOW', 'NONE'];

export const PRIORITY_META: Record<PriorityValue, { label: string; color: string }> = {
   NONE: { label: 'No priority', color: '#8e8c99' },
   LOW: { label: 'Low', color: '#6e8eb5' },
   MEDIUM: { label: 'Medium', color: '#f5a623' },
   HIGH: { label: 'High', color: '#f76808' },
   URGENT: { label: 'Urgent', color: '#e5484d' },
};
