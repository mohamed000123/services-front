# Service admin dashboard (QuickFix)

React 19 + Vite + Tailwind 4 admin UI for the **Service Management** backend. Uses **Axios** (session cookie + optional Bearer), **React Router**, **Formik + Yup**, and **Socket.io-client** for the live request queue.

## Prerequisites

- Node 18+
- Running API from [`services-back`](../services-back) on the URL set in `.env.development`

## Environment

| Variable | Description |
|----------|-------------|
| `BASE_API_URL` | REST API origin, e.g. `http://localhost:8000` (no trailing slash). |
| `VITE_SOCKET_PATH` | Optional. Socket.io path on the server (default `/socket.io`). |

## Scripts

```bash
npm install
npm run dev      # Vite dev server (default http://localhost:5173)
npm run build
npm run lint
```

## Features

- **Login** — `POST /admin/auth/login` sets httpOnly cookie `sAAt`; non-secret profile cached for route gating.
- **Live monitor** — loads `GET /admin/requests`, merges `request:created`, `request:status_changed`, `request:updated`, `request:deleted` from `/realtime/admin`.
- **Catalog** — CRUD for categories and services via `/admin/catalog/*`.
- **Users** — mobile client directory via `/admin/clients/*`.
- **Realtime** — `RealtimeProvider` + connection badge (Connecting / Live / Offline). No iconography in nav/actions per brief (typography, spacing, color only).

## AI prompting strategy (quality)

1. **Architecture first** — Prompts specified layered backend (controllers → services → Prisma), JWT for admin vs client, and Socket emits only after DB commit; refactors kept that boundary.
2. **Small iterations** — Generate one module (e.g. catalog routes), run `npm run build` / `lint`, then extend; reduced bad merges.
3. **Review checklist** — Verify RBAC paths (`adminGuard` vs `clientGuard`), soft-delete semantics, and Prisma `Decimal` / JSON field shapes before wiring the UI.
4. **UI contract** — Explicitly restated “no icons” and status palette (pending / in-progress / completed / cancelled) in prompts so Tailwind stayed consistent.

## Manual QA (short)

- CORS: `ADMIN_URL` matches Vite origin; login and catalog requests succeed with credentials.
- Socket: with dashboard open, `POST /app/client/requests` (Bearer) adds a row without refresh; badge shows **Live**.
- Status transitions: invalid jumps return **422** from API; UI shows error text on failed PATCH.

## Postman

Import the collection at repo root: [`QuickFix.postman_collection.json`](../QuickFix.postman_collection.json). Set `clientToken` from mobile login JSON; for admin, copy `sAAt=...` from browser devtools into `adminCookie` or rely on Postman cookie jar after Admin → Login.
