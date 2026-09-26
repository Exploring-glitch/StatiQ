import mongoose from 'mongoose';

export function slugify(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'company';
}

// Minimal HTML sanitizer for rich-text overview (bold/italic/underline,
// headings, lists, sizes). Strips scripts, event handlers, unsafe URLs.
export function sanitizeCompanyHtml(html) {
  let out = String(html || '').slice(0, 50000);
  // Drop script/style blocks entirely.
  out = out.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '');
  // Drop event-handler attributes and javascript: URLs.
  out = out.replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  out = out.replace(/(href|src)\s*=\s*("|')\s*javascript:[^"']*\2/gi, '$1=$2#$2');
  // Allowlist tags; everything else is unwrapped (children kept).
  const allowed = new Set([
    'p', 'br', 'b', 'strong', 'i', 'em', 'u', 's', 'strike', 'span',
    'h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote', 'hr', 'a', 'div',
  ]);
  // Span styles that survive: sizes, alignment AND bold/italic/underline.
  // (WYSIWYG/pasted markup leans on these; anything else is dropped.)
  const keepStyle = /^(font-size\s*:\s*[\d.]+(px|pt|em|rem|%)|text-align\s*:\s*(left|center|right)|font-weight\s*:\s*(bold|bolder|[1-9]00)|font-style\s*:\s*(italic|oblique)|text-decoration(-line)?\s*:\s*(underline|line-through)(\s+(underline|line-through))?)$/i;
  out = out.replace(/<\/?([a-z0-9]+)(\s[^<>]*)?\/?>/gi, (m, tag, attrs = '') => {
    const t = String(tag).toLowerCase();
    const closing = m.startsWith('</');
    if (!allowed.has(t)) return '';
    if (closing) return `</${t}>`;
    if (t === 'span') {
      const style = /style\s*=\s*("[^"]*"|'[^']*')/i.exec(attrs || '');
      if (style) {
        const css = style[1].slice(1, -1);
        // NOTE: filter needs a predicate function — passing the regex
        // itself throws "TypeError: object is not a function".
        const picks = css
          .split(';')
          .map((s) => s.trim())
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
    if (t === 'div') return '<div>';
    return `<${t}>`;
  });
  return out;
}

const personSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: '', maxlength: 80 },
    title: { type: String, trim: true, default: '', maxlength: 120 },
    bio: { type: String, trim: true, default: '', maxlength: 2000 },
    photoUrl: { type: String, trim: true, default: '', maxlength: 500 },
  },
  { _id: false }
);

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Company name is required'], trim: true, maxlength: 120 },
    slug: { type: String, trim: true, lowercase: true, maxlength: 100 },
    logoUrl: { type: String, trim: true, default: '', maxlength: 500 },
    tagline: { type: String, trim: true, default: '', maxlength: 160 },
    bio: { type: String, trim: true, default: '', maxlength: 500 },
    // Rich overview: HTML (rendered as written, whitespace preserved via CSS)
    // plus a plain-text mirror for search.
    overviewHtml: { type: String, default: '' },
    overviewText: { type: String, default: '' },
    employeeCount: { type: Number, min: 0, max: 1000000, default: null },
    companySize: {
      type: String,
      enum: ['', '1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
      default: '',
    },
    website: { type: String, trim: true, default: '', maxlength: 300 },
    companyType: {
      type: String,
      enum: ['', 'Startup', 'SME', 'Enterprise', 'Nonprofit', 'Agency', 'Government'],
      default: '',
    },
    industry: { type: String, trim: true, default: '', maxlength: 120 },
    location: { type: String, trim: true, default: '', maxlength: 160 },
    foundedYear: { type: Number, min: 1800, max: 2100, default: null },
    founder: { type: personSchema, default: () => ({}) },
    team: { type: [personSchema], default: [] },
    culture: {
      remotePolicy: {
        type: String,
        enum: ['', 'On-site', 'Hybrid', 'Remote-friendly', 'Remote-first'],
        default: '',
      },
      values: { type: [String], default: [] },
      benefits: { type: [String], default: [] },
      description: { type: String, trim: true, default: '', maxlength: 5000 },
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

companySchema.pre('validate', async function (next) {
  if (!this.slug && this.name) {
    const base = slugify(this.name);
    let slug = base;
    let n = 1;
    // Keep slugs unique; same brand owned twice gets -2, -3, ...
    while (await mongoose.model('Company').exists({ slug, _id: { $ne: this._id } })) {
      n += 1;
      slug = `${base}-${n}`.slice(0, 100);
    }
    this.slug = slug;
  }
  if (this.overviewHtml) {
    this.overviewHtml = sanitizeCompanyHtml(this.overviewHtml);
    this.overviewText = this.overviewHtml
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 5000);
  } else {
    this.overviewText = '';
  }
  next();
});

companySchema.index({ slug: 1 }, { unique: true, sparse: true });
companySchema.index({ name: 'text', industry: 'text', overviewText: 'text', location: 'text' });

export default mongoose.model('Company', companySchema);
