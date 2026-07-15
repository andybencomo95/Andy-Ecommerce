# Quality Refactor — Andy Ecommerce

Date: 2026-07-14
Status: approved (pending user sign-off on rendered spec)
Owner: code-quality pass

## 1. Problem

The project is a functional TypeScript full-stack e-commerce built by a solo student
during a 6-semester Software Engineering program. The README explicitly lists six
technical debts that keep it from being a "good final product":

1. Stripe checkout is a stub (select-only, no real flow, no paymentIntent lifecycle).
2. There are no integration tests; coverage is shallow unit tests that mostly re-test
   Node.js internals rather than the project's own code.
3. The UI is a single monolithic `index.css` plus inline styles everywhere. No
   skeletons, no real animations, weak accessibility.
4. Models call Prisma directly (no service layer). Hard to mock, hard to test,
   hard to evolve.
5. No Redis or any caching layer; the README flags this for production-readiness.
6. Postgres is not configured. SQLite is fine for dev but blocks a real deploy.

In addition to those six, the codebase has accumulated lower-grade but real
quality issues that we will fix in the same pass:

- Emojis appear in comments, console logs, error pages, and copy. Some are decorative
  (like a sad face on a 500 page) and add noise; only icon-font-style affordances
  (cart icon, store logo) should remain.
- ESLint config is loose (no `rules` beyond the default `eslint:recommended` and
  `@typescript-eslint/recommended`). Code that blocks regressions is not enforced.
- Errors in controllers are caught ad-hoc. The same `console.error('Error al X')`
  pattern repeats across `auth.ts`, `products.ts`, `orders.ts`. No shared
  `AppError` type. The `500` handler exposes `err.message` in `development` only.
- `prisma/dev.db` is committed to the repo despite being regenerable.
- Angular unused fields: `emailVerifiedAt`, `paidAt`, `deliveredAt` exist in
  schema but are inconsistently set.

## 2. Goal

Deliver a version of the same product where:

- All quality debts 1-6 from the README are addressed with visible, documented
  changes.
- The codebase passes a strict ESLint configuration (airbnb-typescript base).
- TypeScript is `strict: true` in both backend and frontend (already is) plus
  `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`.
- Backend routes never reach Prisma directly — they call services that own
  business logic.
- All cross-cutting errors flow through a single `AppError` + `errorHandler`
  middleware; client responses never leak stack traces in any environment.
- Frontend has a real styling system (CSS Modules + design tokens), no
  emojis-as-decoration, no monolithic `index.css`.
- Tests run deterministically with supertest against an in-memory or isolated
  Prisma client per suite.
- Stripe (mocked at the service boundary, switchable to real Stripe later)
  produces a real-looking payment flow: client receives a `clientSecret`,
  backend "confirms" only after the mock/simulator returns `succeeded`.
- Postgres is wired through docker-compose with a separate `DATABASE_URL` env.
  Production schema migration is reproducible.
- Redis (in-memory fallback when not configured) caches the catalog and
  categories with a TTL.

## 3. Non-goals

- We do not change the visual language of the brand or introduce a redesign.
- We do not add new customer-facing features outside what the debts imply.
  Examples of things we explicitly will NOT add: reviews, wishlist, shipping
  zones, multi-currency, i18n.
- We will not migrate to a runtime other than Node 20 LTS.
- We will not replace the React router (we keep `react-router-dom` v6).
- We will not switch from Prisma to TypeORM/Drizzle. The design assumes Prisma.
- We will not configure real Stripe keys. Stripe is simulated via a service
  facade (`PaymentProvider` interface). Swapping in real Stripe is a one-line
  binding change.

## 4. Architecture decisions

### 4.1 Backend layering

```
routes/   -> thin: parse, validate, call service, map Result to HTTP
services/ -> business logic. Calls models and other services. Returns Result<T,E>
models/   -> thin data-access on top of Prisma. One file per aggregate.
config/   -> env, prisma client, logger
middleware/ -> auth, validateRequest, errorHandler, rateLimiter
utils/    -> email (dev simulator), logger, money, token
```

### 4.2 Errors

```ts
class AppError extends Error {
  constructor(
    public readonly code: string,        // e.g. 'PRODUCT_NOT_FOUND'
    public readonly httpStatus: number,  // 400, 404, 409, 500
    message: string,
    public readonly details?: unknown
  ) { super(message); this.name = 'AppError'; }
}
```

Routes and services `throw` `AppError`s. A single `errorHandler` middleware at
the app boundary converts them into a uniform JSON shape:

```json
{ "error": { "code": "PRODUCT_NOT_FOUND", "message": "Product not found" } }
```

In production the `details` field is dropped. The stack trace is sent to the
logger only.

### 4.3 Result vs throw for expected business errors

We keep `throw new AppError(...)` at the service boundary because it composes
cleanly with async/await and avoids wrapping every controller call. We reserve
`Result<T, E>` for cases where the caller might *legitimately ignore* the
error inline (a future-proofing; not used in the first cut of the refactor
unless we find a place where it pays for itself).

### 4.4 Service interface sketch

```ts
export interface ProductService {
  list(opts: ListProductsOptions): Promise<{ products: Product[]; total: number; page: number; pages: number }>;
  byId(id: string): Promise<Product>;
  categories(): Promise<string[]>;
  create(input: CreateProductInput, actor: ActorContext): Promise<Product>;
  update(id: string, input: UpdateProductInput, actor: ActorContext): Promise<Product>;
  remove(id: string, actor: ActorContext): Promise<void>;
}
```

Services receive an `ActorContext` (`{ userId, isAdmin, correlationId }`) so
audit logs can attribute actions without leaking identity into business
methods.

### 4.5 Payment provider abstraction

```ts
export interface PaymentProvider {
  createIntent(input: CreateIntentInput): Promise<PaymentIntent>;
  retrieve(id: string): Promise<PaymentIntent>;
}
```

Two implementations:

- `MockPaymentProvider` (default unless `STRIPE_SECRET_KEY` is set): generates
  `pi_*` ids, simulates an immediate `succeeded` after a configurable delay,
  validates amounts.
- `StripePaymentProvider` (only wired in code, not enabled in this pass):
  plugs into the existing `STRIPE_SECRET_KEY` env. Disabled until keys exist.

The order `confirmPayment` flow only trusts a `succeeded` status from the
provider, regardless of which implementation is active.

### 4.6 Caching

- Key namespace: `cache:product:list:<sha1(opts)>`,
  `cache:product:categories`, `cache:product:<id>`.
- TTL: 60s by default, configurable per-endpoint.
- Driver: abstract `Cache` interface. Two implementations:
  - `InMemoryCache` (lru) — used when `REDIS_URL` is unset.
  - `RedisCache` — used when `REDIS_URL` is set.
- Invalidations: on product `create/update/remove`, we drop the matching
  list/category keys. Idempotent.

### 4.7 Database

- Dev: SQLite via `DATABASE_URL=file:./dev.db`. Same as today.
- Prod (docker-compose): `postgres:16-alpine` service, healthcheck, persistent
  volume `db-data-pg`. App's `DATABASE_URL` switches via env.
- Committed `schema.prisma` keeps `provider = "sqlite"` for local dev (zero config).
- We create `prisma/schema.postgres.prisma` — mirrors all models with
  `provider = "postgresql"`. Both schemas are manually kept in sync by CI
  (a diff check on the model portion).
- docker-compose adds a `postgres:16-alpine` service; the backend's
  `DATABASE_URL` in production targets the postgres container.
- Script `npm run db:push:prod` runs `prisma db push --schema=prisma/schema.postgres.prisma`.
- Dev workflow unchanged: `npm run db:push` uses the default sqlite schema.

### 4.8 Frontend styling

- `frontend/src/styles/tokens.css` — CSS custom properties (colors, type,
  spacing, radius, shadow, breakpoints) — single source of truth.
- Per-component `*.module.css` next to each `*.tsx`.
- A small `<Button>`, `<Input>`, `<Select>` — primitives, not full UI library.
- `<Toast>` and `<Skeleton>` components (Skeletons are CSS-only).
- Inline styles only when truly dynamic (e.g. computed transform) and with a
  code comment explaining why.
- No Tailwind, no styled-components. We deliberately stay with Vite's built-in
  CSS Modules support.

### 4.9 Frontend data fetching

- We replace inline `axios.get('/api/...')` in pages with custom hooks:
  `useProducts`, `useProduct(id)`, `useCategories`, `useOrders`, `useOrder(id)`,
  `useCreateOrder`, `useSession`.
- Each hook encapsulates cache key, request, error normalization, and exposes
  `{ data, isLoading, error, mutate }` so we can migrate to TanStack Query
  later without rewriting pages.
- A `<Toast>` provider surfaces validation errors and 5xx errors uniformly.

## 5. Quality bar

- `npm run lint` passes with the strict config (no `eslint-disable` in new code).
- `npm run test` passes with the new integration suite.
- `npm run build` succeeds for backend and frontend.
- All API responses in 500 paths use the new envelope.
- No `console.log` in code under `src/`. Only `logger.*`.
- No emojis in non-UI strings (verify with a small grep script in CI).
- No `any` from new code; existing `any`s get a focused fix in B1.

## 6. Phasing

The refactor is split into six blocks. Each block ends with verification:
lint, typecheck, the relevant test suite, and a smoke run if the block
touches a deployed path.

| Block | Title | Output |
| --- | --- | --- |
| B0 | Foundations | `.gitignore` fix, ESLint strict config, tsconfig tweaks, dev.db removed from repo |
| B1 | Backend service layer + error handling | `services/`, `AppError`, `errorHandler`, routes delegate to services, ESLint clean |
| B2 | Backend integration tests | supertest + isolated Prisma per test |
| B3 | Stripe sim | `PaymentProvider`, mock + skeleton of stripe, checkout flow end-to-end |
| B4 | Postgres | docker-compose service + env-driven prod path + migration smoke |
| B5 | Frontend styling + UX | tokens.css, CSS Modules per component, Skeleton + Toast, hooks for API |
| B6 | Redis cache | `Cache` interface + impls + invalidation |

Each block is delivered with: code, docs note in `docs/superpowers/specs/`,
verification commands, and a short changelog entry in the conversation
summary. No commits happen without explicit user approval.

## 7. Risks and mitigations

- **Stripe simulator divergence** — risk: a future real-Stripe integration
  ships and the simulator contract is different. Mitigation: `PaymentProvider`
  interface is the contract; both implementations conform.
- **Cache invalidation bugs** — risk: stale products listed. Mitigation:
  explicit delete-on-mutation pattern + integration test that mutates then
  re-reads.
- **Postgres migration drift** — risk: SQLite prisma migrations don't apply
  clean on Postgres. Mitigation: documented swap path and a CI smoke that
  applies migrations to a temporary Postgres container.
- **CSS Modules file churn** — risk: too many small files for a small app.
  Mitigation: only create a `.module.css` when a component has more than
  ~10 lines of CSS; cheaper styles can live next to each other in
  `tokens.css`-driven utility classes.
- **Backend service rewrite scope creep** — risk: turning models into
  services touches every route. Mitigation: per-route smoke check on each
  B1 milestone; if any route breaks, freeze and ask the user.

## 8. Acceptance

The refactor is "done" when:

- README debts 1-6 each map to a concrete PR-level diff (or working-tree diff
  in our no-commit perm mode).
- New `npm run verify` script (lint + typecheck + test + build) passes in
  one shot.
- Every code path that touches payments or cache has at least one test.
- The 6-block summary in the conversation references every changed folder
  with one-line descriptions.
