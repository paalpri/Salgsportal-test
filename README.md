# Kommuneportalen

Customer portal for kommuner that use the barnevern system. Kommune staff sign in to read news and
campaigns, help each other in a forum, browse products and collect them in a shared shopping list that
they send to us as a quote request. Admins manage all content from `/admin`.

The UI is in Norwegian (bokmål); code and docs are in English.

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
| `admin@kommuneportalen.no`        | Admin                   |
| `kari.nordmann@bergen.kommune.no` | Kommune user, Bergen    |
| `ola.hansen@tromso.kommune.no`    | Kommune user, Tromsø    |
| `sara.berg@trondheim.kommune.no`  | Kommune user, Trondheim |
| `jonas.lie@bodo.kommune.no`       | Kommune user, Bodø      |

`pnpm db:reset` wipes the database volume and re-runs migrations and seed.

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
  lib/modules.ts           registry of feature modules (nav, dashboard shortcuts, toggles)
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
      nyheter/ forum/ produkter/ handleliste/ profil/
      admin/               innlegg, produkter, forum, foresporsler, brukere, kommuner, moduler
```

**Access control** is done once in `hooks.server.ts`, so it also covers form actions (which skip
layout loads): anonymous users are redirected to `/logg-inn`, `/admin/**` is 404 for non-admins, and
routes of a disabled module are 404 for members. Ownership rules (edit your own forum posts, your own
kommune's shopping list) are checked in each action.

**Users and kommuner.** Each user belongs to at most one kommune (`user.municipality_id`). Users
register themselves at `/registrer`; if the kommune has an email domain set, the address must match
it. Sign-up through the better-auth HTTP API is disabled so this check can't be skipped. Admins can
create users, move them between kommuner, change roles and ban them (banning ends their sessions).

**Shopping list and requests.** The list is shared by everyone in a kommune. Sending it creates a
quote request with a copy of product names and prices, and empties the list. Admins set a status and
reply in `/admin/foresporsler`; the kommune sees both on its shopping list page.

## Extending

**A new feature module** (own menu item, can be switched off in `/admin/moduler`):

1. Add an entry to `src/lib/modules.ts` (`key`, `label`, `description`, `href`, `icon`).
2. Create `src/routes/(app)/<href>/` with its pages.
3. Add tables to `src/lib/server/db/schema.ts` and run `pnpm db:generate --name <name>` then
   `pnpm db:migrate`.

Navigation, dashboard shortcuts, the toggle and 404 gating come from the registry.

**A new simple admin list** (name plus a few fields, like kommuner or categories): define the table,
then in the page's `+page.server.ts` export `actions = crudActions(table, zodSchema)` and render
`<InlineEditor fields={…} rows={…} />`. See `src/routes/(app)/admin/kommuner/`.

**A new UI component** from shadcn-svelte: `pnpm dlx shadcn-svelte@latest add <name>`.

## Deployment notes

- Build with `pnpm build` and run `node build` with the env vars above plus `PORT`.
- Run `pnpm db:migrate` (or `drizzle-kit migrate`) against the target database before starting.
- adapter-node 6 derives the public origin from the `Host` header and assumes HTTPS, which fits
  running behind a TLS-terminating load balancer. For a plain-HTTP host, set `kit.paths.origin`.
- Images are referenced by URL (no upload storage yet).
