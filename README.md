# Kommuneportalen for Modulus Barn

Public portal for the kommuner that use Modulus Barn, the barnevern solution delivered by Netcompany.
It is not the case-management system itself, and it sits next to the existing drift site, which covers
driftsmeldinger. Visitors need no login: they follow what is new (release notes, news, campaigns),
browse modules, courses and services (each with a link to where it is ordered), and send wishes for
further development, which the kommuner prioritise together. Only Netcompany admins log in, to manage
all content from `/admin`.

All text on the site is Norwegian (bokmål), including validation messages (zod `no` locale). Code and docs are in English.

## Stack

- **SvelteKit 3** (Svelte 5 runes, form actions) with `adapter-node`
- **shadcn-svelte** (vega style) on Tailwind CSS 4, Lucide icons, light/dark mode
- **PostgreSQL** with **Drizzle ORM**; SQL migrations in `drizzle/`
- **better-auth** for email/password login, sessions, roles and banning (admin plugin)
- Vitest (unit) and Playwright (end-to-end)

## Getting started

Requires Node 22+, pnpm and Docker.

```sh
pnpm install
pnpm db:start      # Postgres in Docker (compose.yaml)
pnpm db:migrate    # apply drizzle/ migrations
pnpm db:seed       # demo data
pnpm dev           # http://localhost:5173
```

`.env` needs `DATABASE_URL`, `ORIGIN` (e.g. `http://localhost:5173`) and `BETTER_AUTH_SECRET`
(32+ random characters, e.g. `openssl rand -base64 32`). They are declared in `src/env.ts`.

Demo users (password `Passord123!`, development only):

| User                       | Role               |
| -------------------------- | ------------------ |
| `admin@kommuneportalen.no` | Admin (Netcompany) |

`pnpm db:reset` wipes the database volume and re-runs migrations and seed.

**Test login.** While testing, `/logg-inn` shows the admin test user. Clicking it fills in the form. The panel is always on in `pnpm dev`;
a production build only shows it with `DEMO_LOGIN=true`. Never set that in production, and remove
`src/lib/server/demo-users.ts` and the picker when the portal goes live.

## Scripts

| Script                           | What it does                                                      |
| -------------------------------- | ----------------------------------------------------------------- |
| `pnpm dev`                       | Dev server                                                        |
| `pnpm build` / `pnpm preview`    | Production build / serve it locally                               |
| `pnpm start`                     | Run the built Node server (`node build`)                          |
| `pnpm check` / `pnpm lint`       | Type-check / Prettier + ESLint                                    |
| `pnpm test:unit`                 | Vitest                                                            |
| `pnpm test:e2e`                  | Playwright against a fresh `kommuneportal_test` database          |
| `pnpm db:generate --name <name>` | Create a migration from changes in `src/lib/server/db/schema.ts`  |
| `pnpm auth:schema`               | Regenerate `auth.schema.ts` after changing the better-auth config |

## How it fits together

```
src/
  hooks.server.ts          session lookup, login redirect for /admin and /profil
  lib/modules.ts           sections in the main navigation
  lib/server/
    auth.ts                better-auth config
    db/schema.ts           app tables (auth.schema.ts is generated)
    forms.ts               zod helpers + parseForm for form actions
    admin.ts               crudActions() for simple admin lists, slug helpers
    products.ts posts.ts wishes.ts   queries shared between pages
  lib/components/ui/       shadcn-svelte components (generated, add more with the CLI)
  lib/components/app/      app components (sidebar, cards, InlineEditor, ConfirmDelete …)
  routes/
    (auth)/                logg-inn (admins only)
    (app)/                 the portal, public except admin/ and profil/
      nyheter/ produkter/ onsker/ profil/
      admin/               forside, innlegg, produkter, onsker, brukere, kommuner
```

**Access control** is done once in `hooks.server.ts`, so it also covers form actions (which skip
layout loads): everything is public except `/admin/**` and `/profil`, which redirect anonymous
visitors to `/logg-inn`; `/admin/**` is 404 for logged-in non-admins.

**Users and kommuner.** Accounts are only for Netcompany admins and are created in `/admin/brukere`;
sign-up through the better-auth HTTP API is closed. Admins can change roles and ban accounts (banning
ends their sessions). The kommuner in `/admin/kommuner` are offered in the wish form.

**News types.** Posts are an Endring (release notes), Nyhet or Kampanje (`src/lib/post-kinds.ts`). The
newest kampanje is shown as a banner on the front page. Driftsmeldinger belong on the drift site, not here.

**Front page.** The welcome section at the top of `/` is the same for everyone and only admins can
change it, in `/admin/forside` (with live preview), including the key figures (kommuner, users). It is stored in `site_content` as one JSON document
per section; `readContent(key, defaults)` merges stored fields over code defaults, so more editable
sections can be added the same way. Visitors can send wishes; products, prices, purchase links, news
and campaigns are admin-only.

**Products.** The catalogue is Netcompany's service offer for Modulus Barn (rådgivning og opplæring,
arbeidsmøter, integrasjonsstøtte, migreringsstøtte); the seed holds the services and prices from the
current price deck. The portal does not sell anything: services are ordered in Toolkit, and
`/produkter#bestilling` explains how. Each product has a headline price (`priceNok`, `priceUnit`,
optionally shown as «Fra …») and a price list (`prices`, JSON groups of label/price rows). Admins edit
the list as text, one «label | price» per line, with a line without «|» starting a new group
(`src/lib/prices.ts`). Every product has a «Til bestilling» button: it opens the product's
`orderUrl` if set (external links in a new tab), otherwise the ordering guide.

**Wishlist (`/onsker`).** A postkasse: anyone can send a wish, optionally with a category and their
kommune, and nobody sees the wishes afterwards except admins. Admins see all wishes in `/admin/onsker`,
filter by category and status, manage the categories, and keep a status and an internal note per wish.

## Extending

**A new section** (own menu item):

1. Add an entry to `src/lib/modules.ts` (`label`, `href`, `icon`).
2. Create `src/routes/(app)/<href>/` with its pages.
3. Add tables to `src/lib/server/db/schema.ts` and run `pnpm db:generate --name <name>` then
   `pnpm db:migrate`.

The sidebar menu is built from the registry.

**A new simple admin list** (name plus a few fields, like kommuner or categories): define the table,
then in the page's `+page.server.ts` export `actions = crudActions(table, zodSchema)` and render
`<InlineEditor fields={…} rows={…} />`. See `src/routes/(app)/admin/kommuner/`.

**A new UI component** from shadcn-svelte: `pnpm dlx shadcn-svelte@latest add <name>`.

## Design

The look follows netcompany.com: ink `#141e1e`, deep green `#123836`, grey-green canvas `#e7ecec`
and a single coral accent `#ff6359` (hover frames, focus rings, tags), with square corners and
regular-weight headlines. All colors are shadcn tokens in `src/routes/layout.css`; the `.card-link`
class gives clickable cards the coral hover frame. Netcompany's own typeface is proprietary, so the app
uses Instrument Sans as a stand-in; swap `--font-sans` if the brand font is licensed for this product.
The logo is a placeholder mark in the Netcompany palette, not the official Netcompany logo.

## Deployment notes

- Build with `pnpm build` and run `node build` with the env vars above plus `PORT`.
- Run `pnpm db:migrate` (or `drizzle-kit migrate`) against the target database before starting.
- adapter-node 6 derives the public origin from the `Host` header and assumes HTTPS, which fits
  running behind a TLS-terminating load balancer. For a plain-HTTP host, set `kit.paths.origin`.
- Images are referenced by URL (no upload storage yet).
