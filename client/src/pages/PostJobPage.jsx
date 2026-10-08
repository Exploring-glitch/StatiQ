import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

const empty = {
  title: '', company: '', location: '', salary: '',
  salaryMin: '', salaryMax: '', type: 'Full-time',
  workMode: 'On-site', experienceLevel: '',
  experienceMinYears: '', experienceMaxYears: '',
  tags: '', description: '', responsibilities: '',
  requirements: '', benefits: '', openings: '1', deadline: '',
};

export default function PostJobPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [params] = useSearchParams();
  // Edit mode: /post-job?edit=<jobId> loads the role for in-place updates.
  const editId = params.get('edit') || '';
  const [form, setForm] = useState({ ...empty, company: user?.company || '' });
  const [editLoaded, setEditLoaded] = useState(!editId);
  // Companies this employer manages — one today, many tomorrow. A single
  // company is auto-selected; several render a selector on the form.
  const [companies, setCompanies] = useState([]);
  const [companyId, setCompanyId] = useState('');
  // Auth loads async: backfill the employer company once it arrives, but
  // never overwrite what the user already typed.
  const companySeeded = useRef(false);
  useEffect(() => {
    if (!companySeeded.current && user?.company) {
      companySeeded.current = true;
      setForm((f) => ({ ...f, company: f.company || user.company }));
    }
  }, [user?.company]);
  useEffect(() => {
    let alive = true;
    api.myCompanies()
      .then((d) => {
        if (!alive) return;
        const list = Array.isArray(d) ? d : d.items || [];
        setCompanies(list);
        if (list.length === 1) {
          setCompanyId(list[0]._id || list[0].id || '');
          setForm((f) => ({ ...f, company: f.company || list[0].name || '' }));
        }
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);
  // Edit mode: fetch the role and pre-fill every field.
  useEffect(() => {
    if (!editId) return;
    let alive = true;
    api.job(editId)
      .then((j) => {
        if (!alive || !j) return;
        const num = (v) => (v === null || v === undefined ? '' : String(v));
        const lines = (v) => (Array.isArray(v) ? v.join('\n') : '');
        setForm({
          title: j.title || '', company: j.company || '', location: j.location || '',
          salary: j.salary || '', salaryMin: num(j.salaryMin), salaryMax: num(j.salaryMax),
          type: j.type || 'Full-time', workMode: j.workMode || 'On-site',
          experienceLevel: j.experienceLevel || '',
          experienceMinYears: num(j.experienceMinYears), experienceMaxYears: num(j.experienceMaxYears),
          tags: (j.tags || []).join(', '),
          description: j.description || '', responsibilities: lines(j.responsibilities),
          requirements: lines(j.requirements), benefits: lines(j.benefits),
          openings: num(j.openings ?? 1),
          deadline: j.deadline ? String(j.deadline).slice(0, 10) : '',
        });
        if (j.companyId) setCompanyId(String(j.companyId));
        setEditLoaded(true);
      })
      .catch(() => { if (alive) setEditLoaded(true); });
    return () => { alive = false; };
  }, [editId]);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [mine, setMine] = useState([]);
  const [mineError, setMineError] = useState('');

  const refreshMine = () => {
    setMineError('');
    api.myPostedJobs()
      .then((d) => setMine(Array.isArray(d) ? d : d.items || []))
      .catch((err) => setMineError(err?.message || 'Could not load your posted jobs.'));
  };
  useEffect(() => { refreshMine(); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    setBusy(true);
    try {
      const selected = companies.find((c) => String(c._id || c.id) === String(companyId));
      const payload = {
        ...form,
        // The role publicly appears under the company brand (e.g. Lupira),
        // never under the poster's name — the server re-binds + verifies.
        company: selected?.name || form.company,
        companyId: selected ? String(selected._id || selected.id) : undefined,
        salaryMin: form.salaryMin === '' ? null : Number(form.salaryMin),
        salaryMax: form.salaryMax === '' ? null : Number(form.salaryMax),
        experienceMinYears: form.experienceMinYears === '' ? null : Number(form.experienceMinYears),
        experienceMaxYears: form.experienceMaxYears === '' ? null : Number(form.experienceMaxYears),
        openings: form.openings === '' ? 1 : Math.max(1, Number(form.openings) || 1),
        deadline: form.deadline === '' ? null : new Date(form.deadline).toISOString(),
        remote: form.workMode === 'Remote',
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        responsibilities: form.responsibilities.split('\n').map((r) => r.trim()).filter(Boolean),
        requirements: form.requirements.split('\n').map((r) => r.trim()).filter(Boolean),
        benefits: form.benefits.split('\n').map((r) => r.trim()).filter(Boolean),
      };
      const created = editId
        ? await api.updateJob(editId, payload)
        : await api.createJob(payload);
      setMsg(editId ? `Saved “${created.title}”.` : `Posted “${created.title}” successfully.`);
      toast?.notify(editId ? `Saved “${created.title}”` : `Posted “${created.title}”`, 'success');
      if (!editId) setForm({ ...empty, company: user?.company || '' });
      refreshMine();
    } catch (err) {
      setMsg(err.message);
      toast?.notify(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const input = 'w-full rounded-md border border-white/10 bg-panel2 px-3 py-2 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-accent/60';
  const label = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500';

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-accent">Employer studio</p>
      <h1 className="mt-2 text-3xl font-bold text-white">{editId ? 'Edit job' : 'Post a job — free.'}</h1>
      <p className="mt-2 text-sm text-neutral-400">
        {editId
          ? 'Update the role — changes go live immediately.'
          : 'Rich details (salary range, level, work mode) get far more applicants — and make your role filterable.'}
      </p>
      {(form.company || user?.name) && (
        <p className="mt-1 text-xs text-neutral-500">
          Posting as <span className="font-semibold text-neutral-200">{companies.find((c) => String(c._id || c.id) === String(companyId))?.name || form.company || 'your company'}</span>
          {user?.name ? <> · by {user.name}</> : null}
        </p>
      )}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <form onSubmit={submit} className="space-y-3 rounded-xl border border-white/10 bg-panel p-6">
          <input value={form.title} onChange={set('title')} required placeholder="Job title *" className={input} />
          {companies.length > 1 ? (
            <div>
              <span className={label}>Company *</span>
              <select value={companyId} onChange={(e) => {
                const next = companies.find((c) => String(c._id || c.id) === e.target.value);
                setCompanyId(e.target.value);
                if (next) setForm((f) => ({ ...f, company: next.name || '' }));
              }} className={input} aria-label="Company the job belongs to">
                {companies.map((c) => (
                  <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <input value={form.company} onChange={set('company')} required placeholder="Company *" className={input} />
          )}
          <div className="grid grid-cols-2 gap-3">
            <input value={form.location} onChange={set('location')} required placeholder="Location *" className={input} />
            <input value={form.salary} onChange={set('salary')} placeholder="Salary label (e.g. $150K – $190K)" className={input} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><span className={label}>Min salary (annual)</span>
              <input type="number" min="0" value={form.salaryMin} onChange={set('salaryMin')} placeholder="150000" className={input} />
            </div>
            <div><span className={label}>Max salary (annual)</span>
              <input type="number" min="0" value={form.salaryMax} onChange={set('salaryMax')} placeholder="190000" className={input} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><span className={label}>Type</span>
              <select value={form.type} onChange={set('type')} className={input}>
                <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option>
              </select>
            </div>
            <div><span className={label}>Work mode</span>
              <select value={form.workMode} onChange={set('workMode')} className={input}>
                <option>On-site</option><option>Hybrid</option><option>Remote</option>
              </select>
            </div>
            <div><span className={label}>Level</span>
              <select value={form.experienceLevel} onChange={set('experienceLevel')} className={input}>
                <option value="">Any</option>
                <option value="fresher">Fresher</option>
                <option value="entry">Entry</option>
                <option value="mid">Mid</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead / Staff</option>
                <option value="executive">Executive</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><span className={label}>Min experience (years)</span>
              <input type="number" min="0" max="50" step="0.5" value={form.experienceMinYears} onChange={set('experienceMinYears')} placeholder="e.g. 2" className={input} />
            </div>
            <div><span className={label}>Max experience (years)</span>
              <input type="number" min="0" max="50" step="0.5" value={form.experienceMaxYears} onChange={set('experienceMaxYears')} placeholder="e.g. 5" className={input} />
            </div>
          </div>
          <input value={form.tags} onChange={set('tags')} placeholder="Tags (comma separated: AI, Fintech)" className={input} />
          <textarea value={form.description} onChange={set('description')} placeholder="Role description" rows={4} className={`${input} resize-y`} />
          <textarea value={form.responsibilities} onChange={set('responsibilities')} placeholder="Responsibilities (one per line)" rows={3} className={`${input} resize-y`} />
          <textarea value={form.requirements} onChange={set('requirements')} placeholder="Requirements (one per line: 3+ yrs React, etc.)" rows={3} className={`${input} resize-y`} />
          <textarea value={form.benefits} onChange={set('benefits')} placeholder="Benefits (one per line: health, equity, PTO)" rows={3} className={`${input} resize-y`} />
          <div className="grid grid-cols-2 gap-3">
            <div><span className={label}>Openings</span>
              <input type="number" min="1" value={form.openings} onChange={set('openings')} placeholder="1" className={input} />
            </div>
            <div><span className={label}>Apply by (deadline)</span>
              <input type="date" value={form.deadline} onChange={set('deadline')} className={input} />
            </div>
          </div>
          {msg && <p className="rounded-md border border-accent/30 bg-accent/10 p-2 text-xs text-accent">{msg}</p>}
          {!editLoaded ? (
            <p className="text-xs text-neutral-500">Loading role…</p>
          ) : (
            <button type="submit" disabled={busy} className="w-full rounded-md bg-[#f4f4f5] px-4 py-2 text-sm font-semibold text-black hover:bg-neutral-300 disabled:opacity-60">
              {busy ? (editId ? 'Saving…' : 'Posting…') : (editId ? 'Save changes →' : 'Post job →')}
            </button>
          )}
          {editId && (
            <Link to="/jobs/manage" className="block text-center text-xs text-neutral-400 hover:text-white">
              ← Back to Jobs
            </Link>
          )}
        </form>
        <div className="h-fit rounded-xl border border-white/10 bg-panel p-6">
          <h2 className="text-sm font-bold text-white">Your posted jobs</h2>
          {mineError && (
            <p className="mt-2 rounded-md bg-red-500/10 p-2 text-xs text-red-400">
              {mineError}{' '}
              <button type="button" onClick={refreshMine} className="font-semibold text-accent hover:underline">
                Retry
              </button>
            </p>
          )}
          {mine.length === 0 ? (
            <p className="mt-2 text-xs text-neutral-500">Nothing posted yet — your jobs will appear here and on the Jobs page.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {mine.map((j) => (
                <li key={j._id || j.id} className="flex items-center justify-between rounded-md border border-white/10 bg-panel2 p-2 text-sm">
                  <span className="text-neutral-300">{j.title} <span className="text-xs text-neutral-500">· {j.location}</span></span>
                  <Link to={`/jobs/${j._id || j.id}`} className="text-xs text-accent">View →</Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
