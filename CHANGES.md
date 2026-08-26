# Change Log — student-api

> Single file overwritten after each checkpoint. Concise — lists what changed, why, and where to verify.
> Last updated: 2026-08-27

---

### Checkpoint 10 — Student Schema Refactor (components.schemas)
**Files:** `src/docs/openapi.js`
**Intent:** Stop duplicating Student shapes; introduce reusable schemas with correct nullable semantics.
- Added `components.schemas` inside `openapi.js` (no separate file):
  - `Student` — `required: [id, name, age]` only; `course_id: {nullable:true}` and `courses: {nullable:true}` because `prisma/schema.prisma:21` has `course_id Int?`
  - `CreateStudentRequest` — `required: [name, age, course_id]` (POST validation requires course_id)
  - `PaginationMeta` — `required: [page, limit, totalRecords, totalPages]`
- Replaced inline schemas with `$ref`:
  - `GET /students` 200 → `data: Student[]` + `meta: PaginationMeta`
  - `GET /students/{id}` 200 → `data: Student`
  - `POST /students` requestBody → `$ref: CreateStudentRequest` (example kept alongside schema)
- Intentionally **not** replaced `POST 201 / PATCH 200 / DELETE 200` write responses with `Student` — they return bare `{id,name,age,course_id}` without `courses`; will introduce `StudentWriteResponse` in next iteration.
- Verify: `node -e "import('./src/docs/openapi.js').then(m=>console.log(Object.keys(m.default.components.schemas)))"` + `/api-docs` schemas section.

### Checkpoint 9 — Users Docs + Swagger Auto-Auth + Bug Fixes
**Files:** `src/controllers/user.controller.js`, `src/middleware/auth.middleware.js`, `src/docs/openapi.js`, `app.js`, `tests/user.test.js`
**Fixes (TDD):**
- `grantAdminAccess` — added `isNaN(id) → 400 {error, Invalid user ID}` guard (was 500).
- `authenticateRefresh` — wrapped `verifyRefreshJWT` in try/catch → `401 Invalid or expired refresh token` (was 500, AGENTS #6).
**Docs:** Added `/users/register` (201 raw, 400/409/429), `/users/login` (200 raw token, 401/429), `/users/make-admin/{id}` (200, 400/401/403/404/409/429), `/users/auth/refresh` (200, 401 variants/429) — examples match real raw shapes.
**Swagger:** `app.js` → `swaggerUi.setup(spec, {swaggerOptions:{persistAuthorization:true}, customJsStr:autoLogin})` — auto-calls `POST /users/login` with `hemil2@gmail.com/123456` and `preauthorizeApiKey('bearerAuth')`. Verified via `curl` (9 requests) against `NODE_ENV=test` server — all 200/201 with doc-matching JSON.

### Checkpoint 8 — Full Students Endpoint Docs + PATCH/DELETE Fixes
**Files:** `src/controllers/student.controller.js`, `src/middleware/student.validation.js`, `src/services/student.service.js`, `src/docs/openapi.js`, `tests/student.test.js`
- `updateStudent`/`deleteStudent` — added `isNaN(id) → 400` guards.
- `student.validation.js` — `studentSchema.partial()` for PATCH, `req.body = result.data` write-back (AGENTS #1).
- `deleteStudent` service — removed `createStudentLog` after delete (FK violation → 500 via cascade).
- Docs: Added `POST /students` (201 bare, 409), `PATCH/Delete /students/{id}` to `openapi.js`; fixed `GET /students` example (`data` array + `meta`, `courses` not `course`).

### Checkpoint 7 — Swagger Example Fix
**Files:** `src/docs/openapi.js`
- Fixed `GET /students` example: `data.students → data[]`, `pagination → meta {page,limit,totalRecords,totalPages}`, `course → courses`. Matches `student.service:27 include:{courses:true}` + `controller:44-48`.

### Checkpoint 6 — Redis Isolation
**Files:** `.env`, `src/config/env.js`
- Added `REDIS_URL_TEST=redis://localhost:6379/1`; `env.js` selects `REDIS_URL_TEST` when `NODE_ENV=test`. Verified `db0` (dev keys) vs `db1` (test keys).

### Checkpoint 5 — Test DB Isolation
**Files:** `.env`, `src/config/env.js`, `vitest.config.js` (new), `scripts/seed-test.js` (new), `tests/student.test.js`, `src/config/prisma.js` (via env)
- Created `student_api_test` DB, `DATABASE_URL_TEST`, `vitest.config.js` injects `NODE_ENV=test`.
- `seed-test.js` — idempotent reset + seeded admin `hemil2@gmail.com/123456`.
- Tests now create own `courses`+`students` fixtures with generated IDs (no `GET /students/8` assumption).

### Checkpoint 4 — Permission Unit Tests
**Files:** `tests/permission.test.js` (new), `src/middleware/permission.middleware.js`
- Pure unit tests for `requirePermission` (mocked `logger`, fake `req/next`), 5 cases: user/admin/superadmin allowed, viewer/unknown forbidden.
- Edge case: `req.user` missing → was `TypeError` at `:27`, fixed to `permissions[req.user?.role]` → 403.

### Checkpoint 3 — Test Independence + Rate Limit
**Files:** `tests/student.test.js`, `tests/user.test.js` (was empty → populated)
- Moved token acquisition to `beforeAll`, login tests to `user.test.js`.
- Added `POST /users/login` rate-limit test — loops until `429 {fail, Too many requests...}` (isolated via file-level MemoryStore).

### Checkpoint 2 — 403 RBAC Test
**Files:** `tests/student.test.js`
- Created real `viewer` role user (not in permission map) + `createJWT` token → `403 {fail, Insufficient permissions}` via `permission.middleware:30`.

### Checkpoint 1 — GET /students/:id 404/400 Tests
**Files:** `tests/student.test.js`
- Added `GET /students/999999 → 404 {fail, Student not found}` and `GET /students/abc → 400 {error, Invalid student ID}`.

### How to Verify Any Checkpoint
```bash
npm test                          # 22/22 expected (vitest, hits test DB + redis db1)
NODE_ENV=test node scripts/seed-test.js
NODE_ENV=test node server.js      # then curl /api-docs or endpoints; compare JSON to openapi.js examples
```

### Checkpoint 11 — Slice 1: Student Write Schemas + GET Auth Responses + Tags
**Files:** `src/docs/openapi.js`, `CHANGES.md`
- Added `components.schemas.StudentWriteResponse` (`id,name,age,course_id nullable`) and `UpdateStudentRequest` (`minProperties:1`, all optional) — fixes pitfall C.
- Wired `POST 201`, `PATCH 200`, `DELETE 200` to `StudentWriteResponse`; `PATCH` requestBody to `UpdateStudentRequest`.
- Added missing `401/403` to `GET /students` (pitfall A) and `tags:["Students"]` + `operationId` (`listStudents`, `createStudent`, `getStudentById`, `updateStudent`, `deleteStudent`) to all 5 student operations.
- Fixed `CHANGES.md` stale `check-openapi.mjs` reference.

### Checkpoint 12 — Slice 2: Error Envelope Schemas
**Files:** `src/docs/openapi.js`, `CHANGES.md`
- Added `components.schemas.ApiError` (`{status:"error", message}`) and `ErrorResponse` (`{status:"fail", statusCode, message}`) — fixes pitfall D.
- Wired every error response with a `schema`:
  - `ApiError` for controller-direct `400 {error, Invalid ID}` (GET/PATCH/DELETE by ID, make-admin).
  - `ErrorResponse` for all handler errors: `400` validation, `401`, `403`, `404`, `409`, `429`.
  - `PATCH 400` uses `oneOf: [ApiError, ErrorResponse]` with `examples: {invalidId, validationFailed}` — documents both shapes on one status.
- Users endpoints now also have schemas on `400/401/403/404/409/429` (previously `example`-only or `description`-only).

### Checkpoint 13 — Slice 3: Courses + User Schemas + Servers + Cleanup
**Files:** `src/docs/openapi.js`, `src/controllers/course.controller.js`, `src/middleware/course.validation.js`, `src/middleware/user.validation.js`, `CHANGES.md`
- **Servers:** `http://localhost:3000` → `/` (relative, works behind proxy/any port).
- **Components:** Added `Course`, `CourseWithStudents`, `CreateCourseRequest`, `UpdateCourseRequest`, `User`, `RegisterRequest`, `LoginRequest`, `LoginResponse`, `RefreshTokenRequest`, `RefreshTokenResponse` (17 schemas total).
- **Courses docs:** Added `GET /courses` (Course[]), `GET /courses/{id}` (CourseWithStudents), `POST /courses` (201 message+data), `PATCH /courses/{id}`, `DELETE /courses/{id}` — all with `tags:["Courses"]`, `operationId`, `bearerAuth`, `401/403/404` + `409` + `400 ApiError/ErrorResponse` (including `oneOf` for PATCH).
- **Courses fixes:** Added `isNaN(id) → 400 Invalid course ID` to `getCourseById/updateCourse/deleteCourse`; added `req.body = result.data` to `course.validation.js` and `user.validation.js` (AGENTS #1).
- **Users refactor:** `register/login/refresh` request/response inline schemas → `$ref` (RegisterRequest, LoginRequest, LoginResponse, RefreshTokenRequest, RefreshTokenResponse); added `tags:["Users"]` + `operationId` (`registerUser`, `loginUser`, `grantAdminAccess`, `refreshToken`); removed empty `parameters:[]`; `make-admin` 200 now has schema with `User` ref.
- Verify: `17 schemas`, `/courses` + `/courses/{id}` present, `servers:/`, no empty `parameters:[]`, `22/22` tests pass.

### Current State Snapshot
- Students ✅ `Student` + `StudentWriteResponse` + `PaginationMeta` + error envelopes + tags
- Courses ✅ `Course` + `CourseWithStudents` + `Create/UpdateCourseRequest` + all CRUD + tags
- Users ✅ `User` + `Register/Login/Refresh` schemas + tags (all error responses have schemas)
- Servers ✅ relative `/`
- Errors ✅ `ApiError`/`ErrorResponse` + `oneOf` on dual-shape 400s — generators get typed errors
- Test suite ✅ isolated (Postgres `student_api_test` + Redis db1)
