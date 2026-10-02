# Naykama AI

**Hire your first AI employee.** Naykama AI answers customers, books appointments, creates invoices, manages inventory and works 24/7.

Built with Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion and Recharts.

## Features

| Area | What's included |
| --- | --- |
| Landing | Hero, live AI demo (streaming), features, channels, testimonials, pricing (monthly/annual, ZAR), security, FAQ, contact form, footer, JSON-LD |
| Auth | Email/password (scrypt), Google & Microsoft OAuth, forgot/reset password, TOTP two-factor auth, JWT HTTP-only cookies, route middleware, roles |
| Dashboard | Overview, AI Assistant (chat history, voice in/out, image upload), AI Studio (email, reply, invoice, quote, marketing, product, social, meeting summary, document analysis, translation into 15 languages), unified Inbox (WhatsApp, Email, SMS, Web, Messenger, Instagram) with AI drafts and human takeover, CRM + drag-and-drop lead pipeline, calendar, invoice/quote generator with AI fill + print to PDF, inventory, sales & profit, expenses, Kanban tasks, notifications, integrations, billing, settings (profile, AI persona, 2FA, password, team & RBAC, POPIA/GDPR data export) |
| Payments | Free trial, Starter/Business/Enterprise, monthly/annual, Stripe Checkout + signed webhooks (demo checkout when no key is set) |
| Admin | Platform metrics, user management (roles, plans, 2FA reset), subscriptions, support tickets, AI usage monitoring, security controls & audit log |
| Platform | Dark/light mode, mobile-first, PWA (manifest, service worker, shortcuts), SEO (metadata, OG, sitemap, robots), rate limiting, reduced motion |

## Getting started

```bash
npm install
cp .env.example .env.local   # optional — everything works without keys in demo mode
npm run dev
```

Open http://localhost:3000 and sign in with a demo account:

- Business owner: `demo@naykama.ai` / `demo1234`
- Platform admin: `admin@naykama.ai` / `demo1234`

## Configuration

| Variable | Purpose |
| --- | --- |
| `AUTH_SECRET` | **Required in production.** Signs session cookies. |
| `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_BASE_URL` | Enables GPT responses, vision and translation. Falls back to a demo model. |
| `GOOGLE_CLIENT_ID/SECRET` | Google sign-in. Redirect URI: `{APP_URL}/api/auth/oauth/google/callback` |
| `MICROSOFT_CLIENT_ID/SECRET`, `MICROSOFT_TENANT_ID` | Microsoft sign-in. Redirect URI: `{APP_URL}/api/auth/oauth/microsoft/callback` |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Live subscriptions. Webhook endpoint: `{APP_URL}/api/billing/webhook` |

## Architecture notes

- `src/lib/server/users.ts` is the only persistence layer for accounts. It is an in-memory store for the demo — swap it for Postgres/Prisma, Supabase, etc. before going live.
- Workspace data in the dashboard (customers, invoices, inventory, …) is seeded from `src/lib/data.ts` and persisted per-browser via `usePersistentState`; replace with API calls backed by your database.
- Channel integrations (WhatsApp Cloud API, Twilio, Meta Graph) and password-reset emails need provider credentials and webhook handlers to send real messages.
- Deploy anywhere Next.js runs (Vercel, AWS, Azure, Docker). Stateless API routes scale horizontally once a shared database and rate-limit store (e.g. Redis) are configured.

## Scripts

```bash
npm run dev     # development server
npm run build   # production build
npm run start   # serve production build
npm run lint    # ESLint
npx tsc --noEmit
```
