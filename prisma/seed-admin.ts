import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

function avatar(seed: string) {
   return `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(seed)}`;
}

async function main() {
   const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
   const password = process.env.ADMIN_PASSWORD;
   const name = process.env.ADMIN_NAME?.trim() || 'Administrator';

   if (!email || !password) {
      console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env before running seed:admin.');
      process.exit(1);
   }

   const passwordHash = await bcrypt.hash(password, 10);
   const user = await db.user.upsert({
      where: { email },
      update: { role: 'ADMIN', status: 'APPROVED', approvedAt: new Date(), passwordHash, name },
      create: {
         email,
         name,
         passwordHash,
         avatarUrl: avatar(name),
         role: 'ADMIN',
         status: 'APPROVED',
         approvedAt: new Date(),
      },
   });

   console.log(`Admin ready: ${user.email}`);
}

main()
   .catch((e) => {
      console.error(e);
      process.exit(1);
   })
   .finally(async () => {
      await db.$disconnect();
   });
