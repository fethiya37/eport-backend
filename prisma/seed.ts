// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const phone_number = '+251900000000';
  const password = 'supersecret';

  const existing = await prisma.user.findUnique({ where: { phone_number } });
  if (!existing) {
    const hash = await bcrypt.hash(password, 10);
    await prisma.user.upsert({
      where: { phone_number },
      update: {
        password_hash: hash,
        user_type: 'Superadmin',
        name: 'Super Admin',
        is_locked: false,
      },
      create: {
        phone_number,
        password_hash: hash,
        user_type: 'Superadmin',
        name: 'Super Admin',
        is_locked: false,
      },
    });
    console.log('✅ Superadmin seeded:', phone_number, '/', password);
  } else {
    console.log('ℹ️ Superadmin already exists');
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
