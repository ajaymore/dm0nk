# base node image
FROM node:20.15.1-bullseye-slim AS base

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl

# Install all node_modules, including dev dependencies
FROM base AS build

RUN mkdir /app
WORKDIR /app

ADD . .
RUN npm install


RUN npm run build

FROM base

ENV NODE_ENV=production

RUN mkdir /app
WORKDIR /app

ADD package.server.json package.json
RUN npm install --omit=dev

COPY --from=build /app/dist /app/dist
ADD keys keys
ADD server.js server.js

EXPOSE 3000

CMD [ "npm", "start" ]