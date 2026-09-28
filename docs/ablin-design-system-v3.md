# Ablin Limited — Design System v3 ("Framed Architecture")

Supersedes v1, v2 and v2.1. Reference sample: `ablin-homepage-redesign.html`.
Applies to every public page and to the admin block renderer. Where this doc and older docs disagree, this doc wins.

---

## 1. Direction

A blend of two references, held to the client brief:

- **From reference A (light editorial):** framed, rounded hero image inset from the page edge; big confident sans headings; fact row beside the About copy; a row of marks under it; a horizontal service carousel with photo cards; the "how we work" split with an image, a circular CTA badge and an icon list.
- **From reference B (navy immersive):** a dark navy photo hero; glass-navy panels that overlap the hero's bottom edge into the white page; a split "overview" section with a large photo.
- **From our own work:** the faint interactive node lattice over the hero photo (approved earlier), calm buttons that never move, strict palette.

The page reads as a professional advisory firm: architectural photography, navy, white space, one dark moment at the top and one at the bottom (contact band).

---

## 2. Colour (client palette only)

No new hues. Every colour below is a brand colour or a tint/shade of navy `#1C4E8B`.

### Brand constants
| Token | Hex | Use |
|---|---|---|
| `--navy` | `#1C4E8B` | primary buttons, badge, links (light), brand fills |
| `--navy-deep` | `#143A69` | hover, contact band (light) |
| `--navy-ink` | `#0E2747` | hero base, photo overlays |
| `--white` | `#FFFFFF` | page (light), text on navy |
| `--grey-dark` | `#2C2C2C` | body text (light) |
| `--grey-light` | `#F3F5F8` | alternating sections (light) |

### Semantic tokens
| Token | Light | Dark |
|---|---|---|
| `--bg` | `#FFFFFF` | `#0C1626` |
| `--surface` | `#F3F5F8` | `#111E33` |
| `--panel` | `#FFFFFF` | `#14233A` |
| `--text` | `#2C2C2C` | `#D2DAE5` |
| `--heading` | `#13233A` | `#F1F4F8` |
| `--muted` | `#5A6474` | `#95A2B5` |
| `--line` | `#E3E8EF` | `#21324B` |
| `--line-strong` | `#CCD5E1` | `#2E4463` |
| `--link` | `#1C4E8B` | `#9BBBE6` |
| `--btn-bg` / `--btn-hover` | `#1C4E8B` / `#143A69` | `#1C4E8B` / `#2A5E9E` |
| `--band` | `#143A69` | `#0A1424` |
| `--band-text` / `--band-muted` | `#FFFFFF` / `#BFD0E6` | `#F1F4F8` / `#95A9C6` |
| `--chip` | `#EEF2F7` | `#172A45` |
| `--focus` | `#1C4E8B` | `#9BBBE6` |

Rules:
- Components read tokens only. No raw hex in components except the hero and capability panels, which are always navy in both themes (they sit on a photo).
- No gradients as decoration. Gradients are allowed only as photo overlays (hero shade, image bottom fade).
- Status colours for forms only: success `#2E7D5B` / `#4FB183`, error `#C0392B` / `#E06A5C`.
- Contrast: body ≥ 4.5:1, large text ≥ 3:1, verified in both themes and over every photo.

### Theme mechanism
- Default follows `prefers-color-scheme`. Header toggle sets `data-theme` on `<html>` and persists to localStorage.
- An inline `<head>` script applies the saved theme before first paint.
- Admin setting `settings:site.defaultTheme` = `system | light | dark` controls the default.

---

## 3. Typography (applies to every page)

| Role | Face | Size | Weight | Line-height | Tracking |
|---|---|---|---|---|---|
| Display (hero H1) | Manrope | `clamp(2.5rem, 5.4vw, 4.6rem)` | 800 | 1.01 | −0.035em |
| H2 section | Manrope | `clamp(1.9rem, 3.6vw, 2.9rem)` | 700 | 1.06 | −0.025em |
| H3 card / list title | Manrope | 1.1–1.22rem | 700 | 1.25 | −0.015em |
| Fact number | Manrope | `clamp(2.6rem, 5vw, 3.8rem)` | 700 | 1 | −0.04em, tabular |
| Lead | Instrument Sans | `clamp(1.02rem, 1.3vw, 1.14rem)` | 400 | 1.65 | 0 |
| Body | Instrument Sans | 17px | 400 | 1.65 | 0 |
| Small / meta | Instrument Sans | 0.84–0.93rem | 400–500 | 1.5 | 0 |
| Eyebrow | Instrument Sans | 0.82rem | 600 | 1.4 | 0, sentence case, navy |

- Load both via `next/font/google` (self-hosted, `display: swap`, subset latin). Remove Source Serif 4 and Hanken Grotesk from the project.
- Headings use `text-wrap: balance`. Body measure ≤ 65ch.
- Sentence case everywhere. Title Case only for CTA labels the client wrote in Title Case ("Explore Our Services", "Speak to Our Consultants", "Request a Consultation", "Discuss Your Requirements").
- The only letter-spaced caps are the logo tagline and the small "UNITED KINGDOM" hero tag.

---

## 4. Layout, spacing, shape

- Container 1240px. Gutter `clamp(16px, 4vw, 40px)`. Section padding `clamp(72px, 9vw, 128px)`.
- Spacing scale (px): 4, 8, 12, 16, 20, 24, 32, 40, 56, 72, 96, 128. Use `gap` on flex/grid, not per-element margins.
- Radius by role, not one radius everywhere:
  - `--r-sm 10px` inputs · `--r-md 16px` photo cards, overlays · `--r-lg 24px` large photos, panel group · `--r-xl 32px` hero frame, contact band · `999px` buttons, chips, badge.
- Shadows only on: capability panel group, circular badge, fixed admin toggle, primary button hover glow. Nowhere else.
- Breakpoints: 600 / 1000 / 1240. At ≤1000 all two-column sections stack; capability panels stack; mobile menu appears.

---

## 5. Imagery

- **Style:** architectural photography only. Facades, glass curtain walls, stairs, towers from below, cityscape horizons. Cool daylight, blue sky, clean geometry. Consistent with the existing `/image/photo/*` set (zigzag-stairs, light-stairs, glass-facade).
- **Banned:** padlocks, hooded hackers, circuit boards, binary, glowing globes, handshakes, people-at-laptops stock, gradients pretending to be tech.
- **Treatment:** no filters on body photos. The hero photo always gets the navy shade overlay (left-to-right `rgba(10,26,50,.92) → transparent` plus a bottom fade).
- **Delivery:** Cloudinary (`f_auto,q_auto`, width transforms) through `next/image` with a Cloudinary loader. Every image has `alt` managed in admin; decorative images use `alt=""`.
- **Ratios:** hero free (content-sized), service cards 4:5, approach image 4:5, overview image fills its column (min 520px desktop, 420px tablet).
- **Sources for initial seed:** the existing repo photos plus Unsplash architectural images (licence allows commercial use). Record the source URL in the media library `credit` field. Client can replace any image in admin.

---

## 6. Logo

- Keep the client's existing files: `/image/logo-wordmark-light.png` (for dark backgrounds) and `/image/logo-wordmark-dark.png` (for light backgrounds). Swap by theme with CSS, not JS.
- Header height 78px, logo height ~36px. Footer uses the same asset.
- Logo files are admin-managed (`settings:site.logoLight`, `logoDark`, `favicon`).

---

## 7. Components

Every component below is a block type or a global. Each renders only from admin data.

### 7.1 Header (global)
Sticky, 86% bg with blur, bottom hairline. Logo left; six nav links; primary CTA pill; theme toggle (round icon button). ≤1000px: burger opens a disclosure panel (`aria-expanded`, closes on link click and Esc).

### 7.2 Buttons
| Variant | Where | Style |
|---|---|---|
| `primary` | light surfaces | navy fill, white text, pill |
| `white` | on navy/photo | white fill, heading text |
| `ghost-white` | on navy/photo | 1px white 45% border |
| `line` | light surfaces, secondary | 1px `--line-strong` |

Hover changes colour and adds a soft glow on primary/white. **Buttons never move, scale or follow the cursor.** Optional trailing arrow icon (SVG) only on the primary hero CTA.

### 7.3 Hero — `heroFramed`
Rounded 32px frame inset by the gutter, 20px below the header. Layers bottom-up: photo (Cloudinary) → lattice canvas (screen blend, 55% opacity, cursor-proximity brighten, paused off-screen, static frame on reduced motion) → navy shade → copy. Copy left, max 840px: eyebrow with short rule, H1 (max 15ch), lead, two CTAs. Small letter-spaced location tag top-right. Bottom padding leaves room for the overlapping panels.

### 7.4 Capability panels — `capabilityPanels`
Three navy glass panels (`rgba(20,58,105,.93)` + blur) joined into one group, radius 24px, overlapping the hero by −120px (−90px mobile). Each: line icon, H3, text, "View service" link. Hover deepens to brand navy. Stack on ≤1000px.

### 7.5 About + facts — `aboutIntro` + `factStrip`
Two columns. Left: eyebrow, H2, two lead paragraphs. Right: 2×2 fact grid (number + label).
**Integrity rule:** facts must be true, client-approved counts. Default seed uses service-structure counts (3 capability areas, 8 services, 5 frameworks, 5 steps). Never years, clients, projects or percentages unless the client supplies them.

### 7.6 Framework strip — `frameworkStrip`
Hairline top and bottom. Row of line-icon marks with name + short descriptor, muted, heading colour on hover. Caption below: "Advisory and readiness support only…". Optional real partner/certification logos only when the client uploads and approves them (admin field `approvedByClient: true` required to render).

### 7.7 Service carousel — `serviceCarousel`
Header row: eyebrow, H2, lead left; prev/next round buttons right (next is filled). Track: CSS scroll-snap, 4 cards visible at 1240px, 78% card width on mobile, scrollbar hidden, keyboard focusable. Card: 4:5 photo with a white code pill (GRC, ISO…), H3, one-line summary, "View service →". Hover: photo scales 1.04 (transform on the image only). Cards come from the `services` collection.

### 7.8 Approach — `approachSplit`
Two columns. Left: heading block, then a 4:5 photo with a 148px navy circular badge overlapping its top-right corner linking to Contact. Right: ordered list of five steps; each row has a 52px dark circle with the step number (01–05), H3, text, hairline between rows. Numbers are correct here because the steps are a real sequence.

### 7.9 Audience split — `audienceList` + image
`--surface` background. Left: heading, list of five audiences (bold title, muted line, hairline). Right: tall photo with a floating panel at the bottom: short question, one line, "Discuss Your Requirements" button.

### 7.10 Why grid — `whyGrid`
3×2 hairline grid. First cell is the heading block on `--surface`; the five reasons fill the rest. Line icon, H3, text.

### 7.11 Insights — `topicList` / `articleGrid`
Two columns: heading + lead left, topic chips right. When articles exist, an `articleGrid` block shows three latest cards (16:9 photo, topic, title, date, excerpt). Never render placeholder articles on the live site.

### 7.12 Contact band — `contactBand`
`--band` panel, radius 32px, two columns: heading, sub, three check-list lines (client-approved text) on the left; form on the right. Faint concentric ring decoration top-right (CSS only). Form fields: full name, work email, organisation, enquiry type (select, options from admin), message, consent. Labels always visible. Inline errors in plain language. Honeypot hidden field.

### 7.13 Footer (global)
Four columns: logo + tagline + one-line description; Company; Services; Legal. Bottom row: copyright, region.

### 7.14 Other page templates
- **Inner page header — `pageHeader`:** smaller framed photo banner (min 320px) with eyebrow, H1 (`clamp(2.2rem,4.4vw,3.6rem)`), lead, optional breadcrumb.
- **Service detail:** pageHeader → richText "What this covers" as a two-column checklist → approachSteps (compact) → related services (3 cards) → contactBand.
- **Legal:** pageHeader (no photo, `--surface`) → richText at 760px.
- **Availability pages** (coming soon / under construction): full-height navy frame with the lattice, logo, headline, message, contact email. All text from admin.

### 7.15 Cookie banner
Bottom-left card (not full-width bar), panel colour, Accept / Reject / Preferences. Analytics load only after Accept. Text from admin.

---

## 8. Motion
- One load sequence: hero eyebrow, H1, lead, CTAs rise 16px and fade in, 80ms stagger. Content is fully visible if the animation doesn't run.
- Lattice: slow drift, cursor proximity brightening, pause off-screen and on hidden tab.
- Hovers: colour and shadow only (150–250ms). Card photo zoom 1.04 over 700ms.
- No scroll-triggered reveals, no parallax on body sections, no magnetic or moving buttons.
- `prefers-reduced-motion`: no load animation, lattice drawn once, no photo zoom, instant carousel scroll.

---

## 9. Admin coverage map ("nothing unmanaged")

Every visible string, link, image and list on the public site comes from Redis via admin. Nothing is hardcoded in components.

### Globals (singletons)
| Key | Fields |
|---|---|
| `settings:site` | siteName, tagline, logoLight, logoDark, favicon, defaultTheme, siteUrl, locale |
| `settings:navigation` | header items (label, href, order), header CTA (label, href), mobile menu mirrors header |
| `settings:footer` | description, columns (title, links[]), legal links, copyright text, region |
| `settings:seo` | default title template, default description, default OG image, Organization JSON-LD fields, Search Console verification |
| `settings:contact` | enquiry types[], recipient email(s), success message, error messages, consent text, auto-reply on/off + text |
| `settings:cookies` | banner text, button labels, GA4 ID |
| `settings:availability` | mode, headline, message, contact line (per mode) |
| `settings:errors` | 404 and 500 heading, text, links |

### Collections
| Key | Fields |
|---|---|
| `services` | slug, code pill, title, summary, card image, detail blocks[], SEO, order |
| `frameworks` | name, descriptor, icon (from a fixed icon set) or uploaded logo, `approvedByClient`, order |
| `topics` | name, slug, order |
| `insights` | existing article model |
| `media` | Cloudinary publicId, url, alt, credit, width, height |

### Pages (`page:{slug}`)
home, about, services, who-we-serve, insights (index intro), contact, privacy-policy, cookie-policy, terms-of-use, accessibility, coming-soon, under-construction. Each = SEO fields + ordered blocks from the closed palette.

### Closed block palette
`pageHeader, heroFramed, capabilityPanels, aboutIntro, factStrip, frameworkStrip, serviceCarousel, approachSplit, approachSteps, audienceList, splitImage, whyGrid, valuesGrid, missionVision, topicList, articleGrid, richText, image, ctaBand, contactBand`

Every block also stores: `anchorId`, `background` (`bg | surface | band`), `visible` (bool). Admin can reorder, hide, duplicate and edit blocks; it cannot add styling.

---

## 10. Accessibility and quality floor
WCAG 2.2 AA. Skip link. One H1 per page. Visible focus (`--focus`, 2px, offset 3px). Keyboard-operable carousel, menu, toggle, form. Alt text on every content image. Contrast checked over photos in both themes. Lighthouse ≥ 95 on Home and a service page. Canonical, OG and sitemap use `settings:site.siteUrl` (never localhost).

---

## 11. Do not ship
- Any hue outside the client palette and its navy tints.
- Stats, client logos, testimonials, certification badges or "trusted by" rows the client has not supplied.
- Generic tech imagery.
- Moving buttons, scroll-reveal on every section, hover-lift on every card.
- Hardcoded copy in components.
- Serif display faces (removed in v3).