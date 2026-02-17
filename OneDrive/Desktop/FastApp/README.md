# FastApp (MERN) - Loan & Investment Platform (scaffold)

Minimal scaffold for a Kenyan-focused loan web application. Includes:

- User signup/login with referral credits
- Loan application with Kenyan KYC fields
- MPesa adapter (simulated when credentials are not present)
- Investment deposit route

Getting started

1. Copy `.env.example` to `.env` and set `MONGODB_URI` and `JWT_SECRET`.
2. Install dependencies and run server:

```bash
npm install
npm run dev
```

Frontend is a minimal React app in `client/` (not yet bootstrapped). This scaffold focuses on backend endpoints and models. Extend the frontend as needed.
