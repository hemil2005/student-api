# Build Order: student-api (and any Express backend)

This is the order I actually built this project (reconstructed from git history), with the
"why" for each step and the mistakes I made so I don't repeat them. Use it as a checklist
when starting any new backend — especially at a hackathon, where order = speed.

---

## The 3 Rules Behind the Order

1. **Foundation before features.** Config, DB, and error handling come first because every
   feature depends on them. Skipping them means retrofitting 10 files later.
2. **One resource end-to-end, then clone the pattern.** Build `students` fully
   (routes → controller → service → DB), then copy that shape for `courses` and `users`.
3. **Cross-cutting concerns LAST.** Auth, caching, rate limiting wrap around working features.
   Adding them too early means debugging two things at once.

---

## Phase 0 — Setup (30 min, no thinking)

```powershell
mkdir my-api; cd my-api
git init
npm init -y
npm i express
```

- Create `.gitignore` FIRST: `node_modules`, `.env`, `logs`, `src/generated/prisma`.
- `"type": "module"` in package.json (this project uses ESM everywhere — commit to it early).
- First commit: `"scaffold"`. **Commit after every working step from here on.**

## Phase 1 — Config layer (before ANY feature code)

In this exact order:

1. **`src/config/env.js`** — load dotenv, export a `config` object, and **fail fast** if
   required vars are missing (my `checkConfig()` throws on missing JWT secrets / DB URL).
   *Why first: nothing else works without env vars. Failing at boot beats failing at 2am.*
2. **`.env`** — PORT, DATABASE_URL, DB_HOST/PORT/NAME/USER/PASSWORD, JWT_SECRET,
   JWT_REFRESH_SECRET, REDIS_URL. (Never commit it.)
3. **`src/config/database.js`** — the `pg` Pool.
4. **`src/logger/logger.js`** — pino with console + app.log + error.log targets.
   *Gotcha I hit: logs go to project-root `/logs`, not `src/logger/logs` (that stray folder
   is still in my repo — don't copy that mistake).*

## Phase 2 — App skeleton (app.js + server.js)

- **`app.js`**: `express()` → `express.json()` → routes → **errorHandler LAST**.
- **`server.js`**: verify DB (`SELECT NOW()`) → connect Redis → `app.listen`.
  *Why: if DB/Redis are down, crash immediately at startup, not on the first request.*
- **Error classes** (`src/errors/`): `BaseError` (statusCode + isOperational +
  `Error.captureStackTrace`) → `NotFoundError`, `ValidationError`, `UnauthorizedError`,
  `ForbiddenError`, `ConflictError`, `TooManyRequestsError`.
- **`src/middleware/error.middleware.js`**: one central handler reading `err.statusCode`.
  *This must exist before you write routes, or every error becomes an Express HTML page.*

Checkpoint: `GET /` returns JSON. Commit.

## Phase 3 — Database schema + Prisma

1. Design tables on paper first: `students`, `courses`, `student_logs`, later `users`.
2. `npx prisma init` → write `schema.prisma` → `npx prisma migrate dev --name init`.
3. **`src/config/prisma.js`** — the `globalThis.prisma` singleton (prevents exhausting
   connections when nodemon reloads). Uses `@prisma/adapter-pg` (Prisma 7 driver adapter).
4. Add indexes for columns you filter by (I added `@@index([course_id])` later — better
   to think about it at design time).

*My note: the `sql/schema.sql` file is my scratch pad of raw SQL — fine for learning,
but Prisma migrations are the source of truth. Don't keep both as equals.*

## Phase 4 — First resource END-TO-END: students

The pattern (same 4 files per resource, always in this order):

```
service   → pure logic + prisma calls (NO req/res)
controller→ parse input, call service, shape response
validation→ zod schema middleware
route     → wire middleware + controller to a path
```

For students I built: getAll (later + pagination/filter/sort), getById, create, update,
delete. Then tested each with Postman/curl before moving on.

**Lessons burned into this project:**
- `findUnique` returns `null` when missing → check with `if (!result)`.
- `update`/`delete` THROW `P2025` when missing → wrap in try/catch and convert to
  NotFoundError (I did this right for students, forgot for courses — courses still 500s).
- "Check then create" duplicate checks are a race condition — prefer a `@unique`
  constraint + catch Prisma's `P2002`.

Commit. **Now every future resource is a 15-minute copy of this shape.**

## Phase 5 — Clone the pattern: courses

Same 4 files. Relationship: `students.course_id → courses.id` (FK with `@unique` course
name, index on the FK column).

## Phase 6 — Auth (only after 2 resources work)

1. `users` table + migration (email `@unique`, `role` default `"user"`).
2. `bcrypt.hash(password, 10)` on register; **never store plaintext** (my `sql/schema.sql`
   has plaintext seed users — scratch file only, never in real code).
3. `src/utils/jwt.js`: `createJWT` (1h access), `createRefreshJWT` (30d refresh).
4. `POST /users/register`, `POST /users/login` → return both tokens.
5. **`auth.middleware.js`** `authenticate`: read `Bearer` header → `jwt.verify` →
   `req.user = decoded`. 

*Gotcha I hit: I sign tokens with `{id, role}` but logged `decodedToken.email` → logs
`undefined` forever. Keep payload and logging in sync.*

## Phase 7 — Authorization (2 layers, I built both)

- **Role-based** (`authorize.middleware.js`): `authorize(["admin"])` for routes like
  `PUT /users/make-admin/:id`.
- **Permission-based** (`permission.middleware.js`): map `role → permissions[]`
  (`student:read`, `course:delete`, ...), `"*"` for superadmin. Routes declare
  `requirePermission("student:create")`.
- Permission layer is more flexible; role layer is simpler for one-off admin routes.
  Fine to have both — that's what I did.

## Phase 8 — Transactions + audit logs

- `student_logs` table + FK to students with `onDelete: Cascade`.
- The key pattern: `createStudentLog(studentId, action, tx = prisma)` — **defaults to the
  global client but accepts a transaction**. One function works inside AND outside
  transactions.
- Wrap create/update/delete student in `prisma.$transaction(async (tx) => {...})` so the
  student row and its log row commit or roll back together.

## Phase 9 — Redis caching (after features work)

1. `src/config/redis.js` — client + error listener that **logs, never throws** (throwing
   in an event handler = unhandled exception; the client reconnects on its own).
2. Cache-aside on `getStudentById`: check Redis → miss → DB → `set` with `EX: 3600`.
3. **Invalidate on write**: `update`/`delete` → `redisClient.del('student:'+id)`.
   Caching without invalidation = stale-data bugs.

## Phase 10 — Refresh token rotation

- Login stores refresh token in Redis: `user:{id}` → token, TTL 30d.
- `POST /users/auth/refresh` → `authenticateRefresh` middleware → verify JWT → compare
  with Redis copy → rotate both tokens → replace Redis copy.
- Old refresh token instantly becomes useless = revocation for free.
- *Gotcha I left in: I `JSON.stringify` an already-string token (double-quoted). Works,
  but ugly — store the raw string. Also `user:{id}` is a risky key name; `refresh:{id}`
  is collision-proof.*

## Phase 11 — Rate limiting

`express-rate-limit`, different limiters per sensitivity:
register 5/15min, login 10/15min, refresh 5/15min, admin actions 5/hour.
Handler calls `next(new TooManyRequestsError(...))` so errors stay in the standard format.

## Phase 12 — Validation hardening (zod)

Schemas per resource as middleware. **The bug I still have: `safeParse(req.body)` result
is never written back — so `.trim()` never reaches the DB and extra fields pass through.
Fix: `req.body = result.data` before `next()`.**

## Phase 13 — Tests (last, on stable features)

- Vitest + supertest against the real `app` (no need to start the server).
- Connect/disconnect Redis in beforeAll/afterAll.
- *Current weakness: tests hit the real DB with a real user (`hemil2@gmail.com`).
  Next step: a separate test DB (docker postgres) seeded in beforeAll.*

---

## Quick checklist for a NEW project (hackathon mode)

```
[ ] git init + .gitignore + first commit
[ ] env.js with fail-fast check + .env
[ ] logger.js
[ ] errors/ + error.middleware.js
[ ] app.js + server.js (verify DB before listen) → GET / works → COMMIT
[ ] prisma schema + migrate + prisma.js singleton
[ ] Resource #1 end-to-end (service→controller→validation→route) → COMMIT
[ ] Resource #2 same pattern → COMMIT
[ ] users + register/login + bcrypt + JWT
[ ] authenticate middleware on protected routes
[ ] authorize/requirePermission
[ ] transactions where multiple writes must be atomic
[ ] Redis caching on hot reads + invalidation on writes
[ ] rate limiting on auth endpoints
[ ] tests on the flows that must not break
[ ] README + .env.example
```

## If I only remember 5 things

1. Error classes + central error handler BEFORE writing routes.
2. One resource fully working, then copy its 4-file shape.
3. `globalThis.prisma` singleton or nodemon will eat your DB connections.
4. Cache invalidation on every write, or don't cache.
5. Commit after every green step — a working previous step is the best debugger.
