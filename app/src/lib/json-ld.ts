/**
 * Serialises JSON-LD for a <script type="application/ld+json"> tag. JSON.stringify does not escape U+003C, so a
 * string value containing "</script>" would break out of the tag; this replaces "<" with the JSON escape \u003c.
 */
export function jsonLdScriptContent(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
