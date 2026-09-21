# Ablin Limited website

Marketing site for Ablin Limited. Monorepo (pnpm workspace):

- `app/` — Next.js (App Router, TypeScript strict): design system, every public page, contact form.
- `api/` — NestJS API. Placeholder only; built in a later phase.
- `docs/` — product and design documents, including the v2.1 imagery, motif and texture addendum (`docs/ablin-design-system-v2.1.md`).

## Run locally

```bash
pnpm install
pnpm dev            # http://localhost:3000
```

```bash
pnpm typecheck && pnpm lint && pnpm test          # unit: token contrast in both themes
pnpm --filter app test:e2e                        # axe (WCAG 2.2 AA), theme, menu, keyboard; needs Google Chrome
```

Configuration lives in `app/src/lib/config.ts`; copy `app/.env.example` to `app/.env.local` to override.

## Structure notes

- Colour, spacing and radius are semantic tokens in `app/src/styles/tokens.css`; components never use raw hex.
- Page copy is validated JSON in `app/src/content` behind async loaders in `app/src/lib/content.ts`; see `app/src/content/README.md` for how it moves into the admin. Copy is draft until the client brief is supplied.
- The contact form posts to `/api/contact`, which validates, applies spam controls and forwards to `CONTACT_API_URL`. Until the NestJS API exists it reports a failure instead of pretending to send.
- Legal pages are drafts: `noindex` and flagged on the page until approved. `/admin` and article URLs return 404 until their phases ship.
