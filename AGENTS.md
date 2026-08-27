# AGENTS.md — student-api

Context for AI coding agents (OpenCode, Claude, Windsurf). Read this before editing.
For step-by-step construction order see `WORKFLOW.md`. For deep architecture, templates, and sophisticated build patterns see `docs/ARCHITECTURE.md`.

## Project

Express 5 + PostgreSQL (Prisma 7, `@prisma/adapter-pg` driver adapter) + Redis + JWT + Zod + Pino + Swagger.
ESM everywhere (`"type": "module"`) — always `import x from "./y.js"` with explicit `.js` extension, even for Prisma and local files.

## Commands

- Dev: `npm run dev` (nodemon; `predev` runs `prisma generate`)
- Alternative watch: `npm run auto` (`node --watch server.js`)
- Test: `npm test` (vitest + supertest) — hits **real** test DB `student_api_test` + Redis db `1`; warn before running
- Single file: `npx vitest run tests/openapi.test.js` — 12/12 OpenAPI guard
- Seed test DB: `NODE_ENV=test node scripts/seed-test.js` (idempotent, creates `hemil2@gmail.com / 123456`)
- Migrate: `npx prisma migrate dev --name <change>` — ask before creating migrations
- Prisma client regenerates to `src/generated/prisma/` (gitignored — never edit; `prisma.config.ts` drives datasource)

## Folder Structure (keep it)

```
src/
  config/       env.js (fail-fast), database.js (pg Pool), prisma.js (globalThis singleton + adapter), redis.js
  routes/       path + middleware chain only (no logic)
  controllers/  parse req, call service, shape res {status:"success",data,meta?}
  services/     all business logic + prisma calls, throw BaseError subclasses (no req/res)
  middleware/   auth, authorize, permission, validation (zod), rateLimit, error, requestLogger
  errors/       BaseError hierarchy — throw these, never res.status() from services
  logger/       pino (logger.info/error/warn) — never console.log except server.js boot
  utils/        jwt.js (createJWT 1h, createRefreshJWT 30d)
  docs/         openapi.js (assembly) + paths/{students,courses,users}.js + schemas/{students,courses,users,common}.js
  generated/prisma/  output — never edit
prisma/         schema.prisma, migrations/ (source of truth)
tests/          app.test.js, student.test.js, user.test.js, permission.test.js, openapi.test.js (guard)
scripts/        seed-test.js
sql/schema.sql  scratch file — invalid SQL + plaintext passwords; DO NOT treat as source of truth
```

Layered request flow: `Route (middleware chain) → Controller (parse/shape) → Service (logic/prisma) → prisma/redis → Controller shapes {status:"success"} → errorHandler` (always last in `app.js:54`)

## Hard Rules (non-negotiable)

1. **ESM Strict**: `type: module`; every import needs `.js` — `import prisma from "./config/prisma.js"`. No `require()`, no `process.env` outside `config/env.js:1`.
2. **Validation**: Zod `safeParse` → `if (!result.success) throw new ValidationError(result.error.issues)` → **must** `req.body = result.data` before `next()` to apply `.trim()`/strip extras. PATCH uses `.partial()` (`student.validation.js:`, `course.validation.js:`, `user.validation.js:`). Forgetting write-back = silent bypass.
3. **Not-Found**: `findUnique` → `if (!result) throw new NotFoundError(...)` (`student.service.js:55`). `update`/`delete` throw `P2025` — must `try/catch + if (error.code === 'P2025') throw NotFoundError` (`student.service.js:101`). Never `if (!result)` after update/delete (dead code — currently buggy in `course.service.js:55,72`).
4. **Duplicates**: Never `findFirst` then `create` (race) — rely on `@unique` (`courses.name`, `users.email`) + catch `P2002` → `ConflictError`. Current services still use `findFirst` — fix when touching them.
5. **Transactions**: Multi-write → `prisma.$transaction(async (tx) => {...})`. Helpers accept `tx = prisma` default (`studentlog.service.js:4`) so they work inside and outside transactions (`student.service.js:73`).
6. **Cache**: Cache-aside on reads — `redis.get('student:${id}')` → miss → DB → `set EX 3600` (`student.service.js:46,59`). **Every** write must `redisClient.del('student:${id}')` (`student.service.js:97,117`). Refresh tokens: Redis `user:{id}` (should be `refresh:{id}`) stores `JSON.stringify(token)` 30d TTL (`user.service.js:68`); rotate on `POST /users/auth/refresh` and compare with `JSON.parse(stored) !== incoming` (`user.service.js:114`).
7. **Auth**: `Authorization: Bearer <token>` → `authenticate` (`auth.middleware.js:`) `jwt.verify(token, config.jwtSecret)` → `req.user = {id, role}` **only**. Never read `email` etc. from token. `authorize([roles])` + `requirePermission("student:read")` (`permission.middleware.js:`) map `user → [student:read,course:read]`, `admin → full CRUD`, `superadmin → ["*"]`. `authenticateRefresh` must be try/catch → `401` not `500`.
8. **Errors**: Throw `BaseError` subclasses (`NotFoundError 404`, `ValidationError 400`, `ConflictError 409`, `UnauthorizedError 401`, `ForbiddenError 403`, `TooManyRequestsError 429`) — everything via `errorHandler` (`error.middleware.js:`) which logs and returns `{status: "fail"|"error", statusCode, message}`. Never swallow, never `throw` inside `redis.on('error')` (`redis.js:14` — log only, client reconnects).
9. **Response Shape**: Success `{status:"success", data, meta?}` (`student.controller.js:`, `user.controller.js:` has `message` variants — preserve but prefer consistent shape). Errors via handler only.
10. **Secrets & Env**: Only `config/env.js` reads `process.env`; `checkConfig()` fail-fast on missing `JWT_SECRET`, `JWT_REFRESH_SECRET`, `DATABASE_URL(_TEST)`. Never commit `.env`; test isolation via `NODE_ENV=test` → `DATABASE_URL_TEST` + `REDIS_URL_TEST` (`.../6379/1`).
11. **Logger**: `logger.info/error/warn` only; pino writes to console + `logs/app.log` (info+) + `logs/error.log` (error). Ignore `src/logger/logs/` stale folder.
12. **Docs Contract**: `src/docs/openapi.js` is assembly only — `import studentPaths from "./paths/students.js"` etc. + `...studentSchemas` spreads (`openapi.js:1-44`). 17 schemas, 8 paths, 14 ops, 76 `$ref`s guarded by `tests/openapi.test.js:1` (11 spec checks + `GET /api-docs/ 200`). Deep-equal to baseline `C:\Users\hemil\AppData\Local\Temp\opencode\openapi-baseline.json` after any docs change.
13. **Small Diffs**: One slice per task. Don't add dependencies without asking. Commit after every green step.

## Known Issues (fix in priority order — see `docs/ARCHITECTURE.md:Known Issues`)

- [ ] validation write-back already fixed in 3 files but retain rule for all future validators
- [ ] `course.service.js:55,72` dead `if (!result)` — needs `P2025` catch → `NotFoundError`
- [ ] `app.js:38` no 404 handler; `helmet` + `requestlogger.js` installed but never `app.use()`
- [ ] `user.service.js:68,114,123` double-stringified `JSON.stringify(token)` under `user:{id}` → should be raw string under `refresh:{id}`
- [ ] `tests/` depend on live DB/Redis + seeded `hemil2@gmail.com` — needs docker isolation note
- [ ] `server.js:` no graceful shutdown (`SIGTERM → pool.end, redis.quit`)
- [ ] `sql/schema.sql` scratch — never source of truth (prisma/migrations is)
- [ ] `student.service.js:66` `findFirst` duplicate check race → prefer `@unique + P2002` when refactoring
