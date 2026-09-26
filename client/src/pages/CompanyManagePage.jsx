import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, fileUrl } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import RichTextEditor from '../components/RichTextEditor';

const input = 'w-full rounded-lg border border-white/10 bg-panel2 px-3.5 py-2.5 text-sm text-white placeholder:text-neutral-500 outline-none transition focus:border-accent/70 focus:ring-2 focus:ring-accent/20';
const label = 'mb-1.5 block text-xs font-semibold text-neutral-300';
const card = 'rounded-xl border border-white/10 bg-panel p-5 sm:p-6';

const blankPerson = { name: '', title: '', bio: '', photoUrl: '' };
const blank = {
  name: '', logoUrl: '', tagline: '', bio: '', overviewHtml: '',
  employeeCount: '', companySize: '', website: '', companyType: '', industry: '', location: '', foundedYear: '',
  founder: { ...blankPerson }, team: [],
  culture: { remotePolicy: '', values: [], benefits: [], description: '' },
  newValue: '', newBenefit: '',
};

// Sections with data start in view mode (Edit button visible).
// Empty sections start in edit mode so first-time setup stays guided.
const buildEditing = (c) => {
  if (!c) return { basics: true, founder: true, team: true, overview: true, culture: true };
  return {
    basics: !(c.name || c.tagline || c.bio || c.website || c.location),
    founder: !(c.founder?.name || c.founder?.title || c.founder?.bio),
    team: !((c.team || []).length),
    overview: !(c.overviewHtml),
    culture: !(
      c.culture?.remotePolicy || c.culture?.description ||
      (c.culture?.values || []).length || (c.culture?.benefits || []).length
    ),
  };
};

const snapshotForm = (c) => ({
  name: c?.name || '', logoUrl: c?.logoUrl || '', tagline: c?.tagline || '', bio: c?.bio || '',
  overviewHtml: c?.overviewHtml || '', employeeCount: c?.employeeCount ?? '', companySize: c?.companySize || '',
  website: c?.website || '', companyType: c?.companyType || '', industry: c?.industry || '',
  location: c?.location || '', foundedYear: c?.foundedYear ?? '',
  founder: { ...blankPerson, ...(c?.founder || {}) },
  team: Array.isArray(c?.team) ? c.team.map((m) => ({ ...blankPerson, ...m })) : [],
  culture: {
    remotePolicy: c?.culture?.remotePolicy || '',
    values: Array.isArray(c?.culture?.values) ? [...c.culture.values] : [],
    benefits: Array.isArray(c?.culture?.benefits) ? [...c.culture.benefits] : [],
    description: c?.culture?.description || '',
  },
});

// Card header with per-section Edit / Cancel + Save.
function SecHead({ title, sub, isEditing, busy, onEdit, onCancel, onSave, saveLabel }) {
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-400">{title}</h2>
          {sub && <p className="mt-1 text-xs text-neutral-500">{sub}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {isEditing ? (
            <>
              <button type="button" onClick={onCancel} className="rounded-md border border-white/15 px-3 py-1.5 text-xs text-neutral-300 hover:border-accent">
                Cancel
              </button>
              <button type="button" onClick={onSave} disabled={busy} className="rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-accentHover disabled:opacity-60">
                {busy ? 'Saving…' : (saveLabel || 'Save')}
              </button>
            </>
          ) : (
            <button type="button" onClick={onEdit} className="rounded-md border border-white/15 px-3 py-1.5 text-xs text-white hover:border-accent">
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Read-only label/value row for view mode.
function Row({ k, v, link }) {
  const body = link && v
    ? <a href={link} target="_blank" rel="noreferrer" className="break-all text-accent hover:underline">{v}</a>
    : (v || <span className="text-neutral-600">—</span>);
  return (
    <div className="flex gap-2 border-b border-white/5 py-1.5 text-sm last:border-0">
      <span className="w-28 shrink-0 pt-0.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">{k}</span>
      <span className="min-w-0 flex-1 break-words text-neutral-200">{body}</span>
    </div>
  );
}

export default function CompanyManagePage() {
  const { user } = useAuth();
  const toast = useToast();
  const fileRef = useRef(null);
  const [form, setForm] = useState(blank);
  const [loading, setLoading] = useState(true);
  const [secBusy, setSecBusy] = useState('');
  const [uploading, setUploading] = useState(false);
  const [slug, setSlug] = useState('');
  // Per-section edit mode. Sections with data start in view mode (Edit
  // button visible); empty sections start editable for first-time setup.
  const [editing, setEditing] = useState(() => buildEditing(null));
  // Last-saved server snapshot — Cancel restores this per section.
  const snapshot = useRef(null);

  useEffect(() => {
    let alive = true;
    api.myCompany()
      .then((c) => {
        if (!alive || !c) return;
        setSlug(c.slug || '');
        const next = { ...snapshotForm(c), newValue: '', newBenefit: '' };
        snapshot.current = next;
        setForm(next);
        setEditing(buildEditing(c));
      })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const buildPayload = (patch) => {
    const payload = { ...form, ...patch };
    delete payload.newValue;
    delete payload.newBenefit;
    if (payload.employeeCount === '' || payload.employeeCount == null) payload.employeeCount = null;
    else payload.employeeCount = Number(payload.employeeCount);
    if (payload.foundedYear === '' || payload.foundedYear == null) payload.foundedYear = null;
    else payload.foundedYear = Number(payload.foundedYear);
    return payload;
  };

  // Per-section save: click Save → persist → collapse back to view mode
  // so the Edit button shows again.
  const saveSection = async (key) => {
    setSecBusy(key);
    try {
      const saved = await api.saveCompany(buildPayload());
      setSlug(saved.slug || slug);
      snapshot.current = { ...form, newValue: '', newBenefit: '' };
      setEditing((e) => ({ ...e, [key]: false }));
      toast?.notify('Company profile saved', 'success');
    } catch (e) {
      toast?.notify(e.message, 'error');
    } finally {
      setSecBusy('');
    }
  };

  const startEdit = (key) => setEditing((e) => ({ ...e, [key]: true }));
  const cancelEdit = (key) => {
    if (snapshot.current) {
      const s = snapshot.current;
      if (key === 'basics') {
        setForm((f) => ({
          ...f, name: s.name, logoUrl: s.logoUrl, tagline: s.tagline, bio: s.bio,
          employeeCount: s.employeeCount, companySize: s.companySize, companyType: s.companyType,
          website: s.website, industry: s.industry, location: s.location, foundedYear: s.foundedYear,
        }));
      } else if (key === 'founder') {
        setForm((f) => ({ ...f, founder: { ...s.founder } }));
      } else if (key === 'team') {
        setForm((f) => ({ ...f, team: s.team.map((m) => ({ ...m })) }));
      } else if (key === 'overview') {
        setForm((f) => ({ ...f, overviewHtml: s.overviewHtml }));
      } else if (key === 'culture') {
        setForm((f) => ({ ...f, culture: { ...s.culture, values: [...s.culture.values], benefits: [...s.culture.benefits] }, newValue: '', newBenefit: '' }));
      }
    }
    setEditing((e) => ({ ...e, [key]: false }));
  };

  const head = (key, title, sub, saveLabel) => (
    <SecHead
      title={title}
      sub={sub}
      isEditing={editing[key]}
      busy={secBusy === key}
      onEdit={() => startEdit(key)}
      onCancel={() => cancelEdit(key)}
      onSave={() => saveSection(key)}
      saveLabel={saveLabel}
    />
  );

  const onLogoFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const saved = await api.uploadCompanyLogo(file);
      setForm((f) => ({ ...f, logoUrl: saved.logoUrl || '' }));
      toast?.notify('Logo uploaded', 'success');
    } catch (err) {
      toast?.notify(err.message, 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  if (loading) return <p className="mx-auto max-w-4xl px-4 py-16 text-center text-sm text-neutral-400">Loading company profile…</p>;

  const logo = form.logoUrl ? fileUrl(form.logoUrl) : '';

  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-accent">Employer · Company profile</p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Manage company</h1>
        {slug && (
          <Link to={`/companies/${encodeURIComponent(slug)}`} className="rounded-md border border-white/15 px-3 py-1.5 text-sm text-white hover:border-accent">
            View public profile →
          </Link>
        )}
      </div>
      <p className="mt-1 text-sm text-neutral-400">
        Signed in as {user?.name} · this is what job seekers see when they open your company.
      </p>

      {/* ── Basics: logo · name · bio · headcount ── */}
      <div className={`${card} mt-6`}>
        {head('basics', 'Basics', 'Logo, name, bio and company facts.', 'Save basics')}
        {editing.basics ? (
          <>
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
              {logo ? (
                <img src={logo} alt="Company logo" className="h-20 w-20 rounded-2xl border border-white/10 object-cover" />
              ) : (
                <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-accent/15 text-3xl font-extrabold text-accent">
                  {(form.name || '?').charAt(0).toUpperCase()}
                </span>
              )}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="rounded-md bg-accent px-3 py-2 text-xs font-semibold text-white hover:bg-accentHover disabled:opacity-60"
                >
                  {uploading ? 'Uploading…' : 'Upload logo'}
                </button>
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={onLogoFile} />
                <input
                  value={form.logoUrl} onChange={(e) => set('logoUrl', e.target.value)}
                  placeholder="…or paste logo image URL" aria-label="Logo image URL"
                  className="min-w-56 flex-1 rounded-md border border-white/10 bg-panel2 px-3 py-2 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-accent/60"
                />
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="c-name" className={label}>Company name *</label>
                <input id="c-name" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Acme Inc." className={input} />
              </div>
              <div>
                <label htmlFor="c-tagline" className={label}>Tagline</label>
                <input id="c-tagline" value={form.tagline} onChange={(e) => set('tagline', e.target.value)} placeholder="What you do, in one line" className={input} />
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="c-bio" className={label}>Short bio (shows under the name)</label>
              <textarea id="c-bio" value={form.bio} onChange={(e) => set('bio', e.target.value)} rows={2} maxLength={500} placeholder="One or two sentences about the company…" className={input} />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="c-count" className={label}>Employees (number)</label>
                <input id="c-count" type="number" min={0} value={form.employeeCount} onChange={(e) => set('employeeCount', e.target.value)} placeholder="e.g. 120" className={input} />
              </div>
              <div>
                <label htmlFor="c-size" className={label}>Company size</label>
                <select id="c-size" value={form.companySize} onChange={(e) => set('companySize', e.target.value)} className={input}>
                  <option value="">Select…</option>
                  {['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="c-type" className={label}>Company type</label>
                <select id="c-type" value={form.companyType} onChange={(e) => set('companyType', e.target.value)} className={input}>
                  <option value="">Select…</option>
                  {['Startup', 'SME', 'Enterprise', 'Nonprofit', 'Agency', 'Government'].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="c-site" className={label}>Website</label>
                <input id="c-site" value={form.website} onChange={(e) => set('website', e.target.value)} placeholder="https://…" className={input} />
              </div>
              <div>
                <label htmlFor="c-industry" className={label}>Industry</label>
                <input id="c-industry" value={form.industry} onChange={(e) => set('industry', e.target.value)} placeholder="e.g. AI / SaaS" className={input} />
              </div>
              <div>
                <label htmlFor="c-loc" className={label}>Headquarters</label>
                <input id="c-loc" value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="e.g. Bengaluru / Remote" className={input} />
              </div>
              <div>
                <label htmlFor="c-year" className={label}>Founded year</label>
                <input id="c-year" type="number" value={form.foundedYear} onChange={(e) => set('foundedYear', e.target.value)} placeholder="e.g. 2021" className={input} />
              </div>
            </div>
          </>
        ) : (
          <div className="mt-3">
            <div className="mb-3 flex items-center gap-3">
              {logo ? (
                <img src={logo} alt="Company logo" className="h-12 w-12 rounded-xl border border-white/10 object-cover" />
              ) : (
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-xl font-extrabold text-accent">
                  {(form.name || '?').charAt(0).toUpperCase()}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">{form.name || '—'}</p>
                {form.tagline && <p className="truncate text-xs text-neutral-400">{form.tagline}</p>}
              </div>
            </div>
            <Row k="Bio" v={form.bio} />
            <Row k="Employees" v={form.employeeCount !== '' && form.employeeCount != null ? String(form.employeeCount) : ''} />
            <Row k="Size" v={form.companySize} />
            <Row k="Type" v={form.companyType} />
            <Row k="Website" v={form.website} link={form.website} />
            <Row k="Industry" v={form.industry} />
            <Row k="Location" v={form.location} />
            <Row k="Founded" v={form.foundedYear !== '' && form.foundedYear != null ? String(form.foundedYear) : ''} />
          </div>
        )}
      </div>

      {/* ── People: founder ── */}
      <div className={`${card} mt-4`}>
        {head('founder', 'People · Founder', 'Shown under “Meet the people” — photo, name, title and bio.', 'Save founder')}
        {editing.founder ? (
          <>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="f-name" className={label}>Founder name</label>
                <input id="f-name" value={form.founder.name} onChange={(e) => set('founder', { ...form.founder, name: e.target.value })} placeholder="e.g. Jane Doe" className={input} />
              </div>
              <div>
                <label htmlFor="f-title" className={label}>Founder title</label>
                <input id="f-title" value={form.founder.title} onChange={(e) => set('founder', { ...form.founder, title: e.target.value })} placeholder="e.g. Co-founder & CEO" className={input} />
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="f-photo" className={label}>Founder photo URL</label>
              <input id="f-photo" value={form.founder.photoUrl} onChange={(e) => set('founder', { ...form.founder, photoUrl: e.target.value })} placeholder="https://… or /uploads/…" className={input} />
            </div>
            <div className="mt-4">
              <label htmlFor="f-bio" className={label}>Founder bio</label>
              <textarea id="f-bio" value={form.founder.bio} onChange={(e) => set('founder', { ...form.founder, bio: e.target.value })} rows={3} placeholder="Background, mission, what they lead…" className={input} />
            </div>
          </>
        ) : (
          <div className="mt-3">
            <Row k="Name" v={form.founder.name} />
            <Row k="Title" v={form.founder.title} />
            <Row k="Photo" v={form.founder.photoUrl} link={form.founder.photoUrl} />
            <Row k="Bio" v={form.founder.bio} />
          </div>
        )}
      </div>

      {/* ── People: team (founder auto-included on public page) ── */}
      <div className={`${card} mt-4`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-400">People · Team ({form.team.length})</h2>
            <p className="mt-1 text-xs text-neutral-500">The founder is always shown first on the public page.</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {editing.team ? (
              <>
                <button
                  type="button"
                  onClick={() => set('team', [...form.team, { ...blankPerson }])}
                  className="rounded-md border border-white/15 px-3 py-1.5 text-xs text-white hover:border-accent"
                >
                  + Add member
                </button>
                <button type="button" onClick={() => cancelEdit('team')} className="rounded-md border border-white/15 px-3 py-1.5 text-xs text-neutral-300 hover:border-accent">
                  Cancel
                </button>
                <button type="button" onClick={() => saveSection('team')} disabled={secBusy === 'team'} className="rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-accentHover disabled:opacity-60">
                  {secBusy === 'team' ? 'Saving…' : 'Save team'}
                </button>
              </>
            ) : (
              <button type="button" onClick={() => startEdit('team')} className="rounded-md border border-white/15 px-3 py-1.5 text-xs text-white hover:border-accent">
                Edit
              </button>
            )}
          </div>
        </div>
        {editing.team ? (
          <>
            {form.team.length === 0 ? (
              <p className="mt-3 text-xs text-neutral-500">No extra members yet — click “+ Add member” to add one.</p>
            ) : (
              <div className="mt-3 space-y-3">
                {form.team.map((m, i) => (
                  <div key={i} className="rounded-lg border border-white/10 bg-panel2 p-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input value={m.name} onChange={(e) => set('team', form.team.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} placeholder="Name" aria-label={`Team member ${i + 1} name`} className={input} />
                      <input value={m.title} onChange={(e) => set('team', form.team.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} placeholder="Title" aria-label={`Team member ${i + 1} title`} className={input} />
                    </div>
                    <input value={m.photoUrl} onChange={(e) => set('team', form.team.map((x, j) => (j === i ? { ...x, photoUrl: e.target.value } : x)))} placeholder="Photo URL (optional)" aria-label={`Team member ${i + 1} photo`} className={`${input} mt-3`} />
                    <textarea value={m.bio} onChange={(e) => set('team', form.team.map((x, j) => (j === i ? { ...x, bio: e.target.value } : x)))} placeholder="Short bio (optional)" rows={2} aria-label={`Team member ${i + 1} bio`} className={`${input} mt-3`} />
                    <button
                      type="button" onClick={() => set('team', form.team.filter((_, j) => j !== i))}
                      className="mt-2 text-xs text-red-400 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="mt-3">
            {form.team.length === 0 ? (
              <p className="text-sm text-neutral-600">No extra members yet — click Edit to add some.</p>
            ) : (
              <div className="space-y-2">
                {form.team.map((m, i) => (
                  <div key={i} className="rounded-lg border border-white/10 bg-panel2 p-3">
                    <p className="text-sm font-semibold text-white">
                      {[m.name, m.title].filter(Boolean).join(' · ') || `Member ${i + 1}`}
                    </p>
                    {m.bio && <p className="mt-1 text-xs leading-relaxed text-neutral-400">{m.bio}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Overview: rich description (WYSIWYG, spacing preserved) ── */}
      <div className={`${card} mt-4`}>
        {head('overview', 'Overview', 'Detailed company description — bold, italic, underline, headings and text sizes supported.', 'Save overview')}
        {editing.overview ? (
          <div className="mt-3">
            <RichTextEditor value={form.overviewHtml} onChange={(v) => set('overviewHtml', v)} />
          </div>
        ) : (
          <div className="mt-3">
            {form.overviewHtml ? (
              <div
                className="company-richtext-view text-sm leading-relaxed text-neutral-300"
                dangerouslySetInnerHTML={{ __html: form.overviewHtml }}
              />
            ) : (
              <p className="text-sm text-neutral-600">No overview yet — click Edit to write one.</p>
            )}
          </div>
        )}
      </div>

      {/* ── Culture & Benefits: remote, values, perks (add/remove) ── */}
      <div className={`${card} mt-4`}>
        {head('culture', 'Culture & Benefits', 'Work setup, values and perks job seekers see.', 'Save culture')}
        {editing.culture ? (
          <>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="c-remote" className={label}>Work setup</label>
                <select id="c-remote" value={form.culture.remotePolicy} onChange={(e) => set('culture', { ...form.culture, remotePolicy: e.target.value })} className={input}>
                  <option value="">Select…</option>
                  {['On-site', 'Hybrid', 'Remote-friendly', 'Remote-first'].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="c-culture-desc" className={label}>Culture description</label>
              <textarea id="c-culture-desc" value={form.culture.description} onChange={(e) => set('culture', { ...form.culture, description: e.target.value })} rows={3} placeholder="How the team works — remote norms, rituals, offsites…" className={input} />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <span className={label}>Values (add your own)</span>
                <div className="flex gap-2">
                  <input value={form.newValue} onChange={(e) => set('newValue', e.target.value)} placeholder="e.g. Craft over speed" aria-label="New value" className={input} />
                  <button
                    type="button"
                    onClick={() => { const v = form.newValue.trim(); if (v) set('culture', { ...form.culture, values: [...form.culture.values, v] }); set('newValue', ''); }}
                    className="shrink-0 rounded-md border border-white/15 px-3 text-sm text-white hover:border-accent"
                  >
                    Add
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {form.culture.values.map((v) => (
                    <button key={v} type="button" title="Remove" onClick={() => set('culture', { ...form.culture, values: form.culture.values.filter((x) => x !== v) })} className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs text-accent hover:opacity-80">
                      {v} ✕
                    </button>
                  ))}
                  {form.culture.values.length === 0 && <span className="text-xs text-neutral-500">No values yet.</span>}
                </div>
              </div>
              <div>
                <span className={label}>Benefits & perks (add your own)</span>
                <div className="flex gap-2">
                  <input value={form.newBenefit} onChange={(e) => set('newBenefit', e.target.value)} placeholder="e.g. Remote stipend" aria-label="New benefit" className={input} />
                  <button
                    type="button"
                    onClick={() => { const v = form.newBenefit.trim(); if (v) set('culture', { ...form.culture, benefits: [...form.culture.benefits, v] }); set('newBenefit', ''); }}
                    className="shrink-0 rounded-md border border-white/15 px-3 text-sm text-white hover:border-accent"
                  >
                    Add
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {form.culture.benefits.map((b) => (
                    <button key={b} type="button" title="Remove" onClick={() => set('culture', { ...form.culture, benefits: form.culture.benefits.filter((x) => x !== b) })} className="rounded-full border border-white/15 px-3 py-1 text-xs text-neutral-200 hover:border-accent">
                      {b} ✕
                    </button>
                  ))}
                  {form.culture.benefits.length === 0 && <span className="text-xs text-neutral-500">No benefits yet.</span>}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-3">
            <Row k="Setup" v={form.culture.remotePolicy} />
            <Row k="About" v={form.culture.description} />
            <div className="py-1.5">
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Values</p>
              {form.culture.values.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {form.culture.values.map((v) => (
                    <span key={v} className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs text-accent">{v}</span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neutral-600">—</p>
              )}
            </div>
            <div className="py-1.5">
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Benefits</p>
              {form.culture.benefits.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {form.culture.benefits.map((b) => (
                    <span key={b} className="rounded-full border border-white/15 px-3 py-1 text-xs text-neutral-200">{b}</span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neutral-600">—</p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
