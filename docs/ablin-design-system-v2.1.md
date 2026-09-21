# Ablin Limited — Design System v2.1 (imagery, motif and texture addendum)

| | |
|---|---|
| **Extends** | Design System v2.0. Palette, type system, tokens, components and the anti-pattern list all still apply. |
| **Date** | 20 September 2026 |
| **Purpose** | Add warmth, depth and craft without changing the positioning: a serious governance advisory firm, not an IT or SaaS vendor. |

> v2.0 is not in this repository (it was supplied in conversation), so this file is a standalone addendum. Section numbers here are prefixed with a letter to avoid clashing with v2.0's.

Rule of thumb: **more creative, still restrained.** Depth, not decoration. If a treatment would fit a SaaS landing page just as well, it does not belong here.

---

## A. The arch motif family

The Ablin mark is an A with an arch. Every graphic device grows from that shape. Navy family only; hairline strokes; theme-aware (all colour comes from tokens); decorative, so always `aria-hidden`.

| Motif | Component | Use |
|---|---|---|
| Arch lattice: concentric quarter arcs, radial hairline ticks, a highlighted governance path of nodes | `motifs/ArcLattice` | Home hero (behind the photograph), the "Our approach" field (quiet variant, no path) |
| Contours: topographic lines, read as a risk landscape | `motifs/Contours` | Very quiet section backdrops via `.motif-bg` |
| Arch rule: hairline divider with a small arch at the centre | `motifs/ArchRule` | Section dividers |
| Planes and scenes: layered planes, org tree, matrix, lattice, ledger | `ui/Illustration` (nine scenes) | Card headers, page heroes without a photograph |
| Framework badges: abstract glyphs | `ui/FrameworkBadge` | Frameworks section, footer slider |

**Motif tokens** (`styles/tokens.css`): `--motif-stroke` (accent; the feature colour inside the navy block), `--motif-soft` (hairline tint), `--wash` (flat tonal tint), `--grain-color`, `--grain-opacity`.

**Rules**
- Stroke 1–1.6px in the 600-unit motif space; opacity steps of 0.1 between rings; nodes 4–8px, one focus node per composition.
- Never fill a motif with a gradient. Fades use a mask, which is invisible as colour.
- One motif per section as the main event; the rest are supporting.
- Not permitted: circuit boards, binary, padlocks, shields, glowing anything.

---

## B. Texture and depth

| Device | How | Where |
|---|---|---|
| **Grain** | `.grain` class. A 112px pre-rendered noise (`public/image/grain.png`, 17 KB) used as a CSS mask, coloured by `--grain-color`. Off under `prefers-contrast: more`. | Hero, page heroes, frameworks band, approach field, CTA band |
| **Tonal panel** | `.stack` class. A flat, low-opacity navy panel offset behind an image or card (`--stack-x`, `--stack-y`). Replaces shadows. | Every photograph |
| **Motif backdrop** | `.motif-bg`, masked to fade out. | Statement section |
| **Alternating surfaces** | `--bg` / `--surface` / `--surface-2`, never two of the same adjacent. | All pages |

Grain is a static bitmap on purpose. A live SVG turbulence filter looks identical and costs far more on phones (measured: see §G).

No decorative colour gradients (v2.0 §5.2 stands). The only gradient functions used are in masks.

---

## C. Photography

**Direction.** Restrained, real, muted. Architecture and structure (stairs, facades, materials), and considered human moments (hands on a document, two people reviewing a form). Human images are allowed where they help; they must still be quiet and specific.

**Banned** (client instruction): hooded hackers, glowing padlocks, floating 3D clouds, circuit-board overlays, binary rain, stock handshakes, generic boardrooms, staged "team laughing at a laptop".

**Treatment: navy duotone, applied in CSS** (`ui/ImageSlot.module.css`). Photographs are turned into a blue monotone with CSS filter functions, then two blend layers map black to the theme's deep navy (`--duo-shadow`) and white to its pale blue (`--duo-light`). Consequences: every photograph joins the navy family, both themes have their own mapping, and swapping an image needs no image editing.

*Do not use an SVG `url()` filter for this.* It runs on the CPU and was the largest single cost on phones (§G).

**Placeholders.** All current photographs are stock from Unsplash, chosen for layout and mood. They are recorded in `src/content/images.json` with `credit` (source, URL, licence) and `status: "placeholder"`. They are stand-ins pending client-supplied photography.

**Swapping an image.** Put the file in `public/image/photo/`, update its entry in `images.json` (`src`, `width`, `height`, `alt`, `decorative`, `blur`, `credit`), and set `status: "approved"`. No component changes.

**Rules**
- Always place photographs with `ImageSlot`: it applies the frame, duotone, blur placeholder, sizing, lazy loading and alt handling.
- Only the hero image is `priority`; everything else lazy-loads.
- Decorative images use `alt=""`. Meaningful images get a specific description (no "image of").
- Strip metadata, keep each file under ~400 KB, JPEG quality ~80 at source.
- **No text over photographs.** Text sits on solid surfaces. If a future design needs text over an image, add a flat navy scrim and verify 4.5:1 in both themes.
- Only Unsplash-licence images from named photographers; never Unsplash+ or third-party contributed content.

---

## D. Frameworks section ("Frameworks we advise on")

The honest alternative to a stat bar or logo wall. Lists ISO/IEC 27001, ISO/IEC 42001, UK GDPR and DPA 2018, SOC 2 and NIST AI RMF, each with a custom badge and one line of scope.

**Framing is fixed:** advisory and readiness. The section states "We help you prepare for them, and we do not issue certificates." It never says certified, accredited, approved or partner.

**Custom badges** are abstract (rings, three nodes, a boundary, a 2×2 grid, a four-part cycle). They are deliberately not seals, rosettes or shields, so they cannot pass for an official mark.

**Logo slot.** To show an official logo, add a `logo` object to the framework in `content/frameworks.json`:

```json
"logo": { "src": "/image/logos/soc2.svg", "alt": "SOC 2 logo", "width": 96, "height": 96,
          "approvedBy": "Name of the client approver", "licenceRef": "Licence or permission reference" }
```

Full research and the conditions for showing real marks are in `docs/framework-logos-and-references.md`. The slot renders only when **every** field is present; the schema rejects a logo without `approvedBy` and `licenceRef`, and `tests/imagery.test.ts` enforces it. Until then the custom badge shows. Official standards logos require the client to hold the right to use them.

---

## E. Motion

Every rule is gated behind `prefers-reduced-motion: no-preference`. Anything not gated is a bug.

| Effect | How | Notes |
|---|---|---|
| Hero load-in | `.reveal`, staggered fade and rise | The single orchestrated moment (v2.0 §8) |
| Arc sweep | `.m-sweep`: the whole arc group rotates gently into place | One transform on one element (compositor) |
| Parallax | `.m-parallax` with CSS scroll-driven animation (`animation-timeline: scroll(root)`) | No JavaScript; ignored where unsupported |
| Reveal on scroll | `.m-reveal`, two blocks only (the statement) | Not applied to every section |

**Footer frameworks strip.** Pure CSS marquee (no JavaScript) with no visible pause button, by client request. It stops on hover, when the strip has keyboard focus (it is a focusable group), and permanently under reduced motion. WCAG 2.2.2 (AA) expects a way to pause auto-moving content; hover and focus are the only mechanisms here, so if strict AA conformance is required a visible control must return.

**Not used, on purpose:** per-stroke "draw-on" animation of SVG paths. It animates `stroke-dashoffset` on dozens of paths, which repaints on the main thread while the hero photograph is trying to paint. It cost ~13 Lighthouse points on mobile.

---

## F. Layout: calm, not rigid

- **Asymmetry and overlap:** hero photograph hangs over the tagline strip; arcs emerge from behind the photograph; the CTA photograph rises above its band; the statement photograph sits lower than its text; Who we serve interlocks its columns.
- **Editorial moments:** one large serif statement (`clamp(1.9rem, 4vw, 3.25rem)`) on an 8-column measure.
- **Cards still align.** Asymmetry belongs to section composition, not to card baselines: cards in a row share one height, and the footer link pins to the bottom (`.card`, `.card-foot`). Enforced by `tests/pages.spec.ts`.
- **Split section headers:** title left, lead right on wide screens (`SectionHeader split`).

---

## F2. Footer

Four bands, after the Rakuxon footers: columns of similar length share a band so no single column sets a row height and leaves an empty pocket beside it.

1. Brand and the one call to action (12-column grid, 7 / 4).
2. Link columns on a 3 / 6 / 3 track split: Company, Services (two balanced CSS columns), Legal.
3. The frameworks strip, full width.
4. Region and copyright.

Enforced by `tests/pages.spec.ts` (bands stack, share one width, and the link columns end within one row of each other).

## F3. Logo assets

Source: `public/image/logo-light.png`, supplied 20 September 2026. Despite its name it is the **white** artwork on transparent (mark, wordmark, tagline). The supplied `logo-dark.png` is a flat white image and is not used. All variants are derived from the white artwork: `logo-*-dark.png` are white (for dark surfaces), `logo-*-light.png` are the same artwork recoloured black (for light surfaces). Regenerate them from a higher-resolution source when one is available; the supplied artwork is only ~294px wide, which limits the social image.

## G. Performance record

Measured with Lighthouse against the production build.

| Page | Mobile (throttled) | Desktop |
|---|---|---|
| Home | 83 | 100 |
| About | 92 | – |
| Services | 90 | – |
| Service detail | 94 | – |
| Who we serve | 99 | – |
| Contact (no photographs) | 90 | – |
| Insights | 94 | – |

Accessibility, Best Practices and SEO are 100 on every page measured, mobile and desktop. Desktop performance is 100. Mobile performance on the photo-led pages is **below the 95 target** (Home 83). Mobile scores vary ±5 run to run.

What was tried, and the effect on Home mobile: removing the SVG duotone filter (+12), replacing per-stroke draw-on with one sweep (+10), CSS-mask grain instead of a turbulence filter, dropping the header backdrop blur, lazy-loading form validation (zod) so the Contact chunk stops weighing on other pages, lower hero image quality. `content-visibility: auto` on below-fold sections gave no measurable gain and was reverted.

What remains is mostly framework cost: Contact, which has no photographs, still scores 90 on mobile, so hydration and font loading set a ceiling near 90 before imagery is counted. Options if 95 on mobile is required: reduce hydrated components, replace the variable Source Serif 4 (opsz axis) with a static subset, and trim the Home hero to a smaller image.

---

## H. Checklist for anything new

1. Navy family and tokens only; no raw hex.
2. Works in light and dark (screenshot both).
3. Decorative graphics `aria-hidden`; meaningful images have alt text.
4. Motion gated behind `prefers-reduced-motion: no-preference`; compositor properties only (`transform`, `opacity`).
5. No proof claims, no certificate wording, no banned imagery.
6. Cards in a row equal height; footers pinned.
7. Run the axe, alignment and motion tests; check Lighthouse on mobile.
