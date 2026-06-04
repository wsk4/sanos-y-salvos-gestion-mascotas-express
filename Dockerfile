FROM node:20-alpine
RUN npm install -g pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod
COPY src/ ./src/
EXPOSE 8080
CMD ["node", "src/app.js"]