# AGENTS.md — student-api

Context for AI coding agents (OpenCode, Claude, Windsurf). Read this before editing.
The step-by-step build philosophy lives in WORKFLOW.md; this file is rules + facts.

## Project

Express 5 + PostgreSQL (Prisma 7, driver adapter `@prisma/adapter-pg`) + Redis + JWT.
ESM everywhere (`"type": "module"`) — always use `import` with explicit `.js` extensions.

## Commands

- Dev: `npm run dev` (nodemon; `predev` runs `prisma generate`)
- Test: `npm test` (vitest + supertest) — currently hits the REAL dev DB; say so before running
- Migrate: `npx prisma migrate dev --name <change>` — ask before creating migrations
- Prisma client regenerates to `src/generated/prisma/` (gitignored — never edit it)

## Architecture (layered — keep it this way)

```
routes/      path + middleware chain only
controllers/ parse req, call service, shape res. No business logic, no prisma.
services/    all logic + prisma calls. No req/res objects.
middleware/  auth, permissions, validation, rate limit, errors, request logging
config/      env.js (fail-fast validation), database.js (pg pool), prisma.js (globalThis singleton), redis.js
errors/      BaseError subclasses — throw these, never res.status() from services
logger/      pino — use logger.info/error, never console.log (except server.js boot msg)
```

## Hard rules

1. **Validation**: zod middleware must write back parsed data — `req.body = result.data`
   before `next()`. (Known bug: current middlewares validate but don't write back.)
2. **Not-found**: `findUnique` → `if (!result) throw new NotFoundError(...)`.
   `update`/`delete` → try/catch Prisma `P2025` → NotFoundError. Courses service is
   missing this (bug — it returns 500).
3. **Duplicates**: never "findFirst then create" — use `@unique` + catch `P2002`.
4. **Transactions**: multi-write operations use `prisma.$transaction`; helper services
   accept `tx = prisma` as last param (see studentlog.service.js).
5. **Cache**: reads use cache-aside (`student:{id}`, EX 3600); EVERY write must
   `redisClient.del` the key. Refresh tokens live in Redis (30d TTL).
6. **Auth**: JWT payload is `{id, role}` only — don't read other fields off req.user.
7. **Errors**: everything goes through `errorHandler`; never swallow errors, never
   throw inside event listeners (see redis.js).
8. **Response shape**: `{ status: "success", data, meta? }` — match existing controllers.
9. **Secrets**: never read process.env directly outside `config/env.js`; never commit `.env`.
10. Small diffs. One slice per task. Don't add dependencies without asking.

## Known issues (fix-list, in priority order)

- [ ] validation middlewares don't write `result.data` back to req.body
- [ ] course.service update/delete: dead `if (!result)` checks; P2025 → 500
- [ ] no 404 route handler in app.js; helmet + requestLogger installed but never registered
- [ ] updateStudent is PUT-in-disguise (schema requires all fields on PATCH)
- [ ] refresh token stored as double-stringified JSON under key `user:{id}` (should be raw string under `refresh:{id}`)
- [ ] authenticateRefresh lacks try/catch → expired refresh token = 500 not 401
- [ ] tests depend on live DB/Redis + a real seeded user
- [ ] no graceful shutdown (SIGTERM → pool.end, redis.quit)
- [ ] sql/schema.sql is a scratch file with invalid SQL + plaintext passwords — do not treat as source of truth (prisma/migrations is)
