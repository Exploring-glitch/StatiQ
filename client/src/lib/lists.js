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

// Headed groups: an item ending in ":" is a heading, and the plain items
// after it (until the next heading or the end) are its sub-points. This lets
// employers write e.g. "Compensation & Equity:" + bullets while the server
// keeps storing plain string arrays — zero schema change, and posts saved
// before headings existed render exactly as before.
export const isHeadingItem = (s) => {
  const t = String(s ?? '').trim();
  return t.length > 1 && /:\s*$/.test(t);
};

const stripTrailingColons = (s) => String(s ?? '').trim().replace(/:+\s*$/, '');

// Flat strings (or a raw pasted blob) → Array<string | { heading, points }>.
export function groupListItems(input, max = 30) {
  const flat = Array.isArray(input)
    ? input.map((x) => String(x ?? '').trim()).filter(Boolean)
    : splitListItems(input, max);
  const out = [];
  let i = 0;
  while (i < flat.length) {
    const cur = flat[i];
    if (isHeadingItem(cur)) {
      const heading = stripTrailingColons(cur);
      const points = [];
      i++;
      while (i < flat.length && !isHeadingItem(flat[i])) {
        points.push(flat[i]);
        i++;
      }
      if (heading) out.push({ heading, points });
    } else {
      out.push(cur);
      i++;
    }
  }
  return out.slice(0, max);
}

// Grouped items → flat strings for the API ("Heading:" + its points).
// A group with an empty heading degrades to its plain points — nothing lost.
export function flattenListItems(items, max = 30) {
  const out = [];
  for (const it of Array.isArray(items) ? items : []) {
    if (it && typeof it === 'object') {
      const heading = String(it.heading ?? '').trim().replace(/\s+/g, ' ');
      if (heading) out.push(`${heading}:`);
      for (const p of Array.isArray(it.points) ? it.points : []) {
        const s = String(p ?? '').trim().replace(/\s+/g, ' ');
        if (s) out.push(s);
      }
    } else {
      const s = String(it ?? '').trim().replace(/\s+/g, ' ');
      if (s) out.push(s);
    }
  }
  return out.slice(0, max);
}

// Total storable lines (heading + sub-points each count toward the 30 max).
export function countListItems(items) {
  return flattenListItems(items, Infinity).length;
}
