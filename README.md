# Kommuneportalen for Modulus Barn

Customer and community portal for the kommuner that use Modulus Barn, the barnevern solution from
the DigiBarnevern project, delivered by Netcompany. It is not the case-management system itself: it is
where the people who use and manage Modulus Barn follow what has changed (release notes, news,
driftsmeldinger), browse new modules, courses and services (each with a link to where it is ordered),
help each other in a forum, and send wishes for further development, which the kommuner prioritise
together. Netcompany admins manage all content from `/admin`.

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

| User                              | Role                    |
| --------------------------------- | ----------------------- |
| `admin@kommuneportalen.no`        | Admin (Netcompany)      |
| `kari.nordmann@bergen.kommune.no` | Kommune user, Bergen    |
| `ola.hansen@tromso.kommune.no`    | Kommune user, Tromsø    |
| `sara.berg@trondheim.kommune.no`  | Kommune user, Trondheim |
| `jonas.lie@bodo.kommune.no`       | Kommune user, Bodø      |

`pnpm db:reset` wipes the database volume and re-runs migrations and seed.

**Test logins.** While testing, `/logg-inn` shows four test users (admin, barnevernleder,
saksbehandler, systemansvarlig). Clicking one fills in the form. The panel is always on in `pnpm dev`;
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
  hooks.server.ts          session lookup, login redirect, /admin and module gating
  lib/modules.ts           sections in the main navigation
  lib/server/
    auth.ts                better-auth config
    db/schema.ts           app tables (auth.schema.ts is generated)
    forms.ts               zod helpers + parseForm for form actions
    admin.ts               crudActions() for simple admin lists, slug helpers
    forum.ts products.ts posts.ts   queries shared between pages
  lib/components/ui/       shadcn-svelte components (generated, add more with the CLI)
  lib/components/app/      app components (sidebar, cards, InlineEditor, ConfirmDelete …)
  routes/
    (auth)/                logg-inn, registrer
    (app)/                 everything behind login
      nyheter/ forum/ produkter/ onsker/ profil/
      admin/               innlegg, produkter, forum, foresporsler, brukere, kommuner, moduler
```

**Access control** is done once in `hooks.server.ts`, so it also covers form actions (which skip
layout loads): anonymous users are redirected to `/logg-inn` and `/admin/**` is 404 for non-admins.
Ownership rules (edit your own forum posts, see and withdraw your own wishes) are checked in each
action and load.

**Users and kommuner.** Each user belongs to at most one kommune (`user.municipality_id`). Users
register themselves at `/registrer`; if the kommune has an email domain set, the address must match
it. Sign-up through the better-auth HTTP API is disabled so this check can't be skipped. Admins can
create users, move them between kommuner, change roles and ban them (banning ends their sessions).

**News types.** Posts are an Endring (release notes), Nyhet, Driftsmelding or Kampanje (`src/lib/post-kinds.ts`).
The newest driftsmelding from the last 14 days is shown as a notice at the top of the front page, and the
newest kampanje as a banner.

**Front page.** The welcome section at the top of `/` is the same for everyone and only admins can
change it, in `/admin/forside` (with live preview), including the key figures (kommuner, users). It is stored in `site_content` as one JSON document
per section; `readContent(key, defaults)` merges stored fields over code defaults, so more editable
sections can be added the same way. Members can write forum posts and send wishes; products, prices,
purchase links, news and campaigns are admin-only.

**Products.** The portal does not sell anything. Each product can have a purchase link (`orderUrl`) to
wherever the kommune actually orders it; external links open in a new tab. Without a link the product
says «Kontakt oss for mer informasjon».

**Wishlist (`/onsker`).** Separate from the forum. Members send wishes, optionally with a category,
and only ever see their own. Admins see all wishes in `/admin/onsker`, filter by category and status,
manage the categories, and set a status and reply that the author sees on their wishlist. Authors can
withdraw a wish until an admin has started on it.

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
