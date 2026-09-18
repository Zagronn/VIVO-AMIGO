# VIVO AMIGO — marketplace, classifieds & ecosystem platform

A full-stack Next.js 14 (App Router) + Prisma platform. Shoppers browse a
multi-vendor marketplace, independent sellers apply and list their own
products once approved, and the same account also covers classifieds (real
estate, vehicles, jobs, second-hand goods), five VIVO ecosystem sub-brand
pages (PAY, SHIP, ADS, BUSINESS, SUPPORT — the last with a live AI chat
assistant), an installable VIVO POS point-of-sale for street sellers, company
pages, and admins run everything from a glassmorphism "super admin" dashboard
with live stats and charts.

> **Note:** this project was hand-written in a sandbox with no package-registry
> access, so `npm install` / `next build` could not be run there. Every file
> was checked for syntax errors (`tsc` parse-only pass, 0 errors), but please
> run a normal `npm install` + `npm run build` locally before you rely on it —
> see Troubleshooting below.

## Stack

- **Next.js 14** (App Router, Server Actions, hostname-based `middleware.ts`)
- **Prisma** + **PostgreSQL** (`prisma/schema.prisma`), money stored as `Decimal`
- **Tailwind CSS**, with a glassmorphism design layer (`app/globals.css`) built
  on the dataviz-skill's validated, colorblind-safe palette for the admin charts
- **zod** for input validation
- **bcryptjs** + a simple DB-backed session cookie for auth (no third-party auth service)
- **Anthropic Messages API** (via plain `fetch`, no SDK) powering the VIVO
  SUPPORT AI chat assistant
- **Twilio REST API** (via plain `fetch`, no SDK) powering VIVO POS's optional
  SMS receipts
- A hand-rolled **service worker + web app manifest** (`public/sw.js`,
  `public/manifest.json`) making VIVO POS installable and usable offline

## Getting started

The easiest path is Docker for Postgres, then the usual Next.js/Prisma flow:

```bash
docker compose up -d          # starts Postgres on localhost:5432 (see docker-compose.yml)
npm install
cp .env.example .env          # DATABASE_URL already matches the Docker Postgres above
npx prisma migrate dev --name classifieds_pos_and_contact
npm run seed                  # vendors, categories, products, classifieds, POS demo data, and 12 orders
npm run dev
```

Then open http://localhost:3000. No Docker? Point `DATABASE_URL` in `.env` at
any hosted Postgres (Neon, Supabase, Railway, RDS, etc.) instead.

If you already ran an earlier migration (`init`, or `classifieds_and_contact`),
just run `npx prisma migrate dev --name classifieds_pos_and_contact` again on
top of it — Prisma only applies whatever tables are new (POS tables, if
that's all that's missing), then re-run `npm run seed` to add demo data.

**Optional:** to enable the VIVO SUPPORT AI chat at `/support`, add an
`ANTHROPIC_API_KEY` to `.env` (see `.env.example`). Without it the chat widget
still renders fine — it just shows a friendly "not configured yet" message
instead of replying.

**Optional:** to enable "Send this receipt by SMS" on a VIVO POS receipt, add
`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_FROM_NUMBER` to `.env`.
Without them, that one button shows a "not configured yet" message — the
QR-code receipt (and everything else in VIVO POS) works with zero setup.

**Demo accounts** (created by the seed script, password shown per row):

| Role              | Email                          | Password   |
|-------------------|---------------------------------|------------|
| Admin             | admin@vivoamigo.com             | admin1234  |
| Customer          | demo@vivoamigo.com              | demo1234   |
| Customer          | maria@vivoamigo.com             | demo1234   |
| Active seller     | carlos.vendor@vivoamigo.com     | demo1234   |
| Active seller     | ana.vendor@vivoamigo.com        | demo1234   |
| Pending seller    | pending.vendor@vivoamigo.com    | demo1234   |
| Suspended seller  | suspended.vendor@vivoamigo.com  | demo1234   |

## What's implemented

**Marketplace core**
- **Auth** — register/login/logout with hashed passwords and a signed,
  httpOnly session cookie stored in a `Session` table (`actions/auth.ts`,
  `lib/session.ts`).
- **Catalog** — `/products` (filterable by category), `/products/[id]` with
  star ratings, seller attribution, and a review form; `/search` (title/description
  search) and `/store/[vendorId]` (public seller storefronts).
- **Reviews** — `createProductReview` (`actions/reviews.ts`): reviewer identity
  comes from the session (not the form), input is validated with zod, and
  duplicate reviews are caught cleanly.
- **Cart & checkout** — `CartItem` rows keyed directly to the signed-in user
  (`actions/cart.ts`, `/cart`); `/checkout` snapshots cart prices into an
  `Order` + `OrderItem`s and immediately runs a mock payment
  (`actions/orders.ts`, `actions/payments.ts`), charging the order's own
  stored total rather than trusting client input. `/orders` lists a
  customer's own order history; `/orders/[id]` shows one order's detail.
- **Shipments** — admins can dispatch a paid order from `/orders/[id]`
  (`actions/shipments.ts`), which requires admin + a PAID order and generates
  tracking codes with `crypto`.
- **Multi-vendor marketplace**:
  - `/sell` — a signed-in customer applies to become a seller
    (`actions/vendors.ts` / `applyToBecomeVendor`); starts `PENDING`.
  - `/vendor/dashboard` — an **ACTIVE** seller lists new products
    (`actions/products.ts` / `createProduct`) and toggles their own products
    active/inactive (`toggleProductActive`). Gated by `requireActiveVendor()`
    in `lib/session.ts` — a pending or suspended seller is redirected back to
    `/sell`.
  - `/admin/dashboard` — approve, reject, suspend, or reinstate sellers
    (`approveVendor` / `suspendVendor`).
- **Super admin dashboard** (`/admin/dashboard`) — a dark glassmorphism
  console: five live stat tiles (revenue, orders, active vendors, pending
  applications, customers), a 7-day revenue bar chart, an order-status
  breakdown, the seller-approval queue, and a recent-orders table. Colors
  come straight from the dataviz skill's validated dark-mode palette
  (`app/globals.css`, `--viz-*` custom properties).

**Classifieds** (any signed-in user can post — no vendor approval needed,
gated by `requireUser()` rather than `requireActiveVendor()`):
- `/real-estate` — houses, apartments, land, commercial (`actions/realEstate.ts`)
- `/vehicles` — cars, motorcycles, trucks (`actions/vehicles.ts`)
- `/jobs` — full-time/part-time/contract/internship, with a remote flag (`actions/jobs.ts`)
- `/second-hand` — peer-to-peer used goods (`actions/secondhand.ts`)
- `/classifieds` — a hub page linking to all four verticals

Each vertical follows the same shape: a Prisma model with its own owner field
(`ownerId`, `posterId`, or `sellerId`), a zod schema in `lib/validation.ts`, a
`create*`/`toggle*Active` server action pair, a `New*Form` client component,
and `list` / `[id]` / `new` pages sharing the `ClassifiedCard` component.

**Ecosystem sub-brand pages** (`components/SubBrandPage.tsx` template):
`/pay`, `/ship`, `/ads`, `/business`, and `/support` — the last also renders
`<SupportChatWidget />`, a live chat backed by `actions/support.ts`
(`askSupportAssistant`), which calls the Anthropic Messages API directly.

**VIVO POS** (`/pos`) — a lightweight, installable point-of-sale for street
sellers and independent shops. Open to any signed-in user, same as
classifieds — no vendor approval needed:
- `/pos/catalog` — a quick price list (`actions/pos.ts` / `createPosCatalogItem`,
  `togglePosCatalogItemActive`), just name + price + an optional photo, no
  stock counts to manage.
- `/pos/sell` — the register (`components/PosRegister.tsx`): tap items into a
  cart, charge, done. Each sale gets a `clientSaleId` and `receiptCode`
  generated **on the device**, before it ever reaches the server — so a sale
  can be completed with zero connection.
- **Offline-resilient**: a service worker (`public/sw.js`) caches the `/pos`
  app shell so it still opens with no signal, and `PosRegister` queues any
  sale made offline in `localStorage`, auto-syncing it via `recordPosSale`
  the moment the browser's `online` event fires. `clientSaleId` is a unique
  DB column, so a retried sync can never double-book a sale.
- **Installable**: `public/manifest.json` + the service worker make `/pos`
  installable to a phone's home screen like a native app (`components/PosAppShell.tsx`
  also hides the marketing nav/footer once running standalone).
- **Digital receipts** (`/pos/receipt/[receiptCode]`, public — no sign-in
  needed to view): a QR code (generated via a public QR image API, no key
  required) that works the instant a sale is made, plus an optional
  "send by SMS" button for the seller, backed by the Twilio REST API
  (`sendPosReceiptSms`) — gracefully shows "not configured yet" without
  Twilio credentials.
- **Ecosystem sync**: sales and the catalog are tied to the same VIVO AMIGO
  account as everything else — a street seller's identity, sales history, and
  eventual step-up to a full `VendorProfile` (via `/sell`) all live on one
  `User` row.

**Company pages**: `/about`, `/contact` (with a working contact form saving to
the `ContactMessage` table via `actions/contact.ts`), `/careers`, `/terms`, `/privacy`.

**Multi-domain routing** (`middleware.ts`): a single deployment serves three
domains differently by hostname —
- `vivoamigo.com` — the full site, unchanged
- `payvivoamigo.com` — root path rewritten to `/pay`
- `cargovivo.com` — root path rewritten to `/ship`

Only `/` is rewritten, so e.g. `payvivoamigo.com/contact` still resolves to
the real `/contact` page.

## Project structure

```
app/            Routes (App Router) — storefront, classifieds, ecosystem pages, VIVO POS, company pages, admin
actions/        Server actions ('use server') — the business logic
lib/            DB client, session/auth helpers, money formatting, validation schemas
components/     UI components (client components where interactivity is needed)
prisma/         schema.prisma (Postgres) + seed.ts
public/         manifest.json + sw.js (VIVO POS install/offline support) + icons
middleware.ts   Hostname-based routing for the three connected domains
docker-compose.yml   One-command local Postgres for development
```

## Design system notes

- `app/globals.css` defines two visual layers: a light "frosted glass"
  (`.glass-card`, `.glass-nav`) used across the storefront over a subtle
  gradient backdrop, and a dark glass system (`.admin-glass`, `.admin-shell`,
  `.admin-chip`, `.admin-btn*`) for `/admin/dashboard` and other
  operator-facing views.
- Chart colors are CSS custom properties (`--viz-blue`, `--viz-good`, etc.)
  copied verbatim from a pre-validated, colorblind-safe palette rather than
  invented — swap them in one place if you rebrand.
- The two chart panels each include a `<details>`/`<summary>` "View as table"
  fallback with the same numbers, so the data is available without relying on
  bar height alone.

## Moving to production

- Point `DATABASE_URL` at your real Postgres instance (managed Postgres,
  RDS, etc.) — the schema already targets `postgresql`.
- Replace the mock payment gateway in `actions/payments.ts` with a real
  Stripe (or local LatAm processor) integration — the transaction shape
  (`Payment` row + `Order` status flip) is already set up for that swap.
- Add real image upload (S3/Cloudinary) instead of the raw `imageUrl` field
  vendors and classifieds posters currently paste in.
- Add `ANTHROPIC_API_KEY` in your hosting provider's environment variables to
  enable the live VIVO SUPPORT chat in production.
- Add `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_FROM_NUMBER` to
  enable real SMS receipts from VIVO POS.
- Replace `public/icons/pos-icon.svg` with real PNG app icons (multiple
  sizes) before shipping VIVO POS widely — the SVG placeholder installs fine
  on most modern browsers, but a couple of platforms still expect PNG.
- Consider moving session storage to a faster store (e.g. Redis) if traffic
  grows; the `Session` table works fine for a prototype.
- **Domains**: deploy once (e.g. Vercel), add `vivoamigo.com`,
  `payvivoamigo.com`, and `cargovivo.com` as domains on that one deployment,
  and point each domain's DNS at it — `middleware.ts` handles routing each
  hostname to the right page. See your deployment provider's docs for the
  exact DNS records it asks for.

## Troubleshooting

If `npm install` or `npm run build` complains, it's most likely one of:

- **Node version** — this was written against Node 18+/20+. Run `node -v`.
- **Postgres not reachable** — confirm `docker compose ps` shows the
  `postgres` service healthy, or that your hosted `DATABASE_URL` is correct.
- **Prisma client out of date** — run `npx prisma generate` after any
  `schema.prisma` change.
- **ESLint** — `next.config.js` currently sets `eslint.ignoreDuringBuilds:
  true` because lint couldn't be run before delivery. Run `npm run lint`
  once locally, fix anything it flags, then feel free to remove that flag.
