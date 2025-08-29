// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const phone_number = '0900000000';
  const password = 'supersecret';

  const existing = await prisma.user.findUnique({ where: { phone_number } });
  if (!existing) {
    const hash = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        phone_number,
        user_type: 'Superadmin',
        password_hash: hash,
        name: 'System Root',
        is_locked: false,   // ✅ explicitly set
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
