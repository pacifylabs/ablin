# Framework logos and references

**Decision recorded 20 September 2026.** The "Frameworks we advise on" section names each framework precisely and links to its authoritative page. It does not display the standards bodies' logos or certification marks. This file records why, what would change it, and how.

## What each body says (primary sources)

| Framework | Body | What the body's own terms say |
|---|---|---|
| ISO/IEC 27001, ISO/IEC 42001 | ISO | Only ISO, its members and its technical committees may use the ISO logo and short name. Others must not use or copy the logo, and must not say they or their services are endorsed, approved or certified by ISO. ISO does not certify; a certified organisation displays its **certification body's** mark. ([ISO name and logo](https://www.iso.org/iso-name-and-logo.html), [ISO help: can I use the ISO logo?](https://help.iso.org/en/articles/375997-can-i-use-the-iso-logo)) |
| SOC 2 | AICPA | The SOC for Service Organizations logo may be used by a service organisation that has received a SOC 1, 2 or 3 report from a licensed CPA (unqualified opinion since September 2023), for twelve months after the report date. ([AICPA SOC logo guidelines](https://www.aicpa-cima.com/resources/download/soc-for-service-organizations-logo-guidelines-for-service-organization)) |
| NIST AI RMF | NIST | Logo and name permissions are granted for specific programmes (for example NVLAP-accredited laboratories and FIPS 140-3 validated modules). There is no permission for citing a framework. ([NIST standards-related authorizations](https://www.nist.gov/sco/nist-standards-related-authorizations)) |
| UK GDPR, DPA 2018 | UK Parliament, ICO | Legislation, not a scheme: there is no logo to display. The ICO publishes a register of fee payers; a firm can link to its own entry once it has one. ([ICO register of fee payers](https://ico.org.uk/about-the-ico/what-we-do/register-of-fee-payers/)) |

## Why this matters for Ablin specifically

Ablin advises and prepares organisations. It is not, on the evidence available, ISO-certified, SOC 2 attested, or a NIST programme participant. A body's logo on Ablin's site would read to a visitor as "Ablin holds this", which is the fabricated-proof risk in PRD §5, and in most cases it would also breach the body's trademark terms.

Naming a standard is different: describing what you advise on, and linking to the source, is ordinary factual reference.

## What the section does instead

Each card gives the framework's exact name, scope, publisher and edition, and links to the official page (`content/frameworks.json`: `publisher`, `edition`, `sources`). Every framework must have at least one https source (schema and `tests/imagery.test.ts`).

## What would legitimately allow real marks

Marks are shown only for something Ablin actually holds. Each needs its own permission, recorded in the `logo` slot (`src`, `alt`, `width`, `height`, `approvedBy`, `licenceRef`; all six required).

- **Ablin's own ISO certification**, if Ablin certifies its own management system: the certification body's mark, under that body's guidelines.
- **A SOC 2 report issued to Ablin**: the AICPA SOC logo, under the AICPA licence terms and the twelve-month window.
- **A partner or membership scheme Ablin has joined** (for example a certification-body consultant scheme): that scheme's mark, under its terms.
- **Individual credentials** held by named staff (for example ISO 27001 Lead Implementer): only as statements about those people, with their agreement, and only if true.

Do not add a `logo` for any framework on the strength of the framework alone.
