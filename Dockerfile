FROM node:18-alpine as base



#Install all dependencies
FROM base as deps

WORKDIR /api

COPY package.json yarn.lock* ./

RUN yarn install



#Build the file
FROM base as builder

WORKDIR /api

COPY --from=deps /api/node_modules ./node_modules

COPY . .

RUN yarn prisma generate

RUN yarn build


#Run the file
FROM base as runner

WORKDIR /api

ENV NODE_ENV production

COPY --from=builder /api/node_modules ./node_modules
COPY --from=builder /api/dist ./dist


RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

USER nestjs

EXPOSE 8400

ENV PORT 8400

CMD ["node", "dist/main.js"]