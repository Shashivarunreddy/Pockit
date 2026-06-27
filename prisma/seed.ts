import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

const DEMO_PASSWORD = 'demo1234';

function avatar(seed: string) {
   return `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(seed)}`;
}

async function main() {
   await db.comment.deleteMany();
   await db.task.deleteMany();
   await db.project.deleteMany();
   await db.user.deleteMany();

   const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

   const [ada, linus, grace, alan] = await Promise.all(
      [
         { name: 'Ada Lovelace', email: 'ada@pockit.dev' },
         { name: 'Linus Torvalds', email: 'linus@pockit.dev' },
         { name: 'Grace Hopper', email: 'grace@pockit.dev' },
         { name: 'Alan Turing', email: 'alan@pockit.dev' },
      ].map((u) =>
         db.user.create({
            data: {
               ...u,
               passwordHash,
               avatarUrl: avatar(u.name),
               role: 'MEMBER',
               status: 'APPROVED',
               approvedAt: new Date(),
            },
         })
      )
   );

   const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
   const adminPassword = process.env.ADMIN_PASSWORD;
   if (adminEmail && adminPassword) {
      const adminName = process.env.ADMIN_NAME?.trim() || 'Administrator';
      await db.user.create({
         data: {
            name: adminName,
            email: adminEmail,
            passwordHash: await bcrypt.hash(adminPassword, 10),
            avatarUrl: avatar(adminName),
            role: 'ADMIN',
            status: 'APPROVED',
            approvedAt: new Date(),
         },
      });
      console.log(`  admin:    ${adminEmail} (from .env)`);
   } else {
      console.warn('  admin:    skipped — set ADMIN_EMAIL and ADMIN_PASSWORD in .env');
   }

   const website = await db.project.create({
      data: {
         name: 'Website Revamp',
         description: 'Rebuild the marketing site with the new brand system.',
         color: '#6e56cf',
         creatorId: ada.id,
      },
   });

   const mobile = await db.project.create({
      data: {
         name: 'Mobile App',
         description: 'Ship the v1 iOS + Android client.',
         color: '#0091ff',
         creatorId: linus.id,
      },
   });

   const tasks: Array<{
      project: typeof website;
      title: string;
      status: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
      priority: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
      assignee: typeof ada | null;
      creator: typeof ada;
      position: number;
      description?: string;
   }> = [
      {
         project: website,
         title: 'Design new landing page',
         status: 'IN_PROGRESS',
         priority: 'HIGH',
         assignee: ada,
         creator: ada,
         position: 1000,
         description: 'Hero, features, pricing, footer.',
      },
      {
         project: website,
         title: 'Set up analytics',
         status: 'TODO',
         priority: 'MEDIUM',
         assignee: grace,
         creator: ada,
         position: 1000,
      },
      {
         project: website,
         title: 'Write blog migration script',
         status: 'BACKLOG',
         priority: 'LOW',
         assignee: null,
         creator: ada,
         position: 1000,
      },
      {
         project: website,
         title: 'Accessibility audit',
         status: 'IN_REVIEW',
         priority: 'MEDIUM',
         assignee: alan,
         creator: grace,
         position: 1000,
      },
      {
         project: website,
         title: 'Choose hosting provider',
         status: 'DONE',
         priority: 'NONE',
         assignee: ada,
         creator: ada,
         position: 1000,
      },
      {
         project: mobile,
         title: 'Implement push notifications',
         status: 'IN_PROGRESS',
         priority: 'URGENT',
         assignee: linus,
         creator: linus,
         position: 1000,
      },
      {
         project: mobile,
         title: 'Onboarding flow',
         status: 'TODO',
         priority: 'HIGH',
         assignee: grace,
         creator: linus,
         position: 1000,
      },
      {
         project: mobile,
         title: 'Crash reporting integration',
         status: 'TODO',
         priority: 'MEDIUM',
         assignee: alan,
         creator: linus,
         position: 2000,
      },
   ];

   const createdTasks = await Promise.all(
      tasks.map((t) =>
         db.task.create({
            data: {
               projectId: t.project.id,
               title: t.title,
               description: t.description ?? null,
               status: t.status,
               priority: t.priority,
               position: t.position,
               assigneeId: t.assignee?.id ?? null,
               creatorId: t.creator.id,
               completedAt: t.status === 'DONE' ? new Date() : null,
            },
         })
      )
   );

   const landing = createdTasks[0];
   const push = createdTasks[5];

   await db.comment.createMany({
      data: [
         { taskId: landing.id, authorId: grace.id, body: 'Love the hero direction!' },
         { taskId: landing.id, authorId: ada.id, body: 'Thanks — pushing the latest mockups now.' },
         {
            taskId: push.id,
            authorId: alan.id,
            body: 'Make sure we handle the iOS permission prompt gracefully.',
         },
      ],
   });

   console.log('Seed complete:');
   console.log(`  users:    ${[ada, linus, grace, alan].length}`);
   console.log(`  projects: 2`);
   console.log(`  tasks:    ${createdTasks.length}`);
   console.log(
      `  login with any of: ada@pockit.dev / linus@pockit.dev / grace@pockit.dev / alan@pockit.dev`
   );
   console.log(`  password: ${DEMO_PASSWORD}`);
}

main()
   .catch((e) => {
      console.error(e);
      process.exit(1);
   })
   .finally(async () => {
      await db.$disconnect();
   });
