# ==============================================
# Dockerfile pour DSFR-MCP Server
# Version: 1.3.1
# ==============================================

# ---- Stage 1: Builder ----
FROM node:20-alpine AS builder

LABEL maintainer="Alex <alex@example.com>"
LABEL description="DSFR MCP Server - Système de Design de l'État Français"
LABEL version="1.3.1"

# Variables d'environnement pour le build
ENV NODE_ENV=production
ENV NPM_CONFIG_LOGLEVEL=warn

# Installer les dépendances système nécessaires
RUN apk add --no-cache \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Créer le répertoire de travail
WORKDIR /app

# Copier les fichiers de package en premier (cache layer)
COPY package*.json ./

# Installer les dépendances (production uniquement)
RUN npm ci --only=production --silent && npm cache clean --force

# ---- Stage 2: Runtime ----
FROM node:20-alpine AS runtime

# Variables d'environnement pour l'exécution
ENV NODE_ENV=production
ENV LOG_LEVEL=info
ENV MCP_MODE=stdio
ENV PORT=3000

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs && \
    adduser -S dsfr -u 1001

# Installer dumb-init pour la gestion des signaux
RUN apk add --no-cache dumb-init && rm -rf /var/cache/apk/*

# Créer les répertoires nécessaires
WORKDIR /app
RUN mkdir -p /app/data /app/logs && \
    chown -R dsfr:nodejs /app

# Copier les node_modules depuis le stage builder
COPY --from=builder --chown=dsfr:nodejs /app/node_modules ./node_modules

# Copier le code source de l'application
COPY --chown=dsfr:nodejs . .

# Créer un volume pour les données persistantes
VOLUME ["/app/data", "/app/logs"]

# Exposer les ports (pour mode TCP optionnel)
EXPOSE 3000

# Basculer vers l'utilisateur non-root
USER dsfr

# Définir les points d'entrée multiples
# Par défaut: mode stdio pour MCP
CMD ["dumb-init", "node", "src/index.js"]

# ---- Labels pour metadata ----
LABEL org.opencontainers.image.title="DSFR-MCP" \
      org.opencontainers.image.description="MCP Server pour le Système de Design de l'État Français" \
      org.opencontainers.image.version="1.3.1" \
      org.opencontainers.image.authors="Alex" \
      org.opencontainers.image.source="https://github.com/Alexmacapple/DSFR-MCP" \
      org.opencontainers.image.documentation="https://github.com/Alexmacapple/DSFR-MCP/blob/main/README.md"

# ---- Healthcheck ----
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "console.log('MCP Server is healthy')" || exit 1