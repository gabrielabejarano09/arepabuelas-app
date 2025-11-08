# frontend/Dockerfile

# --- Stage 1: Build ---
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- Stage 2: Production ---
FROM nginx:stable-alpine

# Copia los archivos estáticos construidos
COPY --from=build /app/dist /usr/share/nginx/html

# ¡CAMBIO CLAVE! Copia nuestro archivo de configuración personalizado
# Esto sobreescribirá la configuración por defecto de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]