import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { api, fileUrl } from '../lib/api';
import { sanitizeHtml, initials } from '../lib/companies';
import JobCard from '../components/JobCard';
import { normalizeJob } from '../lib/jobs';
import { useAuth } from '../context/AuthContext';

const TABS = [
  { v: 'overview', l: 'Overview' },
  { v: 'people', l: 'People' },
  { v: 'culture', l: 'Culture & Benefits' },
  { v: 'jobs', l: 'Jobs' },
];

export default function CompanyProfilePage() {
  const { slug } = useParams();
  const [params, setParams] = useSearchParams();
  const tab = TABS.some((t) => t.v === params.get('tab')) ? params.get('tab') : 'overview';
  const { user } = useAuth();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  // Jobs-tab filters: position, location, accepted remote, type + clear.
  const [fPos, setFPos] = useState('');
  const [fLoc, setFLoc] = useState('');
  const [fRemote, setFRemote] = useState('');
  const [fType, setFType] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setMissing(false);
    api.company(slug)
      .then((c) => { if (alive) setCompany(c); })
      .catch(() => { if (alive) setMissing(true); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [slug]);

  const jobs = useMemo(() => (company?.jobs || []).map(normalizeJob), [company]);
  const jobsCount = company?.jobsCount ?? jobs.length;

  const filteredJobs = useMemo(() => jobs.filter((j) => {
    if (fPos && !`${j.role || j.title || ''}`.toLowerCase().includes(fPos.toLowerCase())) return false;
    if (fLoc && !(j.location || '').toLowerCase().includes(fLoc.toLowerCase())) return false;
    if (fType && j.type !== fType) return false;
    if (fRemote === 'remote' && j.workMode !== 'Remote' && !j.remote) return false;
    if (fRemote === 'onsite' && (j.workMode === 'Remote' || j.remote)) return false;
    return true;
  }), [jobs, fPos, fLoc, fRemote, fType]);
  const hasJobFilters = Boolean(fPos.trim() || fLoc.trim() || fRemote || fType);
  const clearJobFilters = () => { setFPos(''); setFLoc(''); setFRemote(''); setFType(''); };

  const setTab = (v) => {
    const next = new URLSearchParams(params);
    if (v === 'overview') next.delete('tab');
    else next.set('tab', v);
    setParams(next, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <p className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-neutral-400">Loading company…</p>;
  if (missing || !company) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-white">Company not found</h1>
        <p className="mt-2 text-sm text-neutral-400">This profile may have been removed or renamed.</p>
        <Link to="/companies" className="mt-4 inline-block text-sm text-accent">← Browse companies</Link>
      </section>
    );
  }

  const logo = company.logoUrl ? fileUrl(company.logoUrl) : '';
  const isOwner = user && company.owner && String(company.owner) === String(user.id);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <Link to="/companies" className="text-sm text-neutral-400 hover:text-white">← All companies</Link>

      {/* ── Header: logo · name · bio · headcount ── */}
      <div className="mt-4 rounded-2xl border border-white/10 bg-panel p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {logo ? (
            <img src={logo} alt={`${company.name} logo`} className="h-20 w-20 shrink-0 rounded-2xl border border-white/10 bg-panel2 object-cover" />
          ) : (
            <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-accent/15 text-3xl font-extrabold text-accent">
              {initials(company.name)}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">{company.name}</h1>
            {(company.tagline || company.industry) && (
              <p className="mt-0.5 text-sm text-neutral-400">
                {[company.tagline, company.industry].filter(Boolean).join(' · ')}
              </p>
            )}
            {company.bio && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-300">{company.bio}</p>}
            <p className="mt-2 text-xs text-neutral-500">
              {company.employeeCount != null ? (
                <span className="font-semibold text-neutral-300">{company.employeeCount} employees</span>
              ) : company.companySize ? (
                <span className="font-semibold text-neutral-300">{company.companySize} people</span>
              ) : null}
              {company.location ? ` · ${company.location}` : ''}
              {company.companyType ? ` · ${company.companyType}` : ''}
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2">
            {company.website && (
              <a href={company.website} target="_blank" rel="noreferrer" className="rounded-md border border-white/15 px-4 py-2 text-center text-sm text-white hover:border-accent">
                Website ↗
              </a>
            )}
            {isOwner && (
              <Link to="/company/manage" className="rounded-md bg-accent px-4 py-2 text-center text-sm font-semibold text-white hover:bg-accentHover">
                Edit profile
              </Link>
            )}
          </div>
        </div>

        {/* ── Four fields ── */}
        <nav aria-label="Company sections" className="mt-6 flex flex-wrap gap-2 border-t border-white/5 pt-4">
          {TABS.map((t) => (
            <button
              key={t.v}
              type="button"
              onClick={() => setTab(t.v)}
              aria-current={tab === t.v ? 'page' : undefined}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                tab === t.v
                  ? 'bg-accent text-white shadow-lg shadow-accent/25'
                  : 'border border-white/10 text-neutral-300 hover:border-accent hover:text-white'
              }`}
            >
              {t.l}{t.v === 'jobs' ? ` (${jobsCount})` : ''}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Tab panels ── */}
      {tab === 'overview' && (
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-panel p-6 lg:col-span-2">
            <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-400">About {company.name}</h2>
            {company.overviewHtml ? (
              <div
                className="company-richtext-view mt-3 text-sm leading-relaxed text-neutral-300"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(company.overviewHtml) }}
              />
            ) : (
              <p className="mt-3 text-sm text-neutral-500">
                {company.bio || 'This company hasn’t written a detailed overview yet.'}
              </p>
            )}
          </div>
          <aside className="h-fit space-y-3 rounded-xl border border-white/10 bg-panel p-6">
            <h3 className="text-sm font-bold text-white">Company facts</h3>
            <dl className="space-y-2.5 text-sm">
              {[
                ['Company size', company.companySize || (company.employeeCount != null ? `${company.employeeCount} employees` : '—')],
                ['Website', company.website ? company.website.replace(/^https?:\/\//, '') : '—'],
                ['Company type', company.companyType || '—'],
                ['Industry', company.industry || '—'],
                ['Headquarters', company.location || '—'],
                ['Founded', company.foundedYear || '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex items-start justify-between gap-3">
                  <dt className="text-xs text-neutral-500">{k}</dt>
                  <dd className="text-right text-xs font-medium text-neutral-200">
                    {k === 'Website' && company.website ? (
                      <a href={company.website} target="_blank" rel="noreferrer" className="text-accent hover:underline">{v}</a>
                    ) : v}
                  </dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      )}

      {tab === 'people' && (
        <div className="mt-4 rounded-xl border border-white/10 bg-panel p-6">
          <h2 className="text-lg font-bold text-white">Meet the people at {company.name}</h2>
          <h3 className="mt-6 text-sm font-bold uppercase tracking-wide text-neutral-400">Founder</h3>
          {company.founder?.name ? (
            <div className="mt-3 flex max-w-xl items-start gap-4 rounded-xl border border-white/10 bg-panel2 p-4">
              {company.founder.photoUrl ? (
                <img src={fileUrl(company.founder.photoUrl)} alt={company.founder.name} className="h-14 w-14 shrink-0 rounded-full border border-white/10 object-cover" />
              ) : (
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xl font-extrabold text-accent">
                  {initials(company.founder.name)}
                </span>
              )}
              <div className="min-w-0">
                <p className="text-sm font-bold text-white">{company.founder.name}</p>
                {company.founder.title && <p className="text-xs text-accent">{company.founder.title}</p>}
                {company.founder.bio && <p className="mt-1.5 text-xs leading-relaxed text-neutral-400">{company.founder.bio}</p>}
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-neutral-500">Founder details coming soon.</p>
          )}
          <h3 className="mt-8 text-sm font-bold uppercase tracking-wide text-neutral-400">Team ({(company.team || []).length + (company.founder?.name ? 1 : 0)})</h3>
          {(company.team || []).length === 0 && !company.founder?.name ? (
            <p className="mt-3 text-sm text-neutral-500">Team details coming soon.</p>
          ) : (
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {company.founder?.name && (
                <div className="rounded-xl border border-accent/25 bg-accent/5 p-4">
                  <div className="flex items-center gap-3">
                    {company.founder.photoUrl ? (
                      <img src={fileUrl(company.founder.photoUrl)} alt={company.founder.name} className="h-11 w-11 rounded-full border border-white/10 object-cover" />
                    ) : (
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/15 font-bold text-accent">{initials(company.founder.name)}</span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white">{company.founder.name}</p>
                      <p className="truncate text-xs text-neutral-400">{company.founder.title || 'Founder'}</p>
                    </div>
                  </div>
                  {company.founder.bio && <p className="mt-2 text-xs leading-relaxed text-neutral-400">{company.founder.bio}</p>}
                  <span className="mt-2 inline-block rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-semibold text-accent">Founder</span>
                </div>
              )}
              {(company.team || []).map((m, i) => (
                <div key={`${m.name}-${i}`} className="rounded-xl border border-white/10 bg-panel2 p-4">
                  <div className="flex items-center gap-3">
                    {m.photoUrl ? (
                      <img src={fileUrl(m.photoUrl)} alt={m.name} className="h-11 w-11 rounded-full border border-white/10 object-cover" />
                    ) : (
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/15 font-bold text-accent">{initials(m.name)}</span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white">{m.name || 'Team member'}</p>
                      <p className="truncate text-xs text-neutral-400">{m.title || ''}</p>
                    </div>
                  </div>
                  {m.bio && <p className="mt-2 text-xs leading-relaxed text-neutral-400">{m.bio}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'culture' && (
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-panel p-6 lg:col-span-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-white">Culture & Benefits</h2>
              {company.culture?.remotePolicy && (
                <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                  {company.culture.remotePolicy === 'Remote-first' ? '🌍 Remote-first' : company.culture.remotePolicy === 'Remote-friendly' ? '🌐 Remote-friendly' : company.culture.remotePolicy === 'Hybrid' ? '🏢🏠 Hybrid' : '🏢 On-site'}
                </span>
              )}
            </div>
            {company.culture?.description ? (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-neutral-300">{company.culture.description}</p>
            ) : (
              <p className="mt-3 text-sm text-neutral-500">
                {company.culture?.remotePolicy
                  ? `This team works ${company.culture.remotePolicy.toLowerCase()}.`
                  : 'Culture details coming soon.'}
              </p>
            )}
            <h3 className="mt-6 text-sm font-bold uppercase tracking-wide text-neutral-400">Our values</h3>
            {(company.culture?.values || []).length ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {(company.culture.values || []).map((v) => (
                  <span key={v} className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">✦ {v}</span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-xs text-neutral-500">No values listed yet.</p>
            )}
          </div>
          <aside className="h-fit rounded-xl border border-white/10 bg-panel p-6">
            <h3 className="text-sm font-bold text-white">Benefits & perks</h3>
            {(company.culture?.benefits || []).length ? (
              <ul className="mt-3 space-y-2">
                {(company.culture.benefits || []).map((b) => (
                  <li key={b} className="flex items-start gap-2 rounded-lg border border-white/10 bg-panel2 px-3 py-2 text-xs text-neutral-200">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-400/20 text-[10px] font-bold text-emerald-300">✓</span>
                    {b}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-xs text-neutral-500">No benefits listed yet.</p>
            )}
          </aside>
        </div>
      )}

      {tab === 'jobs' && (
        <div className="mt-4 rounded-xl border border-white/10 bg-panel p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-white">Open roles ({hasJobFilters ? filteredJobs.length : jobsCount})</h2>
            {hasJobFilters && (
              <button onClick={clearJobFilters} className="text-xs font-semibold text-accent hover:underline">Clear filters ✕</button>
            )}
          </div>
          {/* Filter here: positions · locations · accepted remote · types · clear */}
          <div className="mt-4 grid gap-2 md:grid-cols-4">
            <input
              value={fPos} onChange={(e) => setFPos(e.target.value)} placeholder="Filter by position…"
              aria-label="Filter by job position"
              className="rounded-md border border-white/10 bg-panel2 px-3 py-2 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-accent/60"
            />
            <input
              value={fLoc} onChange={(e) => setFLoc(e.target.value)} placeholder="Filter by location…"
              aria-label="Filter by location"
              className="rounded-md border border-white/10 bg-panel2 px-3 py-2 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-accent/60"
            />
            <select
              value={fRemote} onChange={(e) => setFRemote(e.target.value)} aria-label="Filter by accepted remote locations"
              className="rounded-md border border-white/10 bg-panel2 px-3 py-2 text-sm text-white outline-none focus:border-accent/60"
            >
              <option value="">All work modes</option>
              <option value="remote">Remote accepted</option>
              <option value="onsite">On-site / Hybrid</option>
            </select>
            <select
              value={fType} onChange={(e) => setFType(e.target.value)} aria-label="Filter by job type"
              className="rounded-md border border-white/10 bg-panel2 px-3 py-2 text-sm text-white outline-none focus:border-accent/60"
            >
              <option value="">All types</option>
              {['Full-time', 'Part-time', 'Contract', 'Internship'].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          {filteredJobs.length === 0 ? (
            <div className="mt-4 rounded-xl border border-white/10 bg-panel2 p-6 text-center">
              <p className="text-sm text-neutral-400">
                {jobs.length === 0 ? 'No open roles right now — check back soon.' : 'No roles match these filters.'}
              </p>
              {hasJobFilters && (
                <button onClick={clearJobFilters} className="mt-2 text-sm text-accent hover:underline">Clear filters →</button>
              )}
            </div>
          ) : (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {filteredJobs.map((j) => <JobCard key={j.id} job={j} />)}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
