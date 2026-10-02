# Motion Mirage Finance

A lightweight private finance and invoice management application for Motion Mirage Studios built with Next.js, TypeScript, and Tailwind CSS.

## Current capabilities

- Private credentials login with hashed passwords and protected routes
- Invoice builder with live A4 preview and browser PDF export
- Shared invoice workspace with server-side role permissions
- PostgreSQL schema for users, clients, projects, invoices, payments, and expenses
- Dashboard overview with key financial metrics
- Client and vendor directories with client invoice history
- Payment and expense recording with edit and delete confirmations
- Workspace settings for company identity, UPI, bank details, invoice notes, and PNG logo upload
- Owner-configurable SMTP delivery and Discord notifications for invoices, quotations, and payments

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
2. Set `DATABASE_URL` to the runtime PostgreSQL connection string. Set `DIRECT_URL` to the database's direct (non-pooled) connection string for schema changes; for local development, both can use the same URL.
3. Run `npm run db:generate`, `npm run db:push`, and `npm run db:seed`.
4. After seeding, remove `AUTH_ADMIN_PASSWORD` and keep only a generated `AUTH_ADMIN_PASSWORD_HASH` in production.
5. Open `/login`. Unauthenticated visitors are redirected there; invoice creation and saving require a valid session.
6. Configure `RESEND_API_KEY` and a verified `SMTP_FROM` sender to deliver account setup and password reset emails.

## Deployment performance

- Set `AUTH_SECRET` in the hosting provider's environment variables for both the Production build and runtime. Generate a strong value with `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`, keep it stable across deployments, and never commit it to the repository. A missing or weak secret intentionally stops the build rather than deploying an app whose authentication cannot work.
- Set `NEXTAUTH_URL` to the deployed HTTPS app URL in the same environment.
- Keep the application server and PostgreSQL database in the same region where possible. If the application is deployed in Warsaw, a database in a distant region will still add network latency to every request.
- Set `DIRECT_URL` in the deployment environment to the PostgreSQL direct/non-pooled connection string. Keep `DATABASE_URL` pointed at the runtime connection pool if the hosting provider supplies one. Prisma uses `DIRECT_URL` for schema operations such as `npm run db:push`, avoiding connection limits on Supabase's session pooler.
- For Supabase deployments, runtime connections use the Transaction pooler (port `6543`) instead of the Session pooler (port `5432`). The app switches Supabase pooler URLs to port `6543`, limits each Prisma client to one connection, and enables PgBouncer compatibility; use the direct connection URL for `DIRECT_URL`.
- Apply schema changes to the production database with `npm run db:push` before deploying application changes that depend on them. The database indexes and cascading delete rules are required for the optimized list and delete paths.
- The production build runs `prisma generate` before `next build` so the Prisma Client types always match `prisma/schema.prisma`, including when the deployment platform restores a cached generated client.

## Workspace workflow

- Use **Settings** to save company details, payment identity, bank details, invoice notes, and the invoice logo used in previews and PDFs.
- Use **Profile & security** to create users and assign Employee, Co-founder, or Owner access. Employees can create and view invoices; Co-founders can manage operational records; Owners can also manage users and company settings.
- Select **Send setup link** beside a user to email a one-time password link. Links expire after one hour and can only be used once.
- Use **Settings > Notifications** to configure SMTP host, port, TLS, sender, username, and app password, then use **Test email**. SMTP passwords and Discord webhook URLs are encrypted using a key derived from `AUTH_SECRET`; keep that secret stable and backed up or re-enter the integrations after rotating it.
- Add a Discord webhook in **Settings > Notifications**, choose which business events should alert the channel, and use **Test Discord** before enabling alerts.
- Use **Clients** to open a client account and review its billing history. Create invoices from the client account or invoice builder.
- Use **Payments** and **Expenses** to record operational activity and update or remove records with confirmation.
- Invoice deletion also removes its line items and linked payments after confirmation.
- New invoices use the annual sequence format `INV-YY-###` (for example, `INV-26-001`); previously saved invoice numbers are left unchanged.

Do not commit `.env` or expose database passwords. Rotate any database credentials that have been shared outside the local machine.
