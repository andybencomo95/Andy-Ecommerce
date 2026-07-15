# ============================================
# DOCKERFILE - FRONTEND
# Why? Similar al backend, pero sirve los archivos estáticos
# con Nginx para mejor rendimiento en producción
# ============================================

# ============================================
# ETAPA 1: BUILD
# Why? Primero construimos la aplicación, luego servimos
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de package
COPY package*.json ./

# Instalar todas las dependencias (incluye dev para build)
RUN npm ci

# Copiar código fuente
COPY src ./src
COPY public ./public
COPY index.html .
COPY tsconfig.json .
COPY vite.config.ts .
COPY .eslintrc.json .
COPY .prettierrc .

# Build de producción
RUN npm run build

# ============================================
# ETAPA 2: SERVIR CON NGINX
# Why? Nginx es más eficiente que Node para servir archivos estáticos
# Also sirve como proxy reverse en producción
# ============================================
FROM nginx:alpine

# Copiar build del builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración de nginx
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto 80
EXPOSE 80

# Nginx corre en foreground
CMD ["nginx", "-g", "daemon off;"]

# ============================================
# NOTAS:
# - Build: docker build -t andy-ecommerce-frontend .
# - Run: docker run -p 80:80 andy-ecommerce-frontend
# ============================================