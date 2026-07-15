# Postgres en Producción

## Arquitectura

- **Dev**: SQLite (`prisma/dev.db`) — sin dependencias externas.
- **Prod**: PostgreSQL 16 via Docker Compose.

El switch entre ambos se hace seteando `DATABASE_URL` en el entorno.

## Configuración Rápida

### 1. Levantar Postgres + Backend + Frontend

```bash
# En la raíz del proyecto:
docker compose up -d
```

Esto levanta:
- `postgres:16-alpine` en `localhost:5432`
- Backend en `localhost:5000`
- Frontend en `localhost:80`

### 2. Setear variables de entorno

Crear `.env` en la raíz (o exportar las vars):

```bash
# Requeridas
DATABASE_URL="postgresql://andy_user:change-in-production@localhost:5432/andy_ecommerce"
JWT_SECRET="<generate-a-secure-random-string>"

# Opcionales
STRIPE_SECRET_KEY=""       # Dejar vacío para usar MockPaymentProvider
REDIS_URL=""               # Dejar vacío para usar InMemoryCache
FRONTEND_URL="http://localhost:80"
```

### 3. Pushear schema a Postgres

```bash
cd backend
DATABASE_URL="postgresql://andy_user:change-in-production@localhost:5432/andy_ecommerce" \
  npm run db:push:prod
```

### 4. (Opcional) Migraciones versionadas

```bash
DATABASE_URL="postgresql://andy_user:change-in-production@localhost:5432/andy_ecommerce" \
  npm run db:migrate:prod
```

## Scripts Disponibles

| Script | Descripción |
|---|---|
| `npm run db:push` | Pushea schema SQLite |
| `npm run db:push:prod` | Pushea schema Postgres |
| `npm run db:generate` | Genera Prisma Client (SQLite) |
| `npm run db:generate:prod` | Genera Prisma Client (Postgres) |
| `npm run db:migrate:prod` | Crea/ejecuta migraciones Postgres |
| `npm run db:studio:prod` | Prisma Studio contra Postgres |

## Schema Dual

- `prisma/schema.prisma` — **SQLite** (dev). Provider `sqlite`.
- `prisma/schema.prod.prisma` — **PostgreSQL** (prod). Provider `postgresql`.

Ambos schemas tienen los mismos modelos, índices y relaciones. La única diferencia es el provider.

**IMPORTANTE**: El Prisma Client se genera a partir de UN schema por vez. Asegurate de regenerarlo si cambiás entre dev y prod:

```bash
# Dev
npx prisma generate

# Prod  
npx prisma generate --schema=prisma/schema.prod.prisma
```

## Docker Compose

El `docker-compose.yml` actual incluye:
- `postgres` — base de datos PostgreSQL 16 Alpine
- `backend` — API que usa Postgres (vía `DATABASE_URL`)
- `frontend` — React servido por Nginx

Build args:
- `PRISMA_SCHEMA=prisma/schema.prod.prisma` — para generar el client correcto

```yaml
backend:
  build:
    args:
      PRISMA_SCHEMA: prisma/schema.prod.prisma
```

## Troubleshooting

### `prisma: error Environment variable not found: DATABASE_URL`

Asegurate de exportar `DATABASE_URL` antes de cualquier comando Prisma:

```bash
export DATABASE_URL="postgresql://andy_user:change-in-production@localhost:5432/andy_ecommerce"
```

### Conexión rechazada a Postgres

Verificá que el contenedor esté corriendo:

```bash
docker ps | grep postgres
```

y que podés conectar:

```bash
docker exec -it andy-ecommerce-db psql -U andy_user -d andy_ecommerce
```
