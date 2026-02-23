# TradeLearn Pro – API Documentation

Base URL: `http://localhost:4000/api/v1` (or your deployed URL).

All authenticated endpoints require header: `Authorization: Bearer <accessToken>`.

---

## Auth

| Method | Endpoint                  | Description                                                    |
| ------ | ------------------------- | -------------------------------------------------------------- |
| POST   | `/auth/login`            | **Common login for all roles** (body: email, password, role?) - role is optional: ADMIN, SUBADMIN, USER. If not provided, uses user's actual role. |
| POST   | `/auth/admin/login`     | Admin login (Legacy - prefer `/auth/login`)                    |
| POST   | `/auth/subadmin/login`  | Subadmin login (Legacy - prefer `/auth/login`)                 |
| POST   | `/auth/user/login`      | User login (Legacy - prefer `/auth/login`)                     |
| POST   | `/auth/register`        | User registration (body: email, password, name, referralCode?) |
| POST   | `/auth/refresh`         | Refresh tokens (body: refreshToken)                            |
| POST   | `/auth/logout`          | Logout (body: refreshToken)                                    |
| POST   | `/auth/change-password` | Change password (body: currentPassword, newPassword)           |
| POST   | `/auth/forgot-password` | Forgot password (body: email)                                  |
| POST   | `/auth/reset-password`  | Reset password (body: token, newPassword)                      |

---

## Admin – User Management

| Method | Endpoint                       | Description                                                    |
| ------ | ------------------------------ | -------------------------------------------------------------- |
| GET    | `/users`                     | List users (query: role?, search?, page?, limit?)              |
| GET    | `/users/:id`                 | Get user                                                       |
| POST   | `/users`                     | Create user (body: email, password, name, role, referralCode?) |
| PATCH  | `/users/:id`                 | Update user                                                    |
| DELETE | `/users/:id`                 | Delete user                                                    |
| POST   | `/users/:id/block`           | Block user                                                     |
| POST   | `/users/:id/unblock`         | Unblock user                                                   |
| GET    | `/users/:id/activity`        | User activity report                                           |
| GET    | `/users/:id/trading-report`  | User trading report                                            |
| GET    | `/users/:id/course-progress` | User course progress                                           |

---

## Admin / Subadmin – Courses

| Method | Endpoint                                 | Description                                                                        |
| ------ | ---------------------------------------- | ---------------------------------------------------------------------------------- |
| GET    | `/courses`                             | List courses (Subadmin sees own only)                                              |
| POST   | `/courses`                             | Create course                                                                      |
| GET    | `/courses/:id`                         | Get course with modules/lessons                                                    |
| PATCH  | `/courses/:id`                         | Update course                                                                      |
| DELETE | `/courses/:id`                         | Delete course                                                                      |
| POST   | `/courses/:id/publish`                 | Publish course                                                                     |
| POST   | `/courses/:id/unpublish`               | Unpublish course                                                                   |
| POST   | `/courses/:id/assign-subadmin`         | Assign to subadmin (Admin only, body: subadminId)                                  |
| GET    | `/courses/:id/analytics`               | Course analytics                                                                   |
| GET    | `/courses/:id/enrolled-users`          | Enrolled users                                                                     |
| POST   | `/courses/:courseId/modules`           | Create module (body: title, order?)                                                |
| POST   | `/courses/modules/:moduleId/lessons`   | Create lesson (body: title, type, content?, videoUrl?, pdfUrl?, order?, duration?) |
| POST   | `/courses/lessons/:lessonId/exercises` | Add exercise to lesson                                                             |
| POST   | `/courses/:courseId/exercises`         | Add exercise to course                                                             |
| PATCH  | `/courses/exercises/:exerciseId`       | Update exercise                                                                    |
| DELETE | `/courses/exercises/:exerciseId`       | Delete exercise                                                                    |

---

## Admin – Wallet & Trading Config

| Method                | Endpoint                               | Description                                                               |
| --------------------- | -------------------------------------- | ------------------------------------------------------------------------- |
| POST                  | `/wallet/:userId/credit`             | Credit user wallet (body: amount, description?)                           |
| POST                  | `/wallet/:userId/debit`              | Debit user wallet (body: amount, description?)                            |
| GET                   | `/wallet/admin/transactions?userId=` | User transaction history                                                  |
| GET                   | `/trades/admin/trades`               | All trades (query: userId?, symbol?, page?, limit?)                       |
| GET                   | `/trades/admin/positions`            | All positions (query: userId?, status?)                                   |
| GET                   | `/trades/admin/leaderboard`          | Leaderboard (query: sortBy=net_profit_pct\|win_rate\|consistency, limit?) |
| GET/POST/PATCH/DELETE | `/config/market`                     | Market config CRUD                                                        |
| GET/POST/PATCH/DELETE | `/config/brokerage`                  | Brokerage config CRUD                                                     |

---

## Admin – Reports

| Method | Endpoint                             | Description            |
| ------ | ------------------------------------ | ---------------------- |
| GET    | `/reports/trade/:userId`           | Trade report           |
| GET    | `/reports/wallet/:userId`          | Wallet report          |
| GET    | `/reports/course-progress/:userId` | Course progress report |
| GET    | `/reports/activity/:userId`        | Activity report        |

---

## Admin / Subadmin – Referral & Signup Bonus

| Method | Endpoint                        | Description                                                                                         |
| ------ | ------------------------------- | --------------------------------------------------------------------------------------------------- |
| GET    | `/referral/signup-bonus`      | Get my referral signup bonus amount (virtual balance new users get when they register with my code) |
| PATCH  | `/referral/signup-bonus`      | Set referral signup bonus (body:`amount` number, min 0)                                           |
| GET    | `/referral/referred-users`    | Referred users (Subadmin: own only)                                                                 |
| GET    | `/referral/commission-report` | Commission report                                                                                   |
| GET    | `/referral/course-revenue`    | Course revenue (Subadmin only)                                                                      |

## Wallet – Manual Credit (Admin / Subadmin)

- **Admin**: Can credit any user. **Subadmin**: Can credit only users who registered with their referral code.
- **Debit**: Admin only.

| Method | Endpoint                   | Description                                     |
| ------ | -------------------------- | ----------------------------------------------- |
| POST   | `/wallet/:userId/credit` | Add balance (body:`amount`, `description?`) |
| POST   | `/wallet/:userId/debit`  | Deduct balance (Admin only)                     |

---

## User – Wishlist

| Method | Endpoint              | Description            |
| ------ | --------------------- | ---------------------- |
| POST   | `/wishlist/:symbol` | Add symbol to wishlist |
| DELETE | `/wishlist/:symbol` | Remove from wishlist   |
| GET    | `/wishlist`         | View wishlist          |

---

## User – Paper Trading

| Method | Endpoint                                | Description                                                   |
| ------ | --------------------------------------- | ------------------------------------------------------------- |
| POST   | `/trades/orders`                      | Place order (body: symbol, side, quantity, price?, orderType) |
| POST   | `/trades/positions/:positionId/close` | Close position (body: closePrice)                             |
| GET    | `/trades/positions`                   | Open positions                                                |
| GET    | `/trades/orders`                      | Orders (query: status?, limit?)                               |
| GET    | `/trades/history`                     | Trade history (query: symbol?, limit?)                        |
| GET    | `/trades/pnl`                         | PnL summary                                                   |
| GET    | `/trades/portfolio`                   | Portfolio summary                                             |

---

## User – Wallet

| Method | Endpoint                    | Description            |
| ------ | --------------------------- | ---------------------- |
| GET    | `/wallet/me/balance`      | My balance             |
| GET    | `/wallet/me/transactions` | My transaction history |

---

## User – Profile

| Method | Endpoint        | Description                                                       |
| ------ | --------------- | ----------------------------------------------------------------- |
| GET    | `/my/profile` | Get my profile (id, email, name, referralCode, lastLoginAt, etc.) |
| PATCH  | `/my/profile` | Update profile (body: name?, email?)                              |

---

## User – Courses (LMS)

| Method | Endpoint                             | Description                                               |
| ------ | ------------------------------------ | --------------------------------------------------------- |
| GET    | `/my/courses`                      | Available courses (filtered by referral)                  |
| POST   | `/my/enroll/:courseId`             | Enroll in course                                          |
| GET    | `/my/enrollments`                  | My enrollments                                            |
| GET    | `/my/courses/:courseId/lessons`    | Course lessons (modules + lessons)                        |
| POST   | `/my/progress`                     | Record progress (body: lessonId, enrollmentId, timeSpent) |
| POST   | `/my/exercises/:exerciseId/submit` | Submit exercise (body: enrollmentId, response)            |
| GET    | `/my/certificate/:enrollmentId`    | Get certificate                                           |

---

## User – AI Assistant

| Method | Endpoint                    | Description                            |
| ------ | --------------------------- | -------------------------------------- |
| POST   | `/ai/ask`                 | Ask question (body: message, context?) |
| POST   | `/ai/explain`             | Explain concept (body: topic)          |
| POST   | `/ai/analyze-performance` | Analyze my performance                 |

---

## Payments

| Method | Endpoint                      | Description                                                        |
| ------ | ----------------------------- | ------------------------------------------------------------------ |
| POST   | `/payments/create-order`    | Create payment order (body: courseId, provider, amount, currency?) |
| POST   | `/payments/verify/razorpay` | Verify Razorpay payment                                            |
| POST   | `/payments/verify/stripe`   | Verify Stripe session                                              |
| GET    | `/payments/history`         | Payment history (Admin/Subadmin filtered)                          |

---

## Health

| Method | Endpoint    | Description      |
| ------ | ----------- | ---------------- |
| GET    | `/health` | API health check |

---

## Symbols (Contract Master)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/symbols` | Search/filter (query: `q`, `exchange`, `instrument`, `page`, `limit`) |
| GET | `/symbols/:id` | Get symbol by id |
| POST | `/symbols/ingest` | Admin: fetch Alice Blue CSVs and upsert (NSE, NFO, BFO, CDS, MCX, BSE) |
| DELETE | `/symbols/truncate` | Admin: truncate Symbol table (delete all rows) |

**Exchange:** NSE, NFO, BFO, CDS, MCX, BSE. **InstrumentType:** EQ, FUT, OPT, CE, PE, others.

---

## Response Format

- Success: `{ "success": true, "data": ... }`
- Error: `{ "success": false, "message": "...", "code": "..." }`

## Enums

- **Role**: ADMIN, SUBADMIN, USER
- **LessonType**: VIDEO, PDF, TEXT, QUIZ
- **ExerciseType**: MCQ, FILL_IN_BLANKS
- **OrderSide**: BUY, SELL
- **OrderStatus**: PENDING, FILLED, CANCELLED, REJECTED
