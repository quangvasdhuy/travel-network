# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Tourist social network. Express REST API (ESM, `src/`) backed by **Couchbase**, plus a separate React/Vite SPA (`client/`). Two independent npm packages — the root `package.json` is the backend only.

## Commands

Backend (repo root):

```powershell
npm run dev              # nodemon on src/server.js (port 3000)
npm start
npm test                 # jest via node --experimental-vm-modules (no test files exist yet)
npm run db:init          # create N1QL indexes + 10 sample destinations (idempotent)
npm run db:seed          # basic seed
npm run db:seed-realistic # 100 curated records; reads src/scripts/cloudinaryUrls.json if present
npm run db:clear         # empty the buckets
npm run db:clear-all     # destructive wipe, prompts for confirmation
npm run images:upload    # upload local images to Cloudinary, writes cloudinaryUrls.json
```

`src/scripts/seedLargeData.js` (100 users / 10k posts / 5k trips) has no npm script — run with `node src/scripts/seedLargeData.js`. Takes 30–60 min.

Frontend (`client/`):

```powershell
npm run dev              # Vite on port 5173
npm run build
npm run lint             # eslint, --max-warnings 0
```

There is no lint or formatter configured for the backend.

Copy `.env.example` → `.env` at the root and `client/.env.example` → `client/.env` before first run. `db:init` requires the four buckets (`travel_users`, `travel_content`, `travel_trips`, `travel_social`) to already exist in Couchbase; the server only warns and marks a bucket unavailable if it is missing, so failures surface later as query errors.

## Backend architecture

`routes/ → services/ → (models/ + utils/queryHelpers.js) → Couchbase`

- **routes/** — Express routers with inline Joi schemas, wrapped in `asyncHandler` from [errorHandler.js](src/middleware/errorHandler.js). Routes own HTTP concerns only: parse `page`/`limit` into `offset`, and emit the response envelope.
- **services/** — all business logic. Each exports named functions *and* a default object listing them; routes import the default. Services signal failures by `throw`ing plain objects `{ statusCode, message, details? }`, not `Error` instances — the global error handler reads `err.statusCode`.
- **models/** — static-only classes (`create`, `getKey`, `validate`, sometimes `toPublicProfile`). No ORM; they just shape plain JSON documents and own the key format.
- **utils/queryHelpers.js** — all N1QL lives here, grouped as `UserQueries`, `TripQueries`, `PostQueries`, `ConnectionQueries`, `DestinationQueries`. Add new queries here rather than inlining N1QL in a service.
- **config/database.js** — singleton `DatabaseConnection`; `getBucket('users'|'content'|'trips'|'social')` returns `{ bucket, defaultCollection, scope }`, `getCluster()` for N1QL.

### Data model

Four buckets, documents discriminated by a `type` field, default scope/collection only:

| Bucket | Types | Key pattern |
|---|---|---|
| `travel_users` | `user` | `user::{uuid}` |
| `travel_content` | `post` | `post::{uuid}` |
| `travel_trips` | `trip`, `destination` | `trip::{uuid}`, `destination::{countryCode}::{slug}` |
| `travel_social` | `connection` | `connection::{followerId}::{followingId}` |

Gotchas that bite:

- **Destinations are the exception**: a destination's `destinationId` (as stored on posts/trips and passed to `destinationService`) is the *full document key*, not a bare UUID. Other entities carry a UUID `id` and get the prefix via `Model.getKey(id)`.
- **N1QL result shape**: `SELECT META().id, p.* FROM bucket p` returns rows that may be nested under the alias. Existing code unwraps with `postDoc.p || postDoc` — match that when adding queries.
- **Denormalization is manual**. Author username/photo are copied onto posts, and counters (`stats.postCount`, `followerCount`, `tripCount`, …) are maintained by explicit `mutateIn` counter ops in the services. Any new write path that creates/deletes content must update the corresponding counters itself.
- Prefer sub-document ops (`collection.mutateIn` + `couchbase.MutateInSpec`) for partial updates; full-document `upsert` is used only where the whole doc is already loaded.
- Index definitions live in [indexManager.js](src/utils/indexManager.js) and are applied by `db:init`. Most are partial indexes (`WHERE type = '…'`), so a new document type without a matching index will fall back to a primary scan.

### Cross-cutting

- **Auth**: `authenticate` / `optionalAuth` / `requireOwnership` in [auth.js](src/middleware/auth.js). `authenticate` re-fetches the user document on every request and populates `req.user` with `{ id, email, username, profile, status }`. Expired tokens return `code: 'TOKEN_EXPIRED'`, which the client interceptor keys off.
- **Response envelope**: success is `{ success: true, data: { … }, message? }` with list endpoints nesting `data.pagination`; errors are `{ success: false, error: { message, statusCode, … } }`. Keep both shapes — the client and its interceptors depend on them.
- **Uploads**: Cloudinary via `multer-storage-cloudinary` ([cloudinary.js](src/config/cloudinary.js)). `uploadProfilePhoto` (single, 5 MB) and `uploadPostMedia` (up to 5 files, 50 MB). `file.path` is already the full CDN URL. The legacy `/uploads` static dir is still served.
- Route files mix English and Vietnamese comments; both are fine.

## Frontend

React 18 + Vite + Tailwind, JSX only. `AuthContext` holds auth state (Zustand is installed but unused). All HTTP goes through [api.js](client/src/services/api.js), which exports one object per domain (`authAPI`, `userAPI`, `tripAPI`, `postAPI`, …) — add endpoints there, not ad-hoc axios calls. Its response interceptor auto-refreshes on 401 via `/api/auth/refresh` and redirects to `/login` when refresh fails; tokens live in `localStorage` as `accessToken`/`refreshToken`. Protected routes render inside `<ProtectedRoute><Layout /></ProtectedRoute>` in [App.jsx](client/src/App.jsx). Errors are surfaced with `react-hot-toast`, styled with the shared Tailwind classes (`.btn`, `.btn-primary`, `.input`, `.card`, `.container-custom`) defined in [index.css](client/src/index.css).

`client/README.md` documents a `/explore` page and an `ExplorePage.jsx` that no longer exist — the backend `/api/discovery/explore` endpoint does exist. Treat that README's route list and roadmap as out of date.
