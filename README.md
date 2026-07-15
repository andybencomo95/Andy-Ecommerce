# 🛒 Andy E-commerce (Fullstack)

Plataforma de comercio electrónico fullstack desarrollada con un enfoque en la tipificación estática, la validación robusta de datos y la separación de responsabilidades. Este proyecto sirve como demostración de arquitectura limpia, manejo de estados, rutas protegidas y pruebas unitarias en un entorno de desarrollo moderno.

> **Nota:** Este es un proyecto en desarrollo activo, enfocado en la calidad del código y las buenas prácticas de ingeniería de software.

---

## 🚀 Tecnologías Utilizadas

### Frontend
- **React 18** con **TypeScript**
- **Vite** (Build tool y dev server)
- **React Router DOM** (Enrutamiento y rutas protegidas)
- **Zod** (Validación de esquemas en el cliente)
- **Vitest** + **React Testing Library** (Pruebas unitarias y de componentes)

### Backend
- **Node.js** con **Express**
- **TypeScript**
- **Prisma ORM** (Tipado seguro de base de datos)
- **PostgreSQL** (Base de datos relacional)
- **Zod** (Validación de requests en el servidor)
- **Helmet** y **express-rate-limit** (Seguridad básica)

---

## ✨ Características Principales

- ✅ **Autenticación y Autorización:** Manejo de sesiones y rutas protegidas (`ProtectedRoute`) con diferenciación de roles (ej. `admin` vs `user`).
- ✅ **Arquitectura Limpia:** Separación clara entre rutas, controladores y servicios en el backend. Uso de patrón de fábrica (`createApp`) para facilitar el testing.
- ✅ **Validación Estricta:** Uso de `Zod` tanto en el frontend como en el backend para garantizar la integridad de los datos.
- ✅ **Manejo de Errores:** Implementación de `ErrorBoundary` en React para evitar pantallas blancas y mejorar la experiencia de usuario.
- ✅ **Pruebas Unitarias:** Tests de componentes críticos utilizando `@testing-library/react` y `user-event`.

---

## 📂 Estructura del Proyecto

```text
├── frontend/
│   ├── src/
│   │   ├── components/       # Componentes reutilizables (UI)
│   │   ├── pages/            # Vistas principales de la aplicación
│   │   ├── routes/           # Configuración de React Router y ProtectedRoutes
│   │   ├── utils/            # Funciones auxiliares y configuraciones
│   │   └── App.tsx           # Punto de entrada y configuración de rutas
├── backend/
│   ├── src/
│   │   ├── routes/           # Definición de endpoints
│   │   ├── controllers/      # Lógica de negocio
│   │   ├── middleware/       # Middlewares de validación (Zod), auth y seguridad
│   │   └── index.ts          # Configuración del servidor y patrón createApp
├── prisma/
│   └── schema.prisma         # Esquema de la base de datos
└── README.md

Andy Bencomo
Desarrollador Fullstack en formación | Estudiante de Ingeniería de Software
https://www.linkedin.com/in/andy-bencomo-608741287/