// prisma.config.ts
import 'dotenv/config';   // ✅ makes sure .env is loaded
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  // @ts-expect-error seed is available in Prisma 7
  seed: 'ts-node --transpile-only prisma/seed.ts',
});
