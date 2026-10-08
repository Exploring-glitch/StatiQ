// Mirror of server/lib/lists.js — smart splitting for employer textareas.
// Users separate items with blank-line gaps, numbers ("1. xyz 2. xyz"),
// or bullets (• - *). Multi-line items are joined; viewing always shows dots.

const LEAD_MARKER = /^\s*(?:\d{1,3}[.)]\s+|[-*•·▪◦○–—]\s+)+/;

const stripMarker = (s) => String(s ?? '').replace(LEAD_MARKER, '').trim();

const clean = (s) => stripMarker(String(s ?? '').replace(/\s+/g, ' '));

const hasStructure = (s) =>
  /\n\s*\n/.test(s) || /(^|\s)\d{1,3}[.)]\s+\S/.test(s) || /[•·▪◦○]/.test(s);

export function splitTextBlob(text, max = 30) {
  const t = String(text ?? '').replace(/\r\n?/g, '\n');
  if (!t.trim()) return [];
  let parts;
  if (/\n\s*\n/.test(t)) {
    parts = t.split(/\n\s*\n+/);
  } else if (/(^|\s)\d{1,3}[.)]\s+\S/.test(t)) {
    parts = t.split(/(?=(?:^|\s)\d{1,3}[.)]\s+\S)/m);
  } else if (/[•·▪◦○]/.test(t)) {
    parts = t.split(/[•·▪◦○]+|\n+/);
  } else {
    parts = t.split(/\n+/);
  }
  return parts.map(clean).filter(Boolean).slice(0, max);
}

export function splitListItems(input, max = 30) {
  if (Array.isArray(input)) {
    const out = [];
    for (const el of input) {
      if (el == null) continue;
      const s = String(el);
      if (!s.trim()) continue;
      if (hasStructure(s)) out.push(...splitTextBlob(s, max));
      else {
        const c = clean(s);
        if (c) out.push(c);
      }
    }
    return out.filter(Boolean).slice(0, max);
  }
  return splitTextBlob(input, max);
}

export function joinListItems(arr) {
  return Array.isArray(arr) ? arr.join('\n\n') : '';
}
