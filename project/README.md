# Fidelity - Complete Web System

## STEP 1: Project Folder Structure
```
/project
  /client-user
    /css
    /js
    index.html
  /client-admin
    /css
    /js
    index.html
  /server
    /config
    /routes
    /controllers
    /middleware
    /models
    /services
    /sql
    /postman
    server.js
```

## STEP 2: MySQL Schema SQL File
- File: `server/sql/schema.sql`
- Includes all required tables:
  - `admins`
  - `users`
  - `bank_details`
  - `upi_details`
  - `transactions`
  - `withdraw_requests`

Run:
```bash
mysql -u root -p < server/sql/schema.sql
```

## STEP 3: Backend Server Setup
- File: `server/server.js`
- Modular route loading:
  - `/api/auth`
  - `/api/user`
  - `/api/admin`

Install and run:
```bash
cd server
cp .env.example .env
npm install
npm run dev
```

## STEP 4: Authentication System
- User auth routes: `server/routes/authRoutes.js`
- Admin auth route: `server/routes/adminRoutes.js` (`POST /api/admin/login`)
- Password hashing: `bcrypt`
- JWT token service: `server/services/tokenService.js`
- Middleware:
  - `server/middleware/userAuthMiddleware.js`
  - `server/middleware/adminAuthMiddleware.js`

## STEP 5: Admin APIs
- `POST /api/admin/login`
- `GET /api/admin/users`
- `POST /api/admin/user/:id/inject`
- `PATCH /api/admin/user/:id/status`
- `GET /api/admin/withdrawals`
- `POST /api/admin/withdraw/:id/approve`
- `POST /api/admin/withdraw/:id/reject`
- `GET /api/admin/bank-details`
- `GET /api/admin/upi-details`
- `GET /api/admin/deposits`

## STEP 6: User APIs
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/user/profile`
- `PUT /api/user/profile`
- `POST /api/user/bank`
- `POST /api/user/upi`
- `POST /api/user/withdraw`
- `GET /api/user/transactions`

Business logic:
- Minimum withdraw check (`MIN_WITHDRAW_LIMIT`)
- Pending withdrawal goes to admin approval
- Admin approval deducts wallet and completes transaction

## STEP 7: Admin Dashboard Integration
- Admin frontend: `client-admin/index.html`
- Integration script: `client-admin/js/app.js`
- Features:
  - User listing/search
  - Wallet inject
  - Status toggle active/banned
  - Withdraw approvals/rejections
  - View banks, UPI, deposits
  - Online/offline derived from `last_login`

## STEP 8: Example API Testing (Postman)
- File: `server/postman/fidelity.postman_collection.json`
- Includes sample auth, user, and admin endpoints.

---

## Frontend Usage
Serve both static clients using any static server, for example:
```bash
npx serve ../client-user
npx serve ../client-admin
```

Update API base URL inside:
- `client-user/js/app.js`
- `client-admin/js/app.js`
