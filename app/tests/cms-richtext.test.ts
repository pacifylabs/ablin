import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { RichText, isRichDocSafe, richTextToPlain, splitLegalSections } from '@/cms/richtext';
import type { RichDoc } from '@/cms/schema';

function doc(...content: RichDoc['content']): RichDoc {
  return { type: 'doc', content };
}
function p(text: string, marks?: { type: string; attrs?: Record<string, unknown> }[]) {
  return { type: 'paragraph', content: [{ type: 'text', text, marks }] };
}
function h2(text: string) {
  return { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text }] };
}

describe('isRichDocSafe', () => {
  it('accepts a document built only from the allowed nodes and marks', () => {
    const d = doc(h2('Heading'), p('Body', [{ type: 'bold' }]), {
      type: 'bulletList',
      content: [{ type: 'listItem', content: [p('item')] }],
    });
    expect(isRichDocSafe(d)).toBe(true);
  });

  it('rejects a node type outside the allow-list (e.g. a code block)', () => {
    const d = doc({ type: 'codeBlock', content: [{ type: 'text', text: 'rm -rf /' }] });
    expect(isRichDocSafe(d)).toBe(false);
  });

  it('rejects a mark type outside the allow-list (e.g. strike)', () => {
    const d = doc(p('x', [{ type: 'strike' }]));
    expect(isRichDocSafe(d)).toBe(false);
  });

  it('rejects a link with an unsafe scheme', () => {
    const d = doc(p('click me', [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }]));
    expect(isRichDocSafe(d)).toBe(false);
  });

  it('accepts https, mailto and site-relative links', () => {
    for (const href of ['https://example.com', 'mailto:a@example.com', '/contact', '#section']) {
      expect(isRichDocSafe(doc(p('x', [{ type: 'link', attrs: { href } }])))).toBe(true);
    }
  });
});

describe('RichText', () => {
  it('renders bold text as a real <strong>, not a styled span', () => {
    const html = renderToStaticMarkup(RichText({ doc: doc(p('hello', [{ type: 'bold' }])) }));
    expect(html).toContain('<strong>hello</strong>');
  });

  it('drops an unsafe link rather than rendering it', () => {
    const html = renderToStaticMarkup(
      RichText({ doc: doc(p('go', [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }])) }),
    );
    expect(html).not.toContain('<a');
    expect(html).toContain('go');
  });

  it('skips an empty paragraph instead of rendering a collapsed <p></p>', () => {
    const html = renderToStaticMarkup(RichText({ doc: doc({ type: 'paragraph' }) }));
    expect(html).not.toContain('<p');
  });
});

describe('richTextToPlain', () => {
  it('extracts readable plain text from a document', () => {
    expect(richTextToPlain(doc(h2('Title'), p('Body text.')))).toContain('Title');
    expect(richTextToPlain(doc(h2('Title'), p('Body text.')))).toContain('Body text.');
  });
});

describe('splitLegalSections', () => {
  it('splits a document into one section per H2, dropping content before the first heading', () => {
    const d = doc(p('preamble, dropped'), h2('One'), p('a'), h2('Two'), p('b'), p('c'));
    const sections = splitLegalSections(d);
    expect(sections.map((s) => s.heading)).toEqual(['One', 'Two']);
    expect(sections[0]!.body.content).toHaveLength(1);
    expect(sections[1]!.body.content).toHaveLength(2);
  });
});
