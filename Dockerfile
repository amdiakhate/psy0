# PSY0 Trainer — front statique et API de synchronisation dans une seule image.
# Un seul conteneur applicatif à gérer dans Coolify, et le front est servi par
# la même origine que l'API : pas de CORS, cookie de session simple.

FROM node:24-alpine AS build
WORKDIR /app

# Couche de dépendances séparée : elle ne se réinstalle que si les manifestes changent.
COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig*.json vite.config.ts index.html ./
COPY public ./public
COPY src ./src
COPY server ./server

# `tsc -b` compile front ET serveur ; vite build produit le bundle statique.
RUN npm run build && npm run build:server


FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Dépendances de production uniquement : ni Vite, ni TypeScript, ni tests.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/server-dist ./server-dist
COPY --from=build /app/dist ./public
COPY server/migrations ./migrations

# Pas de root : si l'application est compromise, l'attaquant hérite d'un compte sans droits.
USER node

EXPOSE 3000

# Le healthcheck teste aussi la base : un conteneur qui répond mais ne peut pas
# écrire la progression n'est pas « sain », il est trompeur.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>r.json()).then(j=>process.exit(j.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server-dist/index.js"]
