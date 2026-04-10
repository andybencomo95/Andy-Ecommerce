# Andy Ecommerce

> Proyecto de tienda en linea desarrollado como parte de mi formacion como estudiante de Ingenieria de Software.

---

## Quien soy

Soy Andy Bencomo Del Rio, estudiante de Ingenieria de Software (6 semestre) en la Universidad Manuela Beltran. Este proyecto lo hice como practica para aplicar y consolidar todo lo que he aprendido durante mi carrera.

Decidi crear un e-commerce porque es uno de los proyectos mas completos que puedes hacer: maneja base de datos, autenticacion, gestion de estados, UI/UX, y logica de negocio real.

---

## Por que estas tecnologias

| Tecnologia | Por que la elegi |
|------------|------------------|
| **TypeScript** | El tipado me ayuda a detectar errores antes de que lleguen a produccion. Me ahorro mucho tiempo de debug. |
| **React + Vite** | Vite es muy rapido para desarrollo. React me permite crear interfaces de forma componentizada y reutilizable. |
| **Node.js + Express** | Puedo usar JavaScript en todo el stack. Menos contexto switching. Express es minimalista y me da control total. |
| **Prisma + SQLite** | Prisma hace que trabajar con bases de datos sea muy facil. SQLite es perfecto para desarrollo y prototipos. |
| **JWT** | Es el estandar de la industria para autenticacion stateless. Ligero y efectivo. |
| **Zod** | Validacion de esquemas tipo-segura en backend. Me permite validar inputs de forma clara y reutilizable. |
| **Vitest** | Testing moderno y rapido. Lo use para escribir tests unitarios. |
| **Docker** | Para containerizar la aplicacion y facilitar el deployment. |

---

## Lo que tiene el proyecto

### Para Usuarios
- Registro y Login con JWT
- Catalogo de productos con filtros por categoria y busqueda
- Detalle de productos con informacion completa
- Carrito de compras persistente (localStorage)
- Checkout con validacion de direccion
- Historial de pedidos del usuario

### Para Administradores
- Dashboard con estadisticas de ventas y pedidos
- Gestion de productos (CRUD completo)
- Gestion de pedidos (seguimiento de estado)
- Marcar pedidos como pagados/entregados

### Lo tecnico
- Validacion de inputs con Zod
- Logging estructurado con Pino
- Seguridad: Helmet, Rate Limiting, CORS, bcrypt
- Base de datos con indices y soft deletes
- Testing con Vitest
- Docker multi-stage build
- CI/CD con GitHub Actions
- ESLint + Prettier
- Manejo de errores: Error Boundary React, pagina 404

---

## Decisiones tecnicas y problemas que resolvi

### 1. Validacion de inputs
**Problema:** Al principio validaba todo en los controladores con condicionales simples. El codigo quedaba largo y era dificil mantenerlo.

**Solucion:** Implemente Zod con un middleware reutilizable. Ahora puedo definir esquemas tipo-seguro y usarlos en cualquier ruta.

```typescript
const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(6)
});

router.post('/register', validateRequest({ body: createUserSchema }), register);
```

### 2. Logging en produccion
**Problema:** Usaba console.log en varios lados. En produccion no podia buscar errores en los logs.

**Solucion:** Implemente Pino con logging estructurado. Ahora los logs son JSON en produccion y pretty en desarrollo.

### 3. Consultas lentas en base de datos
**Problema:** Las busquedas de productos por categoria eran lentas porque no habia indices.

**Solucion:** Agregue indices en el schema de Prisma para los campos que mas se consultan.

```prisma
model Product {
  @@index([category])
  @@index([name])
  @@index([deletedAt])
}
```

### 4. Errores que crasheaban la app
**Problema:** Cuando habia un error no manejado en React, toda la app quedaba en blanco.

**Solucion:** Implemente Error Boundary que captura errores y muestra una UI amigable.

### 5. Como hacer que el codigo pase el mismo proceso en cada cambio
**Problema:** A veces alguien hacia push y el codigo rompia en production.

**Solucion:** GitHub Actions que corre lint, tests, format check y build en cada PR y push.

---

## Lo que falta (siendo honesto)

### Pagos no son reales
El checkout tiene un select para elegir metodo de pago (Stripe/PayPal) pero es solo simulacion. No hay integracion real con ninguna plataforma de pagos. Para un proyecto real, falta integrar Stripe o PayPal con sus respectivas APIs.

### No hay tests de integracion
Solo tengo tests unitarios basicos. Faltarian tests que proben la API completa o tests end-to-end con Cypress o Playwright.

### Faltan animaciones y mejor UX
Los estilos son inline basicos. Un proyecto profesional tendria animaciones suaves, skeletons de carga, y mejor feedback visual.

### Falta Service Layer Pattern
Los modelos llaman directamente a Prisma. En proyectos mas grandes, seria mejor tener una capa de servicios intermedia.

### No hay Redis para caching
En produccion, seria ideal cachear respuestas frecuentes de la API.

---

## Estructura del proyecto

```
andy-ecommerce/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── index.ts
│   ├── prisma/
│   ├── __tests__/
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   └── App.tsx
│   └── package.json
│
├── docker/
├── docker-compose.yml
├── .github/workflows/
└── README.md
```

---

## Como instalarlo

### Prerrequisitos
- Node.js 18+
- Docker (opcional)

### Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## Scripts disponibles

### Backend
- `npm run dev` - Desarrollo
- `npm run build` - Compilar
- `npm run test` - Tests
- `npm run lint` - Verificar codigo
- `npm run format` - Formatear

### Frontend
- `npm run dev` - Desarrollo
- `npm run build` - Build produccion
- `npm run test` - Tests

---

## Lo que aprendi

Este proyecto me ayudo a consolidar:

- TypeScript con tipado estatico
- React con Hooks y Context API
- Node.js con Express
- Prisma para base de datos
- Autenticacion con JWT
- Validacion con Zod
- Logging estructurado
- Testing con Vitest
- Docker y CI/CD
- Buenas practicas de codigo

---

## Que sigue

Si sigo desarrollando esto, mejoraria:
1. Integrar pagos reales con Stripe
2. Agregar mas tests de integracion
3. Migrar a PostgreSQL para produccion
4. Implementar TanStack Query
5. Agregar animaciones y mejor UX

---
