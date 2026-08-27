# ARCHITECTURE.md — student-api deep reference

Companion to `AGENTS.md` (concise rules) and `WORKFLOW.md` (build order). This file is the **sophisticated build** reference — layer-by-layer templates, transaction/cache/auth patterns, and verification gates. Keep `AGENTS.md` short for LLM context; put deep reasoning here.

---

## 1. Stack & Invariants

| Layer | Choice | Why / invariant |
|---|---|---|
| Runtime | Express 5, Node ESM (`"type":"module"`) | Every import **must** have `.js` suffix: `import prisma from "../config/prisma.js"` — even local and generated imports. No `require()`. |
| DB | PostgreSQL + Prisma 7 with `@prisma/adapter-pg` | `src/generated/prisma/` is **output** (gitignored). Source of truth is `prisma/schema.prisma` + `prisma/migrations/`. Never edit generated. `prisma.config.ts` sets `datasource.url = env("DATABASE_URL")` but `src/config/env.js` switches to `DATABASE_URL_TEST` when `NODE_ENV=test`. |
| Cache | Redis `redis@6` | Dev `0`, test `1` (`REDIS_URL_TEST=redis://localhost:6379/1`). `createClient({url: config.redis.url})`. `redis.on('error')` **must not throw** — log only, client reconnects (`src/config/redis.js:13`). |
| Auth | `jsonwebtoken` + `bcrypt` | Access `1h` (`createJWT`), refresh `30d` (`createRefreshJWT`) in `src/utils/jwt.js`. Payload is **only** `{id, role}` — never add `email/name` to token. |
| Validation | `zod@4` | `safeParse` → `throw ValidationError` → `req.body = result.data` before `next()` (applies `.trim()` and strips unknown keys). PATCH schemas use `.partial()`. |
| Logging | `pino` + `pino-pretty` | 3 transports in `src/logger/logger.js`: console (colored, level `info`/`error` in prod), `logs/app.log` (pretty, no color, `info+`), `logs/error.log` (`error` only). Use `logger.info/error/warn` — never `console.log` except `server.js` boot line. `src/logger/logs/` is stale — ignore. |
| Docs | `swagger-ui-express` | `app.js:37` mounts `swaggerUi.serve + swaggerUi.setup(spec, {persistAuthorization, customJsStr: autoLogin hemil2@gmail.com/123456})`. Spec is `src/docs/openapi.js` assembly (never inline). |
| Tests | `vitest@4` + `supertest` | `vitest.config.js` injects `NODE_ENV=test`. Hits **real** `student_api_test` + Redis `1` — warn before `npm test`. Seed via `NODE_ENV=test node scripts/seed-test.js`. Guard is `tests/openapi.test.js` (12 checks). |

---

## 2. Folder Structure — What Lives Where (keep it)

```
project/
├── app.js                      # express() → json → swagger → routes → errorHandler (last!)
├── server.js                   # pool.query SELECT NOW → redis.connect → listen; no graceful shutdown yet
├── prisma/
│   ├── schema.prisma           # generator output=../src/generated/prisma, models students/courses/student_logs/users
│   └── migrations/             # source of truth — ask before migrate
├── src/
│   ├── config/
│   │   ├── env.js              # dotenv + fail-fast checkConfig(); ONLY file that reads process.env
│   │   ├── prisma.js           # Pool + PrismaPg adapter + globalThis singleton (nodemon-safe)
│   │   ├── database.js         # raw pg Pool from config.db.* (separate from Prisma)
│   │   └── redis.js            # createClient + connect/error/end listeners
│   ├── routes/                 # path + middleware chain ONLY (no logic)
│   │   ├── student.route.js    # GET/POST / + GET/PATCH/DELETE /:id + auth/permission/validation
│   │   ├── course.route.js     # same shape, course:* permissions
│   │   └── user.route.js       # register/login/make-admin/refresh + per-route rate limiters
│   ├── controllers/            # parse req, call service, shape res — no prisma
│   │   ├── student.controller.js  # isNaN guard → 400 {status:"error"}; success {status:"success",data,meta}
│   │   ├── course.controller.js   # same guards but response shapes inconsistent (message+data vs direct)
│   │   └── user.controller.js     # register 201 raw user, login 200 {token,refresh_token,user}, refresh 200
│   ├── services/               # all logic + prisma, throw BaseError subclasses, no req/res
│   │   ├── student.service.js     # getAll (Promise.all findMany+count), getById (cache-aside), create/update/delete (tx + del)
│   │   ├── course.service.js      # BUG: update/delete dead if(!result) — needs P2025 catch
│   │   ├── user.service.js        # register/login/grantAdmin/refreshToken (verify→redis get→mismatch→rotate)
│   │   └── studentlog.service.js  # createStudentLog(id,action, tx=prisma) — default param = works inside/outside tx
│   ├── middleware/
│   │   ├── auth.middleware.js        # authenticate (Bearer verify → req.user), authenticateRefresh (body refresh_token)
│   │   ├── authorize.middleware.js   # authorize([roles]) — superadmin wildcard later via permission layer
│   │   ├── permission.middleware.js  # requirePermission("student:read") map user/admin/superadmin:["*"]
│   │   ├── student.validation.js     # z 3-50 trim, 16-100, .partial() for PATCH, req.body=result.data
│   │   ├── course.validation.js      # z 3-100 trim
│   │   ├── user.validation.js        # z name/email/password
│   │   ├── rateLimit.middleware.js   # express-rate-limit 4 limiters → TooManyRequestsError
│   │   ├── error.middleware.js       # central handler {statusCode,status,message,isOperational,stack}
│   │   └── requestlogger.js          # res.on finish logger.info {method,url,status,duration} — not yet app.use()'d
│   ├── errors/                 # BaseError → NotFound 404, Validation 400, Conflict 409, Unauthorized 401, Forbidden 403, TooMany 429
│   ├── logger/logger.js
│   ├── utils/jwt.js            # createJWT 1h, createRefreshJWT 30d, verifyRefreshJWT
│   ├── docs/
│   │   ├── openapi.js          # ASSEMBLY ONLY — imports + spreads (see §8)
│   │   ├── paths/{students,courses,users}.js  # 2+2+4 paths, 14 ops
│   │   └── schemas/{students,courses,users,common}.js # 5+4+6+2 =17 schemas
│   └── generated/prisma/       # never edit
├── tests/
│   ├── app.test.js             # GET / 200 {message}
│   ├── student.test.js         # beforeAll redis+login+fixtures, afterAll cleanup; 401/403/404/400 + CRUD
│   ├── user.test.js            # login 200/401, make-admin 400, refresh 401, rateLimit 429
│   ├── permission.test.js      # unit mocks, 6 cases including req.user missing
│   └── openapi.test.js         # 12 guard — version/paths/schemas/bearerAuth/operationId + GET /api-docs 200
├── scripts/seed-test.js        # deleteMany logs→students→courses→users → create hemil2@gmail.com/123456
├── sql/schema.sql              # SCRATCH — invalid SQL + plaintext — never source of truth
└── logs/app.log, logs/error.log
```

**Layered flow (one direction only):**
```
HTTP → Route middleware chain (auth → authorize/permission → validation → rateLimit)
     → Controller (parse req.query/body/params, validate isNaN, call Service, shape response)
     → Service (prisma/redis, throw BaseError, no req/res)
     → prisma/redis
     ← Controller shapes {status:"success",data,meta}
     ← errorHandler (app.js:54) shapes {status:"fail"|"error",statusCode,message}
```

---

## 3. Config Layer — Fail-Fast & Singletons

### 3.1 `src/config/env.js:1`
```js
dotenv.config();
const config = {
  port: Number(process.env.PORT)||3000,
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  databaseUrl: process.env.NODE_ENV==="test" ? process.env.DATABASE_URL_TEST : process.env.DATABASE_URL,
  redis: { url: process.env.NODE_ENV==="test" ? process.env.REDIS_URL_TEST : process.env.REDIS_URL },
  db: { host: process.env.DB_HOST, port: process.env.DB_PORT, name: process.env.DB_NAME, ... }
};
function checkConfig(){ if(!jwtSecret) missing.push("JWT_SECRET"); ... if(missing.length) throw Error(...) }
checkConfig();
```
- **Rule:** Only this file touches `process.env`. All other files `import config from "./env.js"`.
- Test isolation: `DATABASE_URL_TEST` + `REDIS_URL_TEST` (`.../6379/1`). Never run tests against dev DB.
- Never commit `.env` — provide `.env.example` for new clones.

### 3.2 `src/config/prisma.js:1` — Prisma 7 adapter + singleton
```js
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
const pool = new Pool({ connectionString: config.databaseUrl });
const adapter = new PrismaPg(pool);
if(!globalThis.prisma) globalThis.prisma = new PrismaClient({ adapter });
export default globalThis.prisma;
```
- `globalThis` prevents `Too many clients` when `nodemon` reloads. Never `new PrismaClient()` per request.

### 3.3 `src/config/redis.js:1` — log-only error
```js
redisClient.on("error", (err)=> logger.error(`Redis client error ${err}`)); // never throw
```
Throwing inside event listener becomes unhandled exception. Redis client reconnects internally.

### 3.4 `src/config/database.js:1` — raw Pool
Separate from Prisma pool, used only by `server.js` health check `pool.query("SELECT NOW()")`. Keep both pools but don't mix them.

---

## 4. Routes — Path + Middleware Chain Only

```js
// src/routes/student.route.js (template)
import { authenticate } from "../middleware/auth.middleware.js";
import { requirePermission } from "../middleware/permission.middleware.js";
import { validateStudent } from "../middleware/student.validation.js";

router.get("/", authenticate, requirePermission("student:read"), studentController.getALLStudents);
router.get("/:id", authenticate, requirePermission("student:read"), studentController.getStudentById);
router.post("/", authenticate, requirePermission("student:create"), validateStudent, studentController.createStudent);
router.patch("/:id", authenticate, requirePermission("student:update"), validateStudent, studentController.updateStudent);
router.delete("/:id", authenticate, requirePermission("student:delete"), studentController.deleteStudent);
```
- `course.route.js` mirrors with `course:*` permissions + `validateCourse`.
- `user.route.js`: `POST /register (registerLimiter, validateUser)`, `POST /login (loginLimiter)`, `PUT /make-admin/:id (authenticate, authorize(["admin","superadmin"]), adminLimiter)`, `POST /auth/refresh (refreshLimiter, authenticateRefresh)`.
- **Never** put logic in routes — if a route file exceeds ~30 lines, you've put logic in the wrong layer.

---

## 5. Controllers — Parse, Guard, Shape

```js
// src/controllers/student.controller.js (pattern)
export async function getStudentById(req,res,next){
  const id = Number(req.params.id);
  if(isNaN(id)) return res.status(400).json({ status:"error", message:"Invalid student ID" });
  try { const data = await getStudentByIdService(id); res.status(200).json({ status:"success", data }); }
  catch(err){ next(err); }
}
export async function getALLStudents(req,res,next){
  const page = parseInt(req.query.page)||1, limit = Math.min(parseInt(req.query.limit)||10,100);
  if(page<1||limit<1) return res.status(400).json({status:"error",message:"..."});
  const {data,meta} = await getAllStudentsService(page,limit,courseId,orderBy,search);
  res.status(200).json({ status:"success", data, meta });
}
```
- **Guards:** Every `:id` route does `isNaN` → `400 {status:"error"}` **before** calling service (controller-direct shape, not via `errorHandler`). See `student.controller.js`, `course.controller.js`, `user.controller.js:grantAdminAccess`.
- **Success shape:** `{status:"success", data, meta?}` is canonical. `course.controller` currently returns raw `result` or `{message,data}` — keep but prefer success shape on new code.
- **Never** `import prisma` in controllers.

---

## 6. Services — All Logic, Throw BaseError

### 6.1 `src/services/student.service.js` — reference implementation
```js
export async function getAllStudents(page,limit,courseId,orderBy,search){
  const where={};
  if(courseId!==undefined) where.course_id=courseId;
  if(search?.trim()) where.name={ contains: search.trim(), mode:"insensitive" };
  const [data,totalRecords] = await Promise.all([
    prisma.students.findMany({ where, skip:(page-1)*limit, take:limit, orderBy, include:{ courses:true } }),
    prisma.students.count({ where })
  ]);
  return { data, meta:{ page,limit,totalRecords,totalPages:Math.ceil(totalRecords/limit) } };
}
export async function getStudentById(id){
  const cached = await redisClient.get(`student:${id}`); if(cached) return JSON.parse(cached);
  const result = await prisma.students.findUnique({ where:{id}, include:{ courses:true } });
  if(!result) throw new NotFoundError("Student not found");
  await redisClient.set(`student:${id}`, JSON.stringify(result), {EX:3600});
  return result;
}
export async function createStudent(student){
  // TODO: replace findFirst with @unique+P2002 (race). Currently:
  if(await prisma.students.findFirst({where:{name:student.name,age:student.age,course_id:student.course_id}}))
    throw new ConflictError("Student already exists");
  return prisma.$transaction(async tx=>{ const s=await tx.students.create({data:student}); await createStudentLog(s.id,"Student created",tx); return s; });
}
export async function updateStudent(id,data){
  try {
    const result = await prisma.$transaction(async tx=>{ const u=await tx.students.update({where:{id},data}); await createStudentLog(u.id,"Student updated",tx); return u; });
    await redisClient.del(`student:${id}`);
    return result;
  } catch(e){ if(e instanceof Prisma.PrismaClientKnownRequestError && e.code==='P2025') throw new NotFoundError("Student not found"); throw e; }
}
```
Key rules demonstrated:
- `findUnique` → `if(!result) throw NotFoundError` (correct).
- `update/delete` → `try/catch P2025` (correct). Never `if(!result)` after them.
- `$transaction` with `tx` param; helper `createStudentLog(id,action, tx=prisma)` defaults to global.
- Cache-aside + `del` on write.
- `where.name.contains` with `trim()` and `mode:"insensitive"` for search.
- `@@index([course_id])` in `schema.prisma:26` supports `where.course_id`.

### 6.2 `src/services/course.service.js:6` — current bugs
```js
export async function updateCourse(id,data){
  const result = await prisma.courses.update({ where:{id}, data:{name:data.name} });
  if(!result) throw new NotFoundError(...); // DEAD CODE — update throws P2025, never returns null
}
```
Fix when touching: wrap in `try/catch`, check `e.code==='P2025'` → `NotFoundError`, remove `if(!result)`. Same for `deleteCourse:50`. Also duplicate check `findFirst` → prefer `@unique + P2002`.

### 6.3 `src/services/user.service.js:10` — auth flows
```js
export async function loginUser(email,password){
  const user = await prisma.users.findUnique({ where:{email}, select:{id,email,password,name,role} });
  if(!user || !await bcrypt.compare(password,user.password)) throw new UnauthorizedError("Invalid email or password");
  const token = createJWT({id:user.id,role:user.role}); // 1h
  const refresh_token = createRefreshJWT({id:user.id,role:user.role}); // 30d
  await redisClient.set(`user:${user.id}`, JSON.stringify(refresh_token), {EX:30*24*60*60});
  return { token, refresh_token, user:{id:user.id,name:user.name,email:user.email,role:user.role} };
}
export async function refreshToken(userId,incoming){
  const decoded = verifyRefreshJWT(incoming);
  const stored = await redisClient.get(`user:${userId}`);
  if(!stored) throw new UnauthorizedError("Refresh token not found — please log in again");
  if(JSON.parse(stored) !== incoming) throw new UnauthorizedError("Refresh token mismatch — please log in again");
  const newAccess = createJWT({id:decoded.id,role:decoded.role});
  const newRefresh = createRefreshJWT({id:decoded.id,role:decoded.role});
  await redisClient.set(`user:${userId}`, JSON.stringify(newRefresh), {EX:30*24*60*60});
  return { token:newAccess, refresh_token:newRefresh };
}
```
- `registerUser` uses `findUnique` email → `Conflict`, `bcrypt.hash 10`, `select` excludes password.
- `grantAdminAccess` checks `!user → NotFound`, `role==="admin" → Conflict`, else `update role:"admin"`.
- **Tech debt:** `JSON.stringify(token)` double-stringifies (token is already string) and key `user:{id}` collides with cache namespace — should be `refresh:{id}` and raw string. Fix when refactoring, but keep comparison `JSON.parse` for now.

### 6.4 `src/services/studentlog.service.js:4` — transaction-aware helper
```js
export async function createStudentLog(studentId,action, tx=prisma){
  return tx.student_logs.create({ data:{ student_id:studentId, action } });
}
```
Default `tx=prisma` lets it work both inside `$transaction` and standalone. Every multi-write must use this pattern.

---

## 7. Middleware

### 7.1 Auth — `src/middleware/auth.middleware.js:`
```js
export function authenticate(req,res,next){
  const token = req.headers.authorization?.split(" ")[1];
  if(!token) throw new UnauthorizedError("No token provided");
  const decoded = jwt.verify(token, config.jwtSecret); // payload {id,role}
  req.user = { id: decoded.id, role: decoded.role }; // ONLY id+role
  next();
}
export function authenticateRefresh(req,res,next){
  try { req.user = verifyRefreshJWT(req.body.refresh_token); next(); }
  catch { next(new UnauthorizedError("Invalid or expired refresh token")); } // must catch → 401 not 500
}
```
Never read `req.user.email/name` — token doesn't contain them (past bug logged `decoded.email` as `undefined`).

### 7.2 Authorization — two layers
- `src/middleware/authorize.middleware.js:` `authorize(["admin","superadmin"])` — simple role list, used for `PUT /users/make-admin/:id`.
- `src/middleware/permission.middleware.js:` `requirePermission("student:read")` with map:
  ```js
  { user:["student:read","course:read"], admin:["student:create","student:read","student:update","student:delete","course:create","course:read","course:update","course:delete"], superadmin:["*"] }
  ```
  Checks `permissions[req.user?.role]` (optional chaining avoids `TypeError` when `req.user` missing — fixed in `permission.test.js:66`), `*` → allow, else `ForbiddenError`.

### 7.3 Validation — `*.validation.js`
```js
const studentSchema = z.object({ name:z.string().min(3).max(50).trim(), age:z.number().int().min(16).max(100), course_id:z.number().int() });
const studentUpdateSchema = studentSchema.partial();
export function validateStudent(req,res,next){
  const schema = req.method==="PATCH" ? studentUpdateSchema : studentSchema;
  const result = schema.safeParse(req.body);
  if(!result.success) throw new ValidationError(result.error.issues);
  req.body = result.data; // CRITICAL: write back to apply trim/strip
  next();
}
```
Applies to `student`, `course` (`name 3-100 trim`), `user` (`name/email/password`). Forgetting `req.body = result.data` silently bypasses trimming.

### 7.4 Rate Limit — `src/middleware/rateLimit.middleware.js`
```js
registerLimiter: 5/15min, loginLimiter: 10/15min, refreshLimiter: 5/15min, adminLimiter: 5/hour
handler: (req,res,next)=> next(new TooManyRequestsError("Too many requests from this IP, please try again later"))
```
So errors stay `{status:"fail"}` via handler, not plain text.

### 7.5 Other — `requestlogger.js` + `error.middleware.js`
- `requestlogger.js`: `res.on("finish",()=> logger.info({method,url,status,duration}))` — currently **not** `app.use()`'d (install but not wired, like `helmet`).
- `error.middleware.js:` `errorHandler(err,req,res,next){ statusCode=err.statusCode||500; status=err.status||"error"; logger.error(err); res.status(statusCode).json({ status, statusCode, message, ...isOperational?details:..., stack: config.nodeEnv==="development"?err.stack:undefined }) }` — always last in `app.js:54`.

---

## 8. Errors — `src/errors/BaseError.js`

```js
class BaseError extends Error {
  constructor(message,statusCode){ super(message); this.statusCode=statusCode; this.status=statusCode>=400&&statusCode<500?"fail":"error"; this.isOperational=true; Error.captureStackTrace(this,this.constructor); }
}
class NotFoundError extends BaseError { constructor(m="Not found"){ super(m,404); } }
class ValidationError extends BaseError { constructor(issues){ super(issues.map(i=>`${i.path.join(".")}: ${i.message}`).join(", "),400); this.issues=issues; } }
class ConflictError extends BaseError { constructor(m){ super(m,409); } }
// + Unauthorized 401, Forbidden 403, TooManyRequests 429, TokenError (separate)
```
- Services **throw** these; controllers **never** `res.status()` for domain errors — let `errorHandler` shape them.
- `ValidationError` formats Zod `issues` into readable message.

---

## 9. Docs Contract — `src/docs/`

### Assembly (never inline)
```js
// src/docs/openapi.js:1-48
import studentPaths from "./paths/students.js";
import coursePaths from "./paths/courses.js";
import userPaths from "./paths/users.js";
import studentSchemas from "./schemas/students.js";
import courseSchemas from "./schemas/courses.js";
import userSchemas from "./schemas/users.js";
import commonSchemas from "./schemas/common.js";
const openapiSpecification = {
  openapi:"3.0.0", info:{title:"Student API",version:"1.0.0"}, servers:[{url:"/"}],
  paths:{ ...studentPaths, ...coursePaths, ...userPaths },
  components:{
    securitySchemes:{ bearerAuth:{ type:"http", scheme:"bearer", bearerFormat:"JWT" } },
    schemas:{ ...studentSchemas, ...courseSchemas, ...userSchemas, ...commonSchemas }
  }
};
export default openapiSpecification;
```
- 17 schemas: `Student, CreateStudentRequest, PaginationMeta, StudentWriteResponse, UpdateStudentRequest, Course, CourseWithStudents, CreateCourseRequest, UpdateCourseRequest, User, RegisterRequest, LoginRequest, LoginResponse, RefreshTokenRequest, RefreshTokenResponse, ApiError, ErrorResponse`
- 8 paths: `/students, /students/{id}, /courses, /courses/{id}, /users/register, /users/login, /users/make-admin/{id}, /users/auth/refresh` (14 operations, 76 `$ref`s, 63 responses, 124 examples)
- Every operation has `tags:["Students"|"Courses"|"Users"]`, `operationId` (`listStudents`, `createStudent`, ... `refreshToken`), `security:[{bearerAuth:[]}]` where auth required, and `$ref` not inline schemas.
- `ApiError` (`{status:"error",message}`) for controller-direct `400 {error, Invalid ID}`; `ErrorResponse` (`{status:"fail",statusCode,message}`) for handler errors; `PATCH 400` uses `oneOf: [ApiError, ErrorResponse]` with `examples: {invalidId, validationFailed}`.
- **Guard:** `tests/openapi.test.js:1` asserts 11 spec checks + `GET /api-docs/ 200 html swagger`. Baseline deep-equal is `C:\Users\hemil\AppData\Local\Temp\opencode\openapi-baseline.json` (outside repo) — deep-equal after any docs change.

---

## 10. Testing — Vitest + Supertest on Real DB

- `vitest.config.js` injects `NODE_ENV=test` so `env.js` picks `DATABASE_URL_TEST` + `REDIS_URL_TEST`.
- `scripts/seed-test.js` is idempotent: `deleteMany student_logs → students → courses → users` then `bcrypt 123456 → create hemil2@gmail.com/123456` (`role:"admin"`). Run `NODE_ENV=test node scripts/seed-test.js` before first test run.
- Tests use `supertest(app)` — **no** `app.listen`, no port.
- `tests/app.test.js`: `GET / 200 {message}`.
- `tests/student.test.js`: `beforeAll: redis.connect + login hemil2 → token + create course+student fixtures (generated IDs)`; `afterAll: deleteMany logs/students/courses + redis.quit`. Cases: `GET /:id 200`, `401 no auth`, `404 999999`, `400 abc Invalid ID`, `403 viewer token (createJWT role:"viewer")`, `PATCH 400 abc`, `PATCH 200 partial age`, `DELETE 400`, `DELETE 200 + verify null`.
- `tests/user.test.js`: `POST /login 200 {token,refresh_token,user}`, `401 wrong pwd`, `PUT make-admin 400 abc`, `POST refresh 401 expired -10s`, `401 missing`, `POST login rateLimit loop → 429`.
- `tests/permission.test.js`: pure unit, mocked `logger`, `runMiddleware(permission,role)` → `ForbiddenError 403` for `viewer/unknown/missing`.
- **Before `npm test`**: warn that it hits real DB. Future: Docker-isolated DB (see Known Issues).

---

## 11. Sophisticated Build Workflow — How to Ship Without Breaking

 Derived from `WORKFLOW.md` + `CHANGES.md` Checkpoint 1-17.

1. **One slice per task** — never mix docs+logic+infra. Example slices: Schema extraction (S0-2), Assembly (S3), Verification (S4), Guard test (S5). Each slice: `baseline → extract → verify deep-equal → tests pass → /api-docs 200 → CHANGES.md`.
2. **Small diffs** — max ~5 files, commit after every green step. `git status` should show only `M` for touched + `??` for new — no surprise `M` in unrelated files.
3. **Deep-equal baseline** — Capture `openapi-baseline.json` outside repo before refactor; after assembly, `node -e "import('./src/docs/openapi.js').then(m=>... deepEqual)"` must be `PASS`.
4. **TDD where contract matters** — Users docs + `grantAdmin isNaN` + `authenticateRefresh try/catch` were all TDD: write failing test → fix → 22→34 tests green.
5. **Copy-paste shape, don't invent** — New resource = copy `student` 4-file shape (service→controller→validation→route) then rename `student→course`. Same `isNaN`, same `P2025`, same `req.body=result.data`.
6. **Fail-fast** — `env.js:checkConfig()` throws on missing secrets at boot, not at first request. `server.js` crashes if `pool.query SELECT NOW` or `redis.connect` fails.
7. **Never add deps without asking** — `helmet` is in `package.json` but not wired; don't wire silently — propose, verify, then merge.

### Verification checklist (run after every slice)
```bash
npm test                          # expect 34/34 (after Checkpoint17) = 22 original + 12 openapi guard
npx vitest run tests/openapi.test.js  # 12/12
node -e "import('./src/docs/openapi.js').then(m=> console.log(Object.keys(m.default.paths).length))" # 8
# then start server and curl
NODE_ENV=test node server.js & curl -s http://localhost:3000/api-docs/ | head # 200 + swagger-ui
```

---

## 12. Known Issues — Fix in Priority Order (link back to AGENTS.md)

| # | File | Issue | Fix |
|---|---|---|---|
| 1 | `course.service.js:55,72` | Dead `if(!result)` after `update/delete` → `500` instead of `404` | Wrap in `try/catch P2025 → NotFoundError`, delete dead check |
| 2 | `app.js:38` | No `404` handler; `helmet` + `requestlogger.js` installed but never `app.use()` | Add `app.use((req,res,next)=> next(new NotFoundError(...)))` before `errorHandler`; register `helmet()` and `requestLogger` |
| 3 | `user.service.js:68,114,123` | `JSON.stringify(token)` double-stringifies under `user:{id}` | Store raw string under `refresh:{id}`; compare raw |
| 4 | `student.service.js:66` | `findFirst` duplicate check race | Add `@unique` on needed fields + catch `P2002 → ConflictError`; keep `findFirst` only as pre-check for nicer message if needed |
| 5 | `tests/` | Live DB/Redis + seeded `hemil2@gmail.com` | Document docker isolation (`docker-compose postgres:5432 + redis:6379/1`) and make `seed-test.js` the only seeder |
| 6 | `server.js` | No graceful shutdown | `process.on('SIGTERM', async()=>{ await pool.end(); await redis.quit(); process.exit(0); })` |
| 7 | `sql/schema.sql` | Scratch, invalid SQL, plaintext passwords | Mark `DO NOT EDIT — prisma/migrations is source of truth`; optionally delete |
| 8 | `src/generated/prisma/` | Occasionally committed by mistake | Keep in `.gitignore`, never `git add -f` |

---

## 13. Anti-Patterns — Never Do This

- `process.env.JWT_SECRET` outside `config/env.js` → breaks test isolation.
- `res.status(404).json(...)` inside a service → bypasses `errorHandler`, loses logging.
- `if(!result)` after `prisma.courses.update()` → dead code, hides `P2025`.
- `await prisma.students.findFirst({...}) then create` without `@unique` → race under concurrency.
- `throw new Error("...")` inside `redis.on('error')` → unhandled exception, crashes process.
- Forgetting `req.body = result.data` in Zod middleware → `.trim()` never applied, extra fields reach DB.
- Editing `src/generated/prisma/*` → overwritten on next `prisma generate`.
- Committing `.env` or `sql/schema.sql` as source of truth.

---

## 14. Deep Links (for agents)

- `AGENTS.md:Hard Rules` — non-negotiable, read every time.
- `WORKFLOW.md:Phase 0-13` — 3 rules behind order, hackathon checklist.
- `CHANGES.md:Checkpoint 1-17` — what changed, why, where to verify.
- Baseline for docs contract: `C:\Users\hemil\AppData\Local\Temp\opencode\openapi-baseline.json`
- Swagger liveness: `app.js:37` `swaggerUi.setup` + `tests/openapi.test.js:63` `GET /api-docs/`

