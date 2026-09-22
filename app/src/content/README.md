# Content

Most page copy has moved to the admin-editable block store in Redis — see
[`src/admin/README.md`](../admin/README.md) for the full picture, including the block→component mapping. What's
left here is "master data" the block editor references by slug/id rather than owns, plus the handful of pinned,
non-block sections the closed block palette has no block for (`src/admin/README.md`'s "Pinned sections").

| File              | Drives                                                                                                                                                                                                                             |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `approach.json`   | The five-step approach, referenced by `approachSteps` blocks on Home, About and Services                                                                                                                                           |
| `services.json`   | The eight services: definition, coverage list, per-step notes, audiences, related services — referenced by slug from `capabilityGrid`/`serviceList` blocks and from `services/[service]`, which is not block-driven                |
| `audiences.json`  | The five audience groups and the services mapped to each — referenced by slug from `audienceGrid` blocks                                                                                                                           |
| `frameworks.json` | The five frameworks' starting content only — the live copy is admin-edited at `/admin/frameworks` and lives in Redis (`settings:frameworks`); see `admin/README.md` §Frameworks. This file is now read only by `cms/seed-data.ts`. |
| `images.json`     | Stock-photograph manifest (file, size, alt, decorative flag, credit, placeholder status), reused by `cms/seed-data.ts` for the starting content until an admin uploads a real photo                                                |
| `home.json`       | Pinned: the Home page's "no articles yet" Insights teaser                                                                                                                                                                          |
| `about.json`      | Pinned: the About page's Mission/Vision cards                                                                                                                                                                                      |
| `insights.json`   | Pinned: the Insights page's topic/empty-state copy (also reused by `home.json`'s teaser)                                                                                                                                           |
| `contact.json`    | The Contact page in full — it carries no blocks at all                                                                                                                                                                             |

`schema.ts` defines the shape of every file (zod). Files are validated when the loader module (`lib/content.ts`)
is imported, so bad content fails the build, not a page view. Cross-references among these files (a service
naming a related service or audience) are checked at that point too; a block's references (e.g. a
`capabilityGrid` item's `serviceSlug`) are instead checked at save time, by `cms/validate-blocks.ts`, since they
live in Redis, not here.

## Editorial rules enforced by tests (`tests/content.test.ts`)

- No hype vocabulary (see Design System §13).
- No fabricated-proof phrasing ("trusted by", "accredited", "award-winning", testimonials).
- ISO and SOC 2 services must state that an independent body assesses and certifies.
- Legal pages (now `textRich` blocks — see `cms/seed-data.ts`) stay flagged `draft`, `noindex` and visibly
  marked until the client approves them (checked via `cms/BlockRenderer.tsx`'s `getLegalReviewStatus`).

## Images and framework logos

`images.json` photographs are placed by id (for example `"image": "hero-stairs"`); `lib/content.ts` fails the
build if an id a pinned section still references does not exist. A block's `image` field instead carries the
photo directly (a Cloudinary URL, or — for the seeded starting content — one of these same stock photos by its
site-relative path; see `cms/image.ts`). Every stock photograph is a `placeholder`; see
`docs/ablin-design-system-v2.1.md` §C for how to swap one for a client-supplied asset.

A framework's `logo` is optional and renders only with both `approvedBy` and `licenceRef` set (§D).
