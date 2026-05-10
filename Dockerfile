FROM node:22
WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=4000

COPY package*.json ./
RUN npm install --omit=dev

COPY prisma ./prisma
RUN npx prisma generate

COPY dist ./dist

EXPOSE 4000
CMD ["node", "dist/src/main.js"]