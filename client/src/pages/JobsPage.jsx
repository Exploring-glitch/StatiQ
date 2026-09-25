import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { normalizeJob, filterMock } from '../lib/jobs';
import { useAuth } from '../context/AuthContext';
import JobCard from '../components/JobCard';
import CompanyCard from '../components/CompanyCard';
import SaveSearchButton from '../components/SaveSearchButton';
import { JobCardSkeleton } from '../components/Skeleton';

const MODES = ['Remote', 'Hybrid', 'On-site'];
const TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];
const SALARY_OPTS = [
  { v: '', l: 'Any salary' },
  { v: '50000', l: '$50K+' },
  { v: '100000', l: '$100K+' },
  { v: '150000', l: '$150K+' },
  { v: '200000', l: '$200K+' },
];
const LEVELS = [
  { v: '', l: 'Any level' },
  { v: 'fresher', l: 'Fresher' },
  { v: 'entry', l: 'Entry' },
  { v: 'mid', l: 'Mid' },
  { v: 'senior', l: 'Senior' },
  { v: 'lead', l: 'Lead / Staff' },
  { v: 'executive', l: 'Executive' },
];
const SORTS = [
  { v: 'newest', l: 'Newest' },
  { v: 'salary', l: 'Highest paid' },
];

// Curated external listings — clicking a card opens the company's site in a new tab.
const RECOMMENDED_JOBS = [
  { id: 'rec-google-swe', company: 'Google', role: 'Software Engineer', meta: 'Bengaluru · Full-time · Hybrid', tags: ['Engineering', 'Hybrid'], url: 'https://careers.google.com' },
  { id: 'rec-swiggy-fe', company: 'Swiggy', role: 'Frontend Developer', meta: 'Bengaluru · Full-time · Hybrid', tags: ['React', 'Hybrid'], url: 'https://careers.swiggy.com' },
  { id: 'rec-zerodha-be', company: 'Zerodha', role: 'Backend Engineer', meta: 'Bengaluru · Full-time · On-site', tags: ['Engineering', 'On-site'], url: 'https://zerodha.com/careers' },
  { id: 'rec-figma-pd', company: 'Figma', role: 'Product Designer', meta: 'Remote · Full-time · Remote', tags: ['Design', 'Remote'], url: 'https://www.figma.com/careers' },
  { id: 'rec-flipkart-da', company: 'Flipkart', role: 'Data Analyst', meta: 'Bengaluru · Full-time · Hybrid', tags: ['Data', 'Hybrid'], url: 'https://www.flipkartcareers.com' },
  { id: 'rec-aws-devops', company: 'AWS', role: 'DevOps Engineer', meta: 'Remote · Full-time · Remote', tags: ['Cloud', 'Remote'], url: 'https://aws.amazon.com/careers' },
];

const csv = (sp, k) => (sp.get(k) || '').split(',').map((s) => s.trim()).filter(Boolean);

const PAGE_SIZE = 12;

export default function JobsPage() {
  const { user } = useAuth();
  const isEmployer = user?.role === 'employer';
  const isSeeker = user?.role === 'jobseeker' || user?.role === 'admin';
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const [location, setLocation] = useState(params.get('location') || '');
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [companies, setCompanies] = useState([]);

  const workModes = useMemo(() => csv(params, 'mode'), [params]);
  const types = useMemo(() => csv(params, 'type'), [params]);
  const minSalary = params.get('min') || '';
  const level = params.get('level') || '';
  const sort = params.get('sort') || 'newest';
  const page = Math.max(1, Number(params.get('page')) || 1);

  const patch = (obj) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(obj)) {
      if (!v || (Array.isArray(v) && !v.length)) next.delete(k);
      else next.set(k, Array.isArray(v) ? v.join(',') : String(v));
    }
    // Any filter/sort change resets to page 1; only explicit page nav keeps it.
    if (!('page' in obj)) next.delete('page');
    setParams(next, { replace: true });
  };
  const goPage = (p) => {
    const next = new URLSearchParams(params);
    if (!p || p <= 1) next.delete('page');
    else next.set('page', String(p));
    setParams(next, { replace: false });
    // Keep browsing context: jump back to results top on explicit page nav.
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
  };
  const toggle = (key, list, v) => patch({ [key]: list.includes(v) ? list.filter((x) => x !== v) : [...list, v] });

  const activeCount = workModes.length + types.length + (minSalary ? 1 : 0) + (level ? 1 : 0) + (location.trim() ? 1 : 0);
  const clearAll = () => {
    setQ('');
    setLocation('');
    setParams({}, { replace: true });
  };

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const t = setTimeout(async () => {
      const modeCsv = (params.get('mode') || '').split(',').map((s) => s.trim()).filter(Boolean).join(',');
      const typeCsv = (params.get('type') || '').split(',').map((s) => s.trim()).filter(Boolean).join(',');
      const currentPage = Math.max(1, Number(params.get('page')) || 1);
      const query = {
        q: params.get('q') || '',
        location: params.get('location') || '',
        type: typeCsv,
        workMode: modeCsv,
        experienceLevel: params.get('level') || '',
        minSalary: params.get('min') || '',
        sort: params.get('sort') || 'newest',
        page: currentPage,
        limit: PAGE_SIZE,
      };
      try {
        const data = await api.jobs(query);
        if (!alive) return;
        // Server now handles multi-mode + sort + pagination; trust its slice.
        const list = (data.items || data).map(normalizeJob);
        const totalCount = data.total ?? list.length;
        const totalPages = data.pages ?? 1;
        // Clamp stale page (e.g. filters shrank results while page=5 in URL).
        if (totalPages > 0 && currentPage > totalPages && totalCount > 0) {
          const next = new URLSearchParams(params);
          next.set('page', String(totalPages));
          setParams(next, { replace: true });
          return;
        }
        setItems(list);
        setTotal(totalCount);
        setPages(totalPages);
        setLive(true);
        setOffline(false);
      } catch {
        if (!alive) return;
        const full = filterMock({
          q: query.q, location: query.location,
          workModes: modeCsv ? modeCsv.split(',') : [], types: typeCsv ? typeCsv.split(',') : [],
          minSalary: query.minSalary, experienceLevel: query.experienceLevel,
          sort: query.sort,
        });
        const totalCount = full.length;
        const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
        const safePage = Math.min(currentPage, totalPages);
        const start = (safePage - 1) * PAGE_SIZE;
        setItems(full.slice(start, start + PAGE_SIZE));
        setTotal(totalCount);
        setPages(totalPages);
        if (safePage !== currentPage) {
          const next = new URLSearchParams(params);
          if (safePage <= 1) next.delete('page');
          else next.set('page', String(safePage));
          setParams(next, { replace: true });
          return;
        }
        setLive(false);
        setOffline(true);
      } finally {
        if (alive) setLoading(false);
      }
    }, 300); // debounce search
    return () => { alive = false; clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, retryKey]);

  // Sync debounced text inputs → URL
  useEffect(() => {
    const t = setTimeout(() => {
      const cur = params.get('q') || '';
      if (q !== cur) patch({ q });
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);
  useEffect(() => {
    const t = setTimeout(() => {
      const cur = params.get('location') || '';
      if (location !== cur) patch({ location });
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const chipOn = 'rounded-full border border-accent bg-accent/15 px-3 py-1 text-xs font-medium text-accent cursor-pointer focus-visible:outline-2 focus-visible:outline-accent';
  const chipOff = 'rounded-full border border-white/15 px-3 py-1 text-xs text-neutral-300 hover:border-accent cursor-pointer focus-visible:outline-2 focus-visible:outline-accent';
  const select = 'rounded-md border border-white/10 bg-panel px-3 py-2 text-sm text-white outline-none focus:border-accent/60';

  // External picks only clutter filtered/paginated browsing — show on clean page 1.
  const hasSearch = Boolean((params.get('q') || '').trim() || (params.get('location') || '').trim());
  const showRecommended = page === 1 && !hasSearch && activeCount === 0;

  // Seeker discovery: when searching a company or role, surface matching
  // company profiles (logo → overview/people/culture/jobs) above the roles.
  useEffect(() => {
    const needle = (params.get('q') || '').trim();
    if (!needle) { setCompanies([]); return; }
    let alive = true;
    const t = setTimeout(async () => {
      try {
        const data = await api.companies({ q: needle, limit: 3 });
        if (alive) setCompanies(data.items || []);
      } catch {
        if (alive) setCompanies([]);
      }
    }, 350);
    return () => { alive = false; clearTimeout(t); };
  }, [params]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      {isEmployer && (
        <p className="mb-4 rounded-lg border border-accent/30 bg-accent/10 p-3 text-xs text-accent">
          👁 You&apos;re in <strong>hiring mode</strong> — this is how seekers see live listings. Manage your roles from the{' '}
          <a href="/dashboard" className="font-semibold underline">Dashboard</a>.
        </p>
      )}
      <p className="text-xs font-semibold uppercase tracking-wide text-accent">
        {isEmployer ? 'Live listings preview' : 'Startup jobs'}
      </p>
      <h1 className="mt-2 text-3xl font-bold text-white">
        {isEmployer ? 'How your roles appear to seekers' : 'Browse startup roles'}
      </h1>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full rounded-md border border-white/10 bg-panel px-3 py-2 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-accent/60"
          placeholder="Search role, company, skill, or tag..."
        />
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full rounded-md border border-white/10 bg-panel px-3 py-2 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-accent/60 sm:max-w-56"
          placeholder="Location..."
        />
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          aria-expanded={showFilters}
          title={showFilters ? 'Hide filter options' : 'Show filter options'}
          className={`flex shrink-0 items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${showFilters || activeCount ? 'border-accent bg-accent/15 text-accent' : 'border-white/15 bg-panel text-white hover:border-accent hover:text-accent'}`}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 3H2l8 9.5V19l4 2v-8.5L22 3z" />
          </svg>
          <span>{showFilters ? 'Hide filters' : 'Show filters'}</span>
          {activeCount > 0 && (
            <span className="rounded-full bg-accent px-1.5 py-0.5 text-[11px] font-bold leading-none text-white">
              {activeCount}
            </span>
          )}
          <span aria-hidden="true" className="text-xs">{showFilters ? '▴' : '▾'}</span>
        </button>
        {isSeeker && (
          <SaveSearchButton
            getQuery={() => ({
              q: params.get('q') || '',
              location: params.get('location') || '',
              type: params.get('type') || '',
              workMode: params.get('mode') || '',
              experienceLevel: params.get('level') || '',
              minSalary: params.get('min') || '',
              sort: params.get('sort') || '',
            })}
          />
        )}
      </div>

      {showFilters && (
        <div className="mt-3 space-y-4 rounded-xl border border-white/10 bg-panel p-4">
          <fieldset>
            <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Work mode</legend>
            <div className="flex flex-wrap gap-2">
              {MODES.map((m) => (
                <button key={m} type="button" aria-pressed={workModes.includes(m)} onClick={() => toggle('mode', workModes, m)} className={workModes.includes(m) ? chipOn : chipOff}>
                  {workModes.includes(m) ? `${m} ✓` : m}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Job type</legend>
            <div className="flex flex-wrap gap-2">
              {TYPES.map((t) => (
                <button key={t} type="button" aria-pressed={types.includes(t)} onClick={() => toggle('type', types, t)} className={types.includes(t) ? chipOn : chipOff}>
                  {types.includes(t) ? `${t} ✓` : t}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-xs text-neutral-400">Min salary
              <select value={minSalary} onChange={(e) => patch({ min: e.target.value })} className={`${select} mt-1 w-full`}>
                {SALARY_OPTS.map((o) => <option key={o.l} value={o.v}>{o.l}</option>)}
              </select>
            </label>
            <label className="text-xs text-neutral-400">Experience level
              <select value={level} onChange={(e) => patch({ level: e.target.value })} className={`${select} mt-1 w-full`}>
                {LEVELS.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
              </select>
            </label>
            <label className="text-xs text-neutral-400">Sort by
              <select value={sort} onChange={(e) => patch({ sort: e.target.value === 'newest' ? '' : e.target.value })} className={`${select} mt-1 w-full`}>
                {SORTS.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
              </select>
            </label>
          </div>
          {activeCount > 0 && (
            <button onClick={clearAll} className="text-xs text-accent hover:underline">Clear all filters ✕</button>
          )}
        </div>
      )}

      {companies.length > 0 && (
        <div className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-white">Companies matching “{(params.get('q') || '').trim()}”</h2>
            <a href="/companies" className="text-xs text-accent hover:underline">Browse all →</a>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {companies.map((c) => (
              <CompanyCard key={c.id || c._id || c.slug} company={c} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-white">Fresh openings</h2>
          <span className="text-xs text-neutral-500">Posted directly by startups hiring now</span>
        </div>
        <p className="mt-1 text-xs text-neutral-500">
          {loading ? 'Loading…' : `${total} role${total === 1 ? '' : 's'} found${pages > 1 ? ` · Page ${page} of ${pages}` : ''}`} ·{' '}
          <span className={live ? 'text-accent' : 'text-neutral-500'}>{live ? '● Updated just now' : '○ Curated picks for you'}</span>
          {!loading && offline && (
            <button type="button" onClick={() => setRetryKey((k) => k + 1)} className="ml-2 rounded border border-white/15 px-2 py-0.5 text-[11px] text-white hover:border-accent hover:text-accent">
              Refresh
            </button>
          )}
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)
            : items.map((j) => <JobCard key={j.id} job={j} />)}
        </div>
        {!loading && items.length === 0 && (
          <div className="mt-4 rounded-xl border border-white/10 bg-panel p-6 text-center">
            <p className="text-sm text-neutral-400">No roles match these filters.</p>
            <button onClick={clearAll} className="mt-2 text-sm text-accent hover:underline">Clear search & filters →</button>
          </div>
        )}
        {!loading && pages > 1 && (
          <nav aria-label="Jobs pages" className="mt-8 flex items-center justify-center gap-3">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => goPage(page - 1)}
              className="rounded-md border border-white/15 px-4 py-2 text-sm text-white transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/15 disabled:hover:text-white"
            >
              ← Prev
            </button>
            <span className="text-xs text-neutral-400" aria-live="polite">
              Page {page} of {pages} · {total} role{total === 1 ? '' : 's'}
            </span>
            <button
              type="button"
              disabled={page >= pages}
              onClick={() => goPage(page + 1)}
              className="rounded-md border border-white/15 px-4 py-2 text-sm text-white transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/15 disabled:hover:text-white"
            >
              Next →
            </button>
          </nav>
        )}
      </div>

      {showRecommended && (
      <div className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-white">Recommended jobs</h2>
          <span className="text-xs text-neutral-500">External listings · apply on the company site</span>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {RECOMMENDED_JOBS.map((r) => (
            <a
              key={r.id}
              href={r.url}
              target="_blank"
              rel="noreferrer"
              title={`Open ${r.company} careers page`}
              className="rounded-xl border border-white/10 bg-panel p-5 transition hover:border-accent/50"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/15 font-bold text-accent">
                  {r.company.charAt(0)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">{r.company}</p>
                  <p className="truncate text-xs text-neutral-400">{r.role}</p>
                </div>
                <span className="ml-auto shrink-0 rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-semibold text-accent">★ Recommended</span>
              </div>
              <p className="mt-3 text-xs text-neutral-400">{r.meta}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {r.tags.map((t) => (
                  <span key={t} className="rounded-full border border-white/10 bg-panel2 px-2 py-0.5 text-xs text-neutral-300">{t}</span>
                ))}
              </div>
              <p className="mt-3 text-xs font-semibold text-accent">Apply on company site ↗</p>
            </a>
          ))}
        </div>
      </div>
      )}
    </section>
  );
}
