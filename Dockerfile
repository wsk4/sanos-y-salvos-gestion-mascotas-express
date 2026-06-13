# ==========================================
# Runtime e Instalación Limpia de Node
# ==========================================
FROM node:22-alpine

# Instalar 'tini' para gestionar correctamente las señales del sistema (SIGTERM, SIGINT)
RUN apk add --no-cache tini

# Configuración del entorno global para pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@11.3.0 --activate

WORKDIR /app

# Copiar manifiestos asegurando que pertenezcan al usuario del sistema 'node'
COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml* ./

# Instalación estricta de dependencias omitiendo las de desarrollo (DevDependencies)
RUN pnpm install --frozen-lockfile --prod

# Copiar el código fuente garantizando permisos restrictivos seguros
COPY --chown=node:node src/ ./src/
COPY --chown=node:node index.js .

# Cambiar al usuario no-privilegiado nativo de la imagen Alpine de Node
USER node

# Tini interceptará el proceso garantizando un ciclo de vida limpio del contenedor
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "index.js"]