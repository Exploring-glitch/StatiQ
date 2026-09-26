// Shared company-profile helpers (no external deps).

export const slugify = (name) =>
  String(name || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// Client mirror of the server allowlist sanitizer — defense in depth.
// Server is authoritative; this keeps previews safe from pasted markup.
export function sanitizeHtml(html) {
  let out = String(html || '').slice(0, 50000);
  out = out.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '');
  out = out.replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  const allowed = new Set([
    'p', 'br', 'b', 'strong', 'i', 'em', 'u', 's', 'strike', 'span',
    'h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote', 'hr', 'a', 'div',
  ]);
  // Span styles that survive: sizes, alignment AND bold/italic/underline.
  // (WYSIWYG/pasted markup leans on these; anything else is dropped.)
  // NOTE: filter needs a predicate function — passing the regex itself
  // throws "TypeError: object is not a function".
  const keepStyle = /^(font-size\s*:\s*[\d.]+(px|pt|em|rem|%)|text-align\s*:\s*(left|center|right)|font-weight\s*:\s*(bold|bolder|[1-9]00)|font-style\s*:\s*(italic|oblique)|text-decoration(-line)?\s*:\s*(underline|line-through)(\s+(underline|line-through))?)$/i;
  out = out.replace(/<\/?([a-z0-9]+)(\s[^<>]*)?\/?>/gi, (m, tag, attrs = '') => {
    const t = String(tag).toLowerCase();
    const closing = m.startsWith('</');
    if (!allowed.has(t)) return '';
    if (closing) return `</${t}>`;
    if (t === 'span') {
      const style = /style\s*=\s*("[^"]*"|'[^']*')/i.exec(attrs || '');
      if (style) {
        const picks = style[1].slice(1, -1).split(';').map((s) => s.trim())
          .filter((s) => keepStyle.test(s));
        return picks.length ? `<span style="${picks.join('; ')}">` : '<span>';
      }
      return '<span>';
    }
    if (t === 'a') {
      const href = /href\s*=\s*("[^"]*"|'[^']*')/i.exec(attrs || '');
      if (href) {
        const url = href[1].slice(1, -1).trim();
        if (/^(https?:\/\/|mailto:|#)/i.test(url)) {
          return `<a href="${url.replace(/"/g, '&quot;')}" target="_blank" rel="noreferrer">`;
        }
      }
      return '<a>';
    }
    return `<${t}>`;
  });
  return out;
}

export const initials = (name) =>
  String(name || '?').trim().charAt(0).toUpperCase() || '?';

export const companyLink = (c) => `/companies/${encodeURIComponent(c?.slug || slugify(c?.name || c?.company || ''))}`;
