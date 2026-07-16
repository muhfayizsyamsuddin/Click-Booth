# stage 1: install dependencies and build the application
FROM node:22-alpine as builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
# build
RUN npm run build

# stage 2: run the application
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm install
COPY --from=builder /app/.next /app/.next
COPY --from=builder /app/package.json /app/package-lock.json ./

EXPOSE 3000
CMD [ "npm", "start" ]