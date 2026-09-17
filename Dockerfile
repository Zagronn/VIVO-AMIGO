FROM node:22-bookworm-slim

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund

COPY --chown=node:node compliance.api.js vivopos.service.js agents.service.js schema.sql PROJECT_CONTEXT.md agents.config.yml swarm.config.yml ./
COPY --chown=node:node public ./public
RUN mkdir -p /data && chown node:node /data

USER node
EXPOSE 3001 3002

CMD ["node", "compliance.api.js"]