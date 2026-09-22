# Admin dashboard

> **Deviation from the PRD:** the data store is **Upstash Redis** (`@upstash/redis`), not PostgreSQL. This
> supersedes the PRD's Postgres section for all admin-editable content, auth, submissions and settings. The
> PRD/design-system documents have not been rewritten to reflect this — this note is the record of the decision.

A single-admin, no-roles, no-versioning content editor bolted onto the existing Next.js site. It edits a closed
palette of content blocks that map 1:1 onto components that already existed in `src/components`; it cannot
produce a page the design system doesn't already support.

## Layout

- `src/cms/` — the data layer shared by the admin and the public site: Redis client (`redis.ts`), key builders
  (`keys.ts`), zod schemas for every stored document and block (`schema.ts`), the Redis access functions
  (`store.ts`), the rich-text renderer and allow-list (`richtext.tsx`), the block→component mapper
  (`BlockRenderer.tsx`), the reference-integrity check run at save time (`validate-blocks.ts`), and the bundled
  starting content every page falls back to before Redis is seeded (`seed-data.ts`).
- `src/admin/` — everything specific to the dashboard itself: auth (`auth/`), route handler bodies
  (`handlers/`), upload signing (`upload/`), and the editor UI (`ui/`).
- `src/app/admin/` — the admin pages. `admin/login` and `admin/reset` stand alone; everything else is nested
  under `admin/(dashboard)/`, which wraps it in the sidebar shell (`admin/ui/AdminShell.tsx`).
- `src/app/api/admin/` — the Route Handlers listed in the build brief, each a thin wrapper around a
  `admin/handlers/*.ts` function, matching the pattern the rest of this project already uses for `/api/contact`
  (see `src/lib/contact-handler.ts`).
- `src/middleware.ts` — the single edge gate: availability first, then the admin session check, in that order.

## Block → component mapping

Every block type maps onto exactly one existing public component (or, for the couple of layouts that were never
their own named component — a page's "catalogue" service grid, the "rows" audience layout, the About "values"
grid — the exact JSX that page used to have inline, moved into `BlockRenderer.tsx` unchanged). The editor
(`admin/ui/BlockFields.tsx`) only ever edits the `data` object typed by `cms/schema.ts`; it never touches markup.

| Block type       | Variant     | Renders                                                             | Data                                                                                  |
| ---------------- | ----------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `hero`           | `home`      | `HeroSignal` + `TaglineStrip`                                       | eyebrow, title, lead, primary/secondary CTA, frameworks strip                         |
|                  | `page`      | `PageHero`                                                          | kicker, title, lead, illustration, optional photo                                     |
| `capabilityGrid` | —           | `Capabilities`                                                      | title, lead, 1+ items (title, description, service link, illustration)                |
| `serviceList`    | `overview`  | `ServicesOverview`                                                  | kicker, title, lead, service slugs                                                    |
|                  | `catalogue` | inline (ex-Services page markup)                                    | title, lead, service slugs                                                            |
| `approachSteps`  | —           | `Approach`                                                          | kicker, title, lead, exactly 5 steps                                                  |
| `audienceGrid`   | `teaser`    | `WhoWeServe`                                                        | kicker, title, lead, photo, audience slugs                                            |
|                  | `rows`      | inline (ex-Who We Serve page markup)                                | title, lead, audience slugs                                                           |
| `whyList`        | `cards`     | `WhyAblin`                                                          | title, lead, illustration, 3+ points                                                  |
|                  | `cells`     | inline (ex-About values markup)                                     | title, lead, 3+ items                                                                 |
| `frameworkIndex` | —           | `FrameworkBand`                                                     | title, lead, note, framework ids (empty = all)                                        |
| `textRich`       | `split`     | inline, `blocks.prose` (ex-About intro markup)                      | heading, Tiptap doc                                                                   |
|                  | `document`  | inline, `blocks.legal` (replaces the old `LegalDocument` component) | title, lead, updated, review status, Tiptap doc (split into sections at each heading) |
| `image`          | —           | `ImageSlot` in a `<figure>`                                         | Cloudinary/local image, alt, caption, ratio                                           |
| `ctaBand`        | —           | `CtaBand`                                                           | title, body, primary/secondary CTA, optional photo                                    |

`textRich` is the only block that produces markup beyond a direct prop pass-through, and only within a fixed
allow-list of node/mark types (`cms/richtext.tsx`), enforced both by the Tiptap editor's own configuration and,
independently, server-side at save time — so a saved document can never contain anything the renderer doesn't
already know how to turn into existing, styled markup.

## Pinned sections

The closed block palette doesn't cover a handful of sections that existed before the migration and have no
natural block shape (a fixed two-card pair, an always-present contact form, an empty-state-or-article-list). Per
the build brief's explicit "do NOT build a generic page builder" instruction, these stay as fixed template code
rather than becoming an 11th block type:

- **Home**'s Insights teaser (`components/home/InsightsTeaser.tsx`), sourced from `content/home.json`.
- **About**'s Mission/Vision cards, sourced from `content/about.json`.
- **Contact** carries no blocks at all — the form and its aside are fixed; only its SEO fields are edited via
  `page:contact`.
- **Insights** (`/insights`)'s topic/empty-state card, or — once at least one article is published — a real
  article list, sourced from `content/insights.json` and `insights:index`.

Each pinned section renders at a fixed position relative to the page's blocks (documented in the page's own
`page.tsx`), so it can't end up in an unexpected spot even though the blocks around it are freely reorderable.

## Drafting

The Redis schema given for `page:{slug}` and `insights:article:{slug}` has no version history and one `blocks`
array — reasonable, since there's no multi-admin conflict to resolve, but it means a raw overwrite of `blocks`
would put a half-finished edit live immediately. Both documents gain one optional `draft` field holding a staged
copy of the editable fields:

- **Pages** always exist and are always `published` (there's no "create a page" flow — the ten slugs are fixed).
  `PUT .../pages/:slug` with `publish: false` writes into `draft`; `publish: true` writes straight to the live
  fields and clears `draft`.
- **Articles** start `draft` (status field) with no nested `draft` object — there's nothing public to protect
  yet, so `PUT` writes the live fields directly. Once `POST .../publish` has run at least once, a further `PUT`
  stages into the nested `draft` object instead, and a further `POST .../publish` promotes it without disturbing
  `publishedAt`. `POST .../unpublish` clears `publishedAt` entirely; publishing again after that sets a fresh one
  — there's no memory of the original date, matching "no versioning".

## What this doesn't do

Everything the build brief listed under "Explicitly do NOT build": no roles or permissions, no multi-admin, no
version history, no audit trail, no scheduled publishing, no open/generic page builder, no new visual component.
