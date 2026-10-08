// Smart list splitting for employer free-text areas (responsibilities,
// requirements, nice-to-haves, benefits, interview steps).
//
// Users separate items with blank-line gaps, numbered markers
// ("1. xyz 2. xyz" / "1) xyz"), or bullet markers (• - * ·).
// A single item may itself span 2-3 lines: single newlines inside a
// gap/number/bullet group are joined with a space, so the role page
// always renders clean dot bullets no matter how items were separated.

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
    // Gaps win: blank line = new item, single newlines join continuation lines.
    parts = t.split(/\n\s*\n+/);
  } else if (/(^|\s)\d{1,3}[.)]\s+\S/.test(t)) {
    // Numbers: "1. xyz 2. xyz" inline or at line starts.
    parts = t.split(/(?=(?:^|\s)\d{1,3}[.)]\s+\S)/m);
  } else if (/[•·▪◦○]/.test(t)) {
    // Dots: split on the bullet char itself or newlines.
    parts = t.split(/[•·▪◦○]+|\n+/);
  } else {
    // No explicit separators — one item per line so legacy
    // one-per-line input keeps working.
    parts = t.split(/\n+/);
  }
  return parts.map(clean).filter(Boolean).slice(0, max);
}

// Accepts stored arrays or raw strings. Array elements stay whole unless
// they themselves contain gaps/numbers/bullets (then they expand).
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

// Re-join stored items for the edit form: blank lines round-trip through
// the gap rule, so multi-line items survive edit → save unchanged.
export function joinListItems(arr) {
  return Array.isArray(arr) ? arr.join('\n\n') : '';
}
