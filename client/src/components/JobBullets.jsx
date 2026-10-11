import { groupListItems } from '../lib/lists';

// Grouped bullet (or numbered) list for job detail sections. Plain points
// render as one list; a "Heading:" line starts a bold subheading with its
// own indented bullets underneath — e.g. Compensation & Equity → salary,
// equity, 401(k) lines. Pre-heading posts are flat arrays, so they render
// exactly as before.
export default function JobBullets({ items = [], ordered = false }) {
  const blocks = [];
  let plain = [];
  groupListItems(items).forEach((g, i) => {
    if (typeof g === 'string') {
      plain.push(g);
    } else {
      if (plain.length) {
        blocks.push({ type: 'plain', points: plain, key: `p${i}` });
        plain = [];
      }
      blocks.push({ type: 'head', heading: g.heading, points: g.points, key: `h${i}` });
    }
  });
  if (plain.length) blocks.push({ type: 'plain', points: plain, key: 'tail' });

  const List = ordered ? 'ol' : 'ul';
  const marker = ordered ? 'list-decimal' : 'list-disc';

  return (
    <div>
      {blocks.map((b) =>
        b.type === 'plain' ? (
          <List key={b.key} className={`mt-2 list-outside space-y-1 pl-5 text-sm text-neutral-400 ${marker}`}>
            {b.points.map((r, i) => (
              <li key={`${r}-${i}`}>{r}</li>
            ))}
          </List>
        ) : (
          <div key={b.key} className="mt-3 first:mt-2">
            <p className="text-[13px] font-semibold text-neutral-100">{b.heading}:</p>
            {b.points.length > 0 && (
              <List className={`mt-1 list-outside space-y-1 pl-5 text-sm text-neutral-400 ${marker}`}>
                {b.points.map((r, i) => (
                  <li key={`${r}-${i}`}>{r}</li>
                ))}
              </List>
            )}
          </div>
        ),
      )}
    </div>
  );
}
