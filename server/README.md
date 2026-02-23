# TradeLearn Pro – Backend

Backend for **TradeLearn Pro**: Paper Trading Simulation + LMS + AI Educational Assistant.

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express + TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: JWT (Access + Refresh Token)
- **Payments**: Razorpay (India), Stripe (Global)
- **Validation**: Zod
- **AI**: OpenAI (educational assistant)

## Project Structure

```
src/
├── config/           # App config from env
├── middlewares/      # Auth, RBAC, validation, rate limit, error handler
├── modules/
│   ├── auth/         # Login, refresh, logout, change/reset password
│   ├── user/         # User CRUD, block, reports (Admin/Subadmin)
│   ├── course/       # Course, module, lesson, exercise (Admin/Subadmin)
│   ├── wallet/       # Balance, credit/debit, transactions
│   ├── trade/        # Paper trading, orders, positions, leaderboard, market/brokerage config
│   ├── referral/     # Referred users, commission, course revenue
│   ├── payment/      # Razorpay/Stripe create & verify, history
│   ├── ai/           # Educational AI (ask, explain, analyze)
│   ├── wishlist/     # User wishlist (symbols)
│   ├── userCourse/   # User: available courses, enroll, lessons, progress, certificate
│   └── reports/      # Admin reports (trade, wallet, course progress, activity)
├── routes/           # Route aggregation
├── utils/             # Prisma client, errors, referral code
└── index.ts           # App entry
prisma/
├── schema.prisma     # Full schema (User, Role, Course, Module, Lesson, Exercise, Enrollment, Progress, Wallet, Transaction, Trade, Position, Order, Referral, Commission, Payment, ActivityLog, etc.)
└── seed.ts           # Seed admin user + default brokerage + market configs
postman/               # Postman collection + environment
docs/                  # API documentation
```

## Setup Guide

### 1. Prerequisites

- Node.js 18+
- PostgreSQL 14+
- (Optional) Razorpay/Stripe/OpenAI keys for payments and AI

### 2. Clone and install

```bash
cd lms_ai_papertrade
npm install
```

### 3. Environment

Copy `.env.example` to `.env` and set:

```env
# Required
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/tradelearn_pro?schema=public"
JWT_ACCESS_SECRET=your-access-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars

# Optional (defaults in example)
PORT=4000
NODE_ENV=development
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Payments & AI (optional)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
OPENAI_API_KEY=
```

### 4. Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed (admin user + default brokerage + sample market configs)
npm run prisma:seed
```

Default admin (override with env):

- Email: `admin@tradelearn.pro`
- Password: `Admin@123456`

### 5. Run

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

API base: `http://localhost:4000/api/v1`

**Optional – Symbol table & ingest:** The `Symbol` table is created by migration. If you get "Symbol table not found" when running ingest:
1. Run **`npm run prisma:migrate`** (or **`npx prisma migrate dev`**) once to create the Symbol table.
2. Then run **`npm run symbols:ingest`** to fetch and store contract master data.  
   Or use **`npm run symbols:migrate-and-ingest`** to apply pending migrations and then ingest in one go.

### 6. Postman

1. Import `postman/TradeLearn_Pro_API.postman_collection.json`.
2. Import `postman/TradeLearn_Pro.postman_environment.json`.
3. Set **baseUrl** in the environment (e.g. `http://localhost:4000/api/v1`).
4. Call **Auth → Admin Login** (or User/Subadmin Login), then set **accessToken** (and **refreshToken** if you use refresh) in the environment or collection variables.
5. Use **Authorization** type **Bearer Token** with `{{accessToken}}` for protected requests.

## Role-Based Access (RBAC)

- **Admin**: Full user/course/wallet/trade/reports/config management; assign courses to subadmins.
- **Subadmin**: Own courses only; referred users; commission and course revenue; cannot access other subadmins or global settings.
- **User**: Register (optional referral), wishlist, paper trading, wallet, courses (filtered by referral), AI assistant, payments.

Referral rules are enforced on the backend: users who sign up with a referral code can only see and enroll in that referrer’s courses (or unassigned/global courses).

## Security

- JWT access + refresh with rotation on refresh
- Role-based middleware on all protected routes
- Input validation with Zod
- Rate limiting (global + stricter on auth)
- Centralized error handling
- Reset token hashing for forgot password

## API Documentation

See **docs/API_DOCUMENTATION.md** for endpoint list and usage.

## Deliverables Checklist

- [x] Node.js + Express + TypeScript backend
- [x] Prisma schema and migrations
- [x] Modular folder structure
- [x] Admin / Subadmin / User APIs per PRD
- [x] JWT auth and RBAC
- [x] Postman collection + environment
- [x] API documentation
- [x] Setup guide (this README)
