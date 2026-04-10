# ============================================
# DOCKERFILE - BACKEND
# Why? Docker permite crear contenedores reproducibles
# que facilitan el deployment y evitan el "funciona en mi máquina".
# ============================================

# Usar imagen oficial de Node.js (LTS)
FROM node:20-alpine

# Definir directorio de trabajo
WORKDIR /app

# ============================================
# ETAPA 1: DEPENDENCIAS
# Why? Separar la instalación de dependencias del código
# permite caching efectivo y reduce tiempo de build
# cuando solo cambia el código
# ============================================
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --only=production

# ============================================
# ETAPA 2: CÓDIGO
# ============================================
COPY prisma ./prisma
COPY src ./src
COPY tsconfig.json ./
COPY .env.production ./.env

# Generar Prisma Client
RUN npx prisma generate

# Compilar TypeScript
RUN npm run build

# ============================================
# CONFIGURACIÓN FINAL
# ============================================
# Exponer puerto
EXPOSE 5000

# Comando para iniciar la aplicación
CMD ["node", "dist/index.js"]

# ============================================
# NOTAS DE USO:
# 1. Build: docker build -t andy-ecommerce-backend .
# 2. Run: docker run -p 5000:5000 andy-ecommerce-backend
# 3. Compose: docker-compose up
# ============================================