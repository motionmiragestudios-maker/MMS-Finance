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
2. Set `DATABASE_URL` to a reachable PostgreSQL database.
3. Run `npm run db:generate`, `npm run db:push`, and `npm run db:seed`.
4. After seeding, remove `AUTH_ADMIN_PASSWORD` and keep only a generated `AUTH_ADMIN_PASSWORD_HASH` in production.
5. Open `/login`. Unauthenticated visitors are redirected there; invoice creation and saving require a valid session.
6. Configure `RESEND_API_KEY` and a verified `SMTP_FROM` sender to deliver account setup and password reset emails.

## Workspace workflow

- Use **Settings** to save company details, payment identity, bank details, invoice notes, and the invoice logo used in previews and PDFs.
- Use **Profile & security** to create users and assign Employee, Co-founder, or Owner access. Employees can create and view invoices; Co-founders can manage operational records; Owners can also manage users and company settings.
- Select **Send setup link** beside a user to email a one-time password link. Links expire after one hour and can only be used once.
- Use **Settings > Notifications** to configure SMTP host, port, TLS, sender, username, and app password, then use **Test email**. SMTP passwords and Discord webhook URLs are encrypted using a key derived from `AUTH_SECRET`; keep that secret stable and backed up or re-enter the integrations after rotating it.
- Add a Discord webhook in **Settings > Notifications**, choose which business events should alert the channel, and use **Test Discord** before enabling alerts.
- Use **Clients** to open a client account and review its billing history. Create invoices from the client account or invoice builder.
- Use **Payments** and **Expenses** to record operational activity and update or remove records with confirmation.
- Invoice deletion also removes its line items and linked payments after confirmation.

Do not commit `.env` or expose database passwords. Rotate any database credentials that have been shared outside the local machine.
