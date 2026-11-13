# Kommuneportalen

Customer and community portal for the kommuner that use Modulus Barn: SvelteKit, shadcn-svelte, Postgres with
Drizzle, better-auth. `README.md` has the stack, the setup and how the code fits together. Text on the site is
Norwegian (bokmål); code, docs, commits and pull requests are English.

## The gate

`pnpm check && pnpm lint && pnpm test` passes before a pull request is marked ready: zero errors, zero warnings.
`pnpm test` runs Vitest and Playwright, which needs this checkout's Postgres up (`pnpm db:start`).

## Workflow

The owner and their agents work here, several at once. One piece of work is one issue, one worktree, one branch and
one pull request.

1. **Issue first.** Look for the concern in `gh issue list` and `gh pr list` and join it when it is there; otherwise
   `gh issue create`. Skip the issue only when the user says so.
2. **Claim it.** `gh issue edit <n> --add-assignee @me` and a comment saying what you take. An issue someone else
   holds is theirs; ask on it before touching what it names.
3. **Own worktree.** Never work in the main checkout: it stays on `main` and is only used to pull and to clean up.

   ```sh
   git fetch origin
   git worktree add --no-track ../kommuneportal-<n>-<slug> -b feat/<n>-<slug> origin/main
   cd ../kommuneportal-<n>-<slug> && pnpm install
   ```

   Branches are `feat/<n>-<slug>` or `fix/<n>-<slug>`; this overrides any global branch naming. Stay inside your own
   worktree and never edit the main checkout or another one. `git worktree list` shows what else is in flight.

4. **Shared ground.** Before changing `schema.ts`, `drizzle/`, `hooks.server.ts` or `scripts/seed.ts`, check what
   the other open branches touch (`git diff --name-only origin/main...<branch>`) and tell the user about overlap.
   Two branches that both generate a migration clash in `drizzle/meta/`: the one merged second regenerates its
   migration on the new `main`.
5. **Stay in scope.** A finding outside the issue becomes a new issue, never a change folded in.
6. **Commits** are one line of at most 72 characters: `#<n>: <what the change does>`. Git reads a leading `#` as a
   comment when it reopens a message, so amend and rebase with `--cleanup=verbatim`.
7. **Pull request.** Push the first commit with `git push -u origin HEAD` and open a draft at once:
   `gh pr create --draft --base main`, with the body `Closes #<n>` and one short paragraph. When the user says the
   work is done: `git fetch origin && git rebase origin/main`, get the gate clean, `git push --force-with-lease`,
   `gh pr ready`.
8. **Only the owner merges.** Nothing is pushed to `main`, and an agent never merges a pull request.
9. **Clean up** after the merge: `docker compose down -v` in the worktree, then from the main checkout
   `git pull --ff-only`, `git worktree remove ../kommuneportal-<n>-<slug>` and `git branch -d <branch>`.

Reach GitHub with `gh`; the GitHub MCP on this machine points at another host. The repository is public: never
commit a secret, a personal address or a machine path. `.env` stays local.

## Several worktrees at once

Every worktree runs its own Postgres and dev server on its own slot `n`: Postgres on `5432 + n`, the dev server on
`5173 + n`. Take the lowest `n` from 1 that no other worktree's `.env` uses and nothing listens on
(`lsof -nP -iTCP:<port> -sTCP:LISTEN`). The ports live in the worktree's own `.env`, copied from `.env.example`,
never from another checkout:

```sh
cp .env.example .env
# set PGPORT=543n, the same port in DATABASE_URL, ORIGIN=http://localhost:517n,
# BETTER_AUTH_SECRET=$(openssl rand -base64 32)
pnpm db:start && pnpm db:migrate && pnpm db:seed
pnpm dev --port 517n --strictPort
```

Docker names the container and volume after the worktree's folder, so `pnpm db:reset` touches only this worktree's
database. `ORIGIN` must match the dev server's port or login fails. Playwright always serves on port 4173, so only one
worktree runs `pnpm test` at a time.
