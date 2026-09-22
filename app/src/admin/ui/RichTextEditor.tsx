'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { useState } from 'react';
import type { RichDoc } from '@/cms/schema';
import styles from './admin.module.css';

/**
 * Tiptap, restricted to exactly the node/mark set `cms/richtext.tsx` knows how to render on the public site
 * (paragraphs, two heading levels, bold, italic, links, bullet/numbered lists). Every other StarterKit
 * extension — blockquote, code, code block, horizontal rule, strike, underline — is switched off, so the editor
 * cannot produce markup the design system has no styling for.
 */
export function RichTextEditor({
  value,
  onChange,
  ariaLabel,
}: {
  value: RichDoc;
  onChange: (doc: RichDoc) => void;
  ariaLabel: string;
}) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        blockquote: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
        strike: false,
        underline: false,
        heading: { levels: [2, 3] },
        link: { openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer' } },
      }),
    ],
    content: value as object,
    onUpdate: ({ editor: e }) => onChange(e.getJSON() as RichDoc),
  });

  if (!editor) return null;

  function openLinkPrompt() {
    const existing = editor?.getAttributes('link').href as string | undefined;
    setLinkUrl(existing ?? 'https://');
    setLinkOpen(true);
  }

  function applyLink() {
    const href = linkUrl.trim();
    if (href) editor?.chain().focus().extendMarkRange('link').setLink({ href }).run();
    setLinkOpen(false);
  }

  function removeLink() {
    editor?.chain().focus().unsetLink().run();
    setLinkOpen(false);
  }

  return (
    <div>
      <div className={styles.richToolbar} role="toolbar" aria-label={`${ariaLabel} formatting`}>
        <ToolbarButton
          label="Bold"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          B
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          I
        </ToolbarButton>
        <ToolbarButton
          label="Heading 2"
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          label="Heading 3"
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </ToolbarButton>
        <ToolbarButton
          label="Bullet list"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          •
        </ToolbarButton>
        <ToolbarButton
          label="Numbered list"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1.
        </ToolbarButton>
        <ToolbarButton label="Link" active={editor.isActive('link')} onClick={openLinkPrompt}>
          Link
        </ToolbarButton>
      </div>
      {linkOpen ? (
        <div className={styles.formActions} style={{ padding: 'var(--space-2) 0' }}>
          <input
            type="url"
            className={styles.input}
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://, mailto: or /page"
            aria-label="Link URL"
            style={{ maxWidth: '22rem' }}
          />
          <button
            type="button"
            className={styles.iconBtn}
            style={{ width: 'auto', padding: '0 0.75rem' }}
            onClick={applyLink}
          >
            Apply
          </button>
          {editor.isActive('link') ? (
            <button
              type="button"
              className={styles.iconBtn}
              style={{ width: 'auto', padding: '0 0.75rem' }}
              onClick={removeLink}
            >
              Remove
            </button>
          ) : null}
          <button
            type="button"
            className={styles.iconBtn}
            style={{ width: 'auto', padding: '0 0.75rem' }}
            onClick={() => setLinkOpen(false)}
          >
            Cancel
          </button>
        </div>
      ) : null}
      <div className={styles.richContent} aria-label={ariaLabel}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function ToolbarButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={styles.iconBtn}
      style={{ width: 'auto', padding: '0 0.6rem' }}
      data-active={active}
      aria-pressed={active}
      aria-label={label}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
