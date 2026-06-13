# =========================================================
# Fase única de producción (Ligera y segura)
# =========================================================
FROM node:22-alpine

# Instalamos 'tini' para manejar correctamente el ciclo de vida del proceso (PID 1)
RUN apk add --no-cache tini

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@11.3.0 --activate

WORKDIR /app

# Copiamos archivos de configuración con el dueño correcto
COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Instalación limpia de producción
RUN pnpm install --frozen-lockfile --prod

# Copiamos el código fuente garantizando que pertenezca al usuario 'node'
COPY --chown=node:node src/ ./src/
COPY --chown=node:node index.js .

# Cambiamos al usuario seguro no-privilegiado antes de la ejecución
USER node

EXPOSE 8080

# Usamos tini como entrypoint para un graceful shutdown seguro
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "index.js"]