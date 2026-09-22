# Ablin Limited website

Marketing site for Ablin Limited. Monorepo (pnpm workspace):

- `app/` — the whole product: a single Next.js project (App Router, TypeScript strict). Pages, contact form and its server-side delivery all live here; there is no separate backend.
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

Configuration is read only in `app/src/lib/config.ts`; copy `app/.env.example` to `app/.env.local` and fill it in.

## Structure notes

- Colour, spacing and radius are semantic tokens in `app/src/styles/tokens.css`; components never use raw hex.
- Page copy is validated JSON in `app/src/content` behind async loaders in `app/src/lib/content.ts`; see `app/src/content/README.md` for how it moves into the admin. Copy is draft until the client brief is supplied.
- The contact form posts to the Next.js route handler `/api/contact`, which validates, applies spam controls and emails the enquiry through Resend (`RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`). If any is missing it reports a failure instead of pretending to send.
- Legal pages are drafts: `noindex` and flagged on the page until approved. `/admin` and article URLs return 404 until their phases ship.
