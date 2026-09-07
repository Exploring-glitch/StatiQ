import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { normalizeJob, filterMock } from '../lib/jobs';
import JobCard from '../components/JobCard';

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

const csv = (sp, k) => (sp.get(k) || '').split(',').map((s) => s.trim()).filter(Boolean);

export default function JobsPage() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const [location, setLocation] = useState(params.get('location') || '');
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const workModes = useMemo(() => csv(params, 'mode'), [params]);
  const types = useMemo(() => csv(params, 'type'), [params]);
  const minSalary = params.get('min') || '';
  const level = params.get('level') || '';
  const sort = params.get('sort') || 'newest';

  const patch = (obj) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(obj)) {
      if (!v || (Array.isArray(v) && !v.length)) next.delete(k);
      else next.set(k, Array.isArray(v) ? v.join(',') : v);
    }
    setParams(next, { replace: true });
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
      const query = {
        q: params.get('q') || '',
        location: params.get('location') || '',
        type: (params.get('type') || ''),
        workMode: (params.get('mode') || '').split(',').filter(Boolean)[0] || '',
        experienceLevel: params.get('level') || '',
        minSalary: params.get('min') || '',
        sort: params.get('sort') || 'newest',
        limit: 50,
      };
      // Send all selected modes/types; backend matches first mode + all types.
      // Client-side demo fallback applies the full set precisely.
      const fullQuery = {
        ...query,
        workModes: (params.get('mode') || '').split(',').filter(Boolean),
        types: (params.get('type') || '').split(',').filter(Boolean),
      };
      try {
        const data = await api.jobs(query);
        if (!alive) return;
        let list = (data.items || data).map(normalizeJob);
        // Refine multi-select client-side (backend handles single mode; types csv already).
        if (fullQuery.workModes.length > 1) list = list.filter((j) => fullQuery.workModes.includes(j.workMode));
        if (sort === 'salary') list = [...list].sort((a, b) => (b.salaryMax ?? -1) - (a.salaryMax ?? -1));
        setItems(list);
        setTotal(data.total ?? list.length);
        setLive(true);
      } catch {
        if (!alive) return;
        const list = filterMock({
          q: fullQuery.q, location: fullQuery.location,
          workModes: fullQuery.workModes, types: fullQuery.types,
          minSalary: fullQuery.minSalary, experienceLevel: fullQuery.experienceLevel,
          sort: fullQuery.sort,
        });
        setItems(list);
        setTotal(list.length);
        setLive(false);
      } finally {
        if (alive) setLoading(false);
      }
    }, 300); // debounce search
    return () => { alive = false; clearTimeout(t); };
  }, [params, sort]);

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

  const chipOn = 'rounded-full border border-accent bg-accent/15 px-3 py-1 text-xs font-medium text-accent cursor-pointer';
  const chipOff = 'rounded-full border border-white/15 px-3 py-1 text-xs text-neutral-300 hover:border-accent cursor-pointer';
  const select = 'rounded-md border border-white/10 bg-panel px-3 py-2 text-sm text-white outline-none focus:border-accent/60';

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-accent">Startup jobs</p>
      <h1 className="mt-2 text-3xl font-bold text-white">Browse startup roles</h1>

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
          onClick={() => setShowFilters(!showFilters)}
          className={`shrink-0 rounded-md border px-4 py-2 text-sm ${activeCount ? 'border-accent bg-accent/15 text-accent' : 'border-white/15 text-white hover:border-accent'}`}
        >
          Filters{activeCount ? ` (${activeCount})` : ''} {showFilters ? '▴' : '▾'}
        </button>
      </div>

      {showFilters && (
        <div className="mt-3 space-y-4 rounded-xl border border-white/10 bg-panel p-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Work mode</p>
            <div className="flex flex-wrap gap-2">
              {MODES.map((m) => (
                <span key={m} onClick={() => toggle('mode', workModes, m)} className={workModes.includes(m) ? chipOn : chipOff}>
                  {workModes.includes(m) ? `${m} ✓` : m}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Job type</p>
            <div className="flex flex-wrap gap-2">
              {TYPES.map((t) => (
                <span key={t} onClick={() => toggle('type', types, t)} className={types.includes(t) ? chipOn : chipOff}>
                  {types.includes(t) ? `${t} ✓` : t}
                </span>
              ))}
            </div>
          </div>
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

      <p className="mt-3 text-xs text-neutral-500">
        {loading ? 'Loading…' : `${total} role${total === 1 ? '' : 's'} found`} ·{' '}
        <span className={live ? 'text-accent' : 'text-neutral-500'}>{live ? '● Live from API' : '○ Demo data (API offline)'}</span>
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {items.map((j) => (
          <JobCard key={j.id} job={j} />
        ))}
      </div>
      {!loading && items.length === 0 && (
        <div className="mt-8 rounded-xl border border-white/10 bg-panel p-6 text-center">
          <p className="text-sm text-neutral-400">No roles match these filters.</p>
          <button onClick={clearAll} className="mt-2 text-sm text-accent hover:underline">Clear search & filters →</button>
        </div>
      )}
    </section>
  );
}
