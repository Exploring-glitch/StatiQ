import { useEffect, useRef } from 'react';
import { sanitizeHtml } from '../lib/companies';

// Lightweight WYSIWYG editor (contentEditable, no deps).
// Toolbar: bold, italic, underline, strikethrough, H1/H2, font size -/+,
// bullets, numbers, quote, align, link, clear formatting.
// What you type is exactly what seekers see (HTML + whitespace preserved).
export default function RichTextEditor({ value, onChange, placeholder = 'Tell candidates what makes this company special…', minHeight = 220 }) {
  const ref = useRef(null);
  const lastEmitted = useRef('');

  // Sync external value (e.g. loaded draft) without clobbering caret.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const next = String(value || '');
    if (next !== lastEmitted.current && next !== el.innerHTML && document.activeElement !== el) {
      el.innerHTML = next;
    }
  }, [value]);

  const emit = () => {
    const html = ref.current?.innerHTML || '';
    lastEmitted.current = html;
    onChange?.(html);
  };

  const cmd = (command, arg = null) => {
    ref.current?.focus();
    document.execCommand('styleWithCSS', false, 'true');
    document.execCommand(command, false, arg);
    emit();
  };

  const fontSize = (dir) => {
    ref.current?.focus();
    // execCommand fontSize uses 1-7 scale; map current selection up/down.
    const sel = window.getSelection();
    const node = sel?.anchorNode?.parentElement;
    const current = Number(node?.closest('font')?.getAttribute('size') || 3);
    const next = Math.min(7, Math.max(1, current + dir));
    document.execCommand('fontSize', false, String(next));
    // Normalize <font size> → span with px so rendering is consistent.
    const px = { 1: '12px', 2: '14px', 3: '16px', 4: '20px', 5: '24px', 6: '30px', 7: '36px' }[next];
    ref.current?.querySelectorAll(`font[size="${next}"]`).forEach((f) => {
      const s = document.createElement('span');
      s.style.fontSize = px;
      s.innerHTML = f.innerHTML;
      f.replaceWith(s);
    });
    emit();
  };

  const addLink = () => {
    const url = window.prompt('Link URL (https://…)', 'https://');
    if (url) cmd('createLink', url);
  };

  const btn = 'rounded-md border border-white/10 bg-panel2 px-2 py-1 text-xs font-semibold text-neutral-200 hover:border-accent hover:text-white';
  const sep = <span aria-hidden="true" className="mx-0.5 h-4 w-px bg-white/10" />;

  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-panel2 focus-within:border-accent/60">
      <div className="flex flex-wrap items-center gap-1 border-b border-white/10 bg-panel p-2" role="toolbar" aria-label="Formatting options">
        <button type="button" className={btn} title="Bold (Ctrl+B)" onClick={() => cmd('bold')}><b>B</b></button>
        <button type="button" className={btn} title="Italic (Ctrl+I)" onClick={() => cmd('italic')}><i>I</i></button>
        <button type="button" className={btn} title="Underline (Ctrl+U)" onClick={() => cmd('underline')}><u>U</u></button>
        <button type="button" className={btn} title="Strikethrough" onClick={() => cmd('strikeThrough')}><s>S</s></button>
        {sep}
        <button type="button" className={btn} title="Heading" onClick={() => cmd('formatBlock', 'h2')}>H</button>
        <button type="button" className={btn} title="Normal text" onClick={() => cmd('formatBlock', 'p')}>¶</button>
        <button type="button" className={btn} title="Decrease text size" onClick={() => fontSize(-1)}>A−</button>
        <button type="button" className={btn} title="Increase text size" onClick={() => fontSize(1)}>A+</button>
        {sep}
        <button type="button" className={btn} title="Bullet list" onClick={() => cmd('insertUnorderedList')}>• List</button>
        <button type="button" className={btn} title="Numbered list" onClick={() => cmd('insertOrderedList')}>1. List</button>
        <button type="button" className={btn} title="Quote" onClick={() => cmd('formatBlock', 'blockquote')}>❝</button>
        {sep}
        <button type="button" className={btn} title="Align left" onClick={() => cmd('justifyLeft')}>⇤</button>
        <button type="button" className={btn} title="Align center" onClick={() => cmd('justifyCenter')}>⇔</button>
        <button type="button" className={btn} title="Add link" onClick={addLink}>🔗</button>
        <button type="button" className={btn} title="Clear formatting" onClick={() => cmd('removeFormat')}>✕</button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label="Company overview"
        data-placeholder={placeholder}
        onInput={emit}
        onBlur={() => onChange?.(sanitizeHtml(ref.current?.innerHTML || ''))}
        className="company-richtext min-w-0 px-3.5 py-3 text-sm leading-relaxed text-white outline-none"
        style={{ minHeight, whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}
      />
      <p className="border-t border-white/5 px-3 py-1.5 text-[11px] text-neutral-500">
        Tip: line breaks and spacing are kept exactly as you type — what you see here is what candidates see.
      </p>
    </div>
  );
}
