# ─── Etapa 1: build con Node ────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Copia primero los lockfiles para aprovechar caché de capas
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# Copia el resto del código y construye en modo production
COPY . .
RUN npm run build -- --configuration=production

# ─── Etapa 2: nginx sirviendo los estáticos ────────────────────────────
FROM nginx:alpine

# Copia el bundle generado por Angular (sale a /app/www por angular.json)
COPY --from=build /app/www /usr/share/nginx/html

# Configuración SPA (escucha en 8080, fallback a index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
