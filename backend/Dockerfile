FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Instala solo las dependencias de producción para una imagen más ligera
RUN npm install --only=production

COPY . .

# El puerto que tu aplicación escucha internamente
EXPOSE 4000

CMD ["npm", "start"]