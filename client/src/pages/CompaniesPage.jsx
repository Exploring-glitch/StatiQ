import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import CompanyCard from '../components/CompanyCard';
import { Skeleton } from '../components/Skeleton';

export default function CompaniesPage() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      const cur = params.get('q') || '';
      if (q !== cur) {
        const next = new URLSearchParams(params);
        if (!q.trim()) next.delete('q');
        else next.set('q', q.trim());
        setParams(next, { replace: true });
      }
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const data = await api.companies({ q: params.get('q') || '', limit: 24 });
        if (!alive) return;
        setItems(data.items || []);
        setTotal(data.total ?? (data.items || []).length);
      } catch {
        if (alive) { setItems([]); setTotal(0); }
      } finally {
        if (alive) setLoading(false);
      }
    }, 250);
    return () => { alive = false; clearTimeout(t); };
  }, [params]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-accent">For job seekers</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white">Explore companies</h1>
      <p className="mt-1 text-sm text-neutral-400">
        Open a profile for overview, people, culture & benefits, and every open role.
      </p>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search companies by name, industry, or keyword…"
        aria-label="Search companies"
        className="mt-4 w-full rounded-lg border border-white/10 bg-panel px-3.5 py-2.5 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-accent/60"
      />
      <p className="mt-3 text-xs text-neutral-500">
        {loading ? 'Loading…' : `${total} compan${total === 1 ? 'y' : 'ies'} found`}
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 w-full !rounded-xl" />)
          : items.map((c) => <CompanyCard key={c.id || c._id || c.slug} company={c} />)}
      </div>
      {!loading && items.length === 0 && (
        <div className="mt-6 rounded-xl border border-white/10 bg-panel p-6 text-center">
          <p className="text-sm text-neutral-400">No companies match “{params.get('q') || ''}”.</p>
          <p className="mt-1 text-xs text-neutral-500">Employers create profiles from Dashboard → Manage company.</p>
        </div>
      )}
    </section>
  );
}
