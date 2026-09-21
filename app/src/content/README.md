# Content

All page copy is data, not markup. Components render whatever the loaders in `src/lib/content.ts` return.

| File                 | Drives                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------ |
| `home.json`          | Home page sections and the CTA band                                                        |
| `approach.json`      | The five-step approach, reused on Home, About and Services                                 |
| `services.json`      | The eight services: definition, coverage list, per-step notes, audiences, related services |
| `services-page.json` | Services index copy                                                                        |
| `audiences.json`     | The five audience groups and the services mapped to each                                   |
| `who-we-serve.json`  | Who we serve page copy                                                                     |
| `about.json`         | About page: intro, mission, vision, values                                                 |
| `frameworks.json`    | Frameworks section and footer slider; optional licensed `logo` slot per framework          |
| `images.json`        | Photograph manifest: file, size, alt, decorative flag, credit, placeholder status          |
| `insights.json`      | Insights page and the topic areas                                                          |
| `contact.json`       | Contact page copy and the enquiry-type options                                             |
| `legal.json`         | Privacy, Cookie, Terms and Accessibility pages                                             |

`schema.ts` defines the shape of every file (zod). Files are validated when the loader module is imported, so bad
content fails the build, not a page view. Cross-references (a service naming a related service or audience) are
checked too, so a mistyped slug cannot create a dead link.

## Moving content into the admin

Each loader (`getServices()`, `getHome()`, ...) is async and returns a schema-typed value. To make a document
admin-editable, keep the schema, store the document in Postgres (one JSON row per file, or one table per list), and
replace the loader body with an API call plus the same `schema.parse`. No component changes. Pair it with on-demand
revalidation, as PRD §12 already specifies for Insights.

Illustrations are chosen by name (`illustration`), from the fixed set in `schema.ts`, so an editor picks from a list
rather than uploading arbitrary images.

## Editorial rules enforced by tests (`tests/content.test.ts`)

- No hype vocabulary (see Design System §13).
- No fabricated-proof phrasing ("trusted by", "accredited", "award-winning", testimonials).
- ISO and SOC 2 services must state that an independent body assesses and certifies.
- Legal pages stay `reviewStatus: "draft"`, `noindex` and visibly flagged until the client approves them.

## Images and framework logos

Photographs are placed by id from `images.json`; pages name an image (for example `"image": "hero-stairs"`), and
`lib/content.ts` fails the build if an id does not exist. Every current photograph is a stock `placeholder`.
See `docs/ablin-design-system-v2.1.md` §C for how to swap one for a client-supplied asset.

A framework's `logo` is optional and renders only with both `approvedBy` and `licenceRef` set (§D).
