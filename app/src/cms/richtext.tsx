import { Fragment, type ReactNode } from 'react';
import { isSafeHref } from '@/lib/safe-href';
import type { RichDoc, RichNode } from './schema';

/**
 * Renders a Tiptap document as the same plain markup `blocks.prose`/`blocks.legal` already style (see
 * `content/schema.ts`'s LegalDocument/About usage) — no new CSS, and no `dangerouslySetInnerHTML` anywhere.
 *
 * Only the node/mark types listed below are rendered; anything else is dropped rather than guessed at. The
 * admin's Tiptap editor (admin/ui/RichTextEditor.tsx) is configured to be able to produce only this same set, so
 * in practice nothing is ever dropped — this is the server-side half of that guarantee, not a formatting choice.
 */

function renderMarks(text: string, marks: RichNode['marks'], key: string): ReactNode {
  return (marks ?? []).reduce<ReactNode>((node, mark, index) => {
    const markKey = `${key}-m${index}`;
    switch (mark.type) {
      case 'bold':
        return <strong key={markKey}>{node}</strong>;
      case 'italic':
        return <em key={markKey}>{node}</em>;
      case 'link': {
        const href = typeof mark.attrs?.href === 'string' ? mark.attrs.href : '';
        if (!isSafeHref(href)) return node;
        const external = href.startsWith('https://');
        return (
          <a
            key={markKey}
            href={href}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {node}
          </a>
        );
      }
      default:
        return node;
    }
  }, text);
}

function renderInline(nodes: RichNode[] | undefined, key: string): ReactNode {
  return (nodes ?? []).map((node, index) => {
    const nodeKey = `${key}-${index}`;
    if (node.type === 'text')
      return <Fragment key={nodeKey}>{renderMarks(node.text ?? '', node.marks, nodeKey)}</Fragment>;
    if (node.type === 'hardBreak') return <br key={nodeKey} />;
    return null;
  });
}

function renderBlock(node: RichNode, key: string): ReactNode {
  switch (node.type) {
    case 'paragraph': {
      const inline = renderInline(node.content, key);
      // An empty paragraph (just pressing Enter) would render as a collapsed, invisible <p></p>; skip it.
      if (!node.content || node.content.length === 0) return null;
      return <p key={key}>{inline}</p>;
    }
    case 'heading': {
      const level = node.attrs?.level === 3 ? 3 : 2;
      const inline = renderInline(node.content, key);
      return level === 3 ? <h3 key={key}>{inline}</h3> : <h2 key={key}>{inline}</h2>;
    }
    case 'bulletList':
      return (
        <ul key={key} className="check-list">
          {(node.content ?? []).map((item, i) => (
            <li key={`${key}-li${i}`}>
              {renderInline(item.content?.[0]?.content, `${key}-li${i}`)}
            </li>
          ))}
        </ul>
      );
    case 'orderedList':
      return (
        <ol
          key={key}
          style={{
            display: 'grid',
            gap: 'var(--space-2)',
            paddingLeft: '1.25em',
            listStyle: 'decimal',
          }}
        >
          {(node.content ?? []).map((item, i) => (
            <li key={`${key}-li${i}`}>
              {renderInline(item.content?.[0]?.content, `${key}-li${i}`)}
            </li>
          ))}
        </ol>
      );
    default:
      return null;
  }
}

export function RichText({ doc }: { doc: RichDoc }) {
  return <>{doc.content.map((node, i) => renderBlock(node, `n${i}`))}</>;
}

/** Plain-text extract of a document — used for the article excerpt fallback and SEO description generation. */
export function richTextToPlain(doc: RichDoc): string {
  const parts: string[] = [];
  function walk(node: RichNode) {
    if (node.type === 'text' && node.text) parts.push(node.text);
    for (const child of node.content ?? []) walk(child);
    if (node.type === 'paragraph' || node.type === 'heading') parts.push(' ');
  }
  for (const node of doc.content) walk(node);
  return parts.join('').replace(/\s+/g, ' ').trim();
}

// ---------------------------------------------------------------------------------------------------------------
// Server-side allow-list. The zod schema (schema.ts) already constrains the JSON *shape*; this additionally
// constrains *which* node/mark types and href schemes are accepted, independent of whatever the client sent.
// ---------------------------------------------------------------------------------------------------------------

const ALLOWED_NODES = new Set([
  'doc',
  'paragraph',
  'heading',
  'text',
  'bulletList',
  'orderedList',
  'listItem',
  'hardBreak',
]);
const ALLOWED_MARKS = new Set(['bold', 'italic', 'link']);

/**
 * Splits a document at its H2 headings into LegalDocument-shaped sections, for the textRich "document" variant
 * (legal pages). Content before the first H2 is dropped — legal pages have always opened straight into sections.
 */
export function splitLegalSections(doc: RichDoc): { heading: string; body: RichDoc }[] {
  const sections: { heading: string; body: RichDoc }[] = [];
  for (const node of doc.content) {
    if (node.type === 'heading') {
      const headingText = (node.content ?? []).map((c) => c.text ?? '').join('');
      sections.push({ heading: headingText, body: { type: 'doc', content: [] } });
      continue;
    }
    const current = sections.at(-1);
    if (current) current.body.content.push(node);
  }
  return sections;
}

export function isRichDocSafe(doc: RichDoc): boolean {
  function walk(node: RichNode): boolean {
    if (!ALLOWED_NODES.has(node.type)) return false;
    for (const mark of node.marks ?? []) {
      if (!ALLOWED_MARKS.has(mark.type)) return false;
      if (mark.type === 'link') {
        const href = mark.attrs?.href;
        if (typeof href !== 'string' || !isSafeHref(href)) return false;
      }
    }
    for (const child of node.content ?? []) {
      if (!walk(child)) return false;
    }
    return true;
  }
  return walk(doc);
}
