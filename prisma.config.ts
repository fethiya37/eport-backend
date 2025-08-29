// prisma.config.ts
import 'dotenv/config';              // <— add this line
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: './src/infrastructure/prisma/schema.prisma',
});
