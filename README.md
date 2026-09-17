# Motion Mirage Finance

A lightweight private finance and invoice management application for Motion Mirage Studios built with Next.js, TypeScript, and Tailwind CSS.

## Current capabilities

- Private credentials login with hashed passwords and protected routes
- Invoice builder with live A4 preview and browser PDF export
- Authenticated invoice API with server-side validation and ownership
- PostgreSQL schema for users, clients, projects, invoices, payments, and expenses
- Dashboard overview with key financial metrics

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run db:generate
npm run db:push
npm run db:seed
```

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS
- Prisma-ready data layer

## First-time private setup

1. Copy `.env.example` to `.env.local` and set a strong `AUTH_SECRET`, `AUTH_ADMIN_EMAIL`, and temporary `AUTH_ADMIN_PASSWORD`.
2. Set `DATABASE_URL` to a reachable PostgreSQL database. The current local `.env` host is unreachable, so `npm run db:push` cannot create tables until that value is corrected.
3. Run `npm run db:generate`, `npm run db:push`, and `npm run db:seed`.
4. After seeding, remove `AUTH_ADMIN_PASSWORD` and keep only a generated `AUTH_ADMIN_PASSWORD_HASH` in production.
5. Open `/login`. Unauthenticated visitors are redirected there; invoice creation and saving require a valid session.

Do not commit `.env` or expose database passwords. Rotate any database credentials that have been shared outside the local machine.
