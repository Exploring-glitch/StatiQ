import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const empty = { title: '', company: '', location: '', salary: '', type: 'Full-time', remote: false, tags: '', description: '', responsibilities: '' };

export default function PostJobPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ ...empty, company: user?.company || '' });
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [mine, setMine] = useState([]);

  const refreshMine = () => {
    api.myPostedJobs()
      .then((d) => setMine(Array.isArray(d) ? d : d.items || []))
      .catch(() => {});
  };
  useEffect(() => { refreshMine(); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    setBusy(true);
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        responsibilities: form.responsibilities.split('\n').map((r) => r.trim()).filter(Boolean),
      };
      const created = await api.createJob(payload);
      setMsg(`Posted “${created.title}” successfully.`);
      setForm({ ...empty, company: user?.company || '' });
      refreshMine();
    } catch (err) {
      setMsg(err.message);
    } finally {
      setBusy(false);
    }
  };

  const input = 'w-full rounded-md border border-white/10 bg-base px-3 py-2 text-sm text-white placeholder:text-slate-500';

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-accent">Employer studio</p>
      <h1 className="mt-2 text-3xl font-bold text-white">Post a job — free.</h1>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <form onSubmit={submit} className="space-y-3 rounded-xl border border-white/10 bg-surface p-6">
          <input value={form.title} onChange={set('title')} required placeholder="Job title *" className={input} />
          <input value={form.company} onChange={set('company')} required placeholder="Company *" className={input} />
          <div className="grid grid-cols-2 gap-3">
            <input value={form.location} onChange={set('location')} required placeholder="Location *" className={input} />
            <input value={form.salary} onChange={set('salary')} placeholder="Salary (e.g. $150K – $190K)" className={input} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select value={form.type} onChange={set('type')} className={input}>
              <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option>
            </select>
            <label className="flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm text-slate-300">
              <input type="checkbox" checked={form.remote} onChange={set('remote')} className="accent-teal-500" /> Remote
            </label>
          </div>
          <input value={form.tags} onChange={set('tags')} placeholder="Tags (comma separated: AI, Fintech)" className={input} />
          <textarea value={form.description} onChange={set('description')} placeholder="Role description" rows={4} className={input} />
          <textarea value={form.responsibilities} onChange={set('responsibilities')} placeholder="Responsibilities (one per line)" rows={3} className={input} />
          {msg && <p className="rounded-md bg-accent/10 p-2 text-xs text-accent">{msg}</p>}
          <button disabled={busy} className="w-full rounded-md bg-accent px-4 py-2 text-sm font-semibold text-base hover:bg-accentHover disabled:opacity-60">
            {busy ? 'Posting…' : 'Post job →'}
          </button>
        </form>
        <div className="h-fit rounded-xl border border-white/10 bg-card p-6">
          <h2 className="text-sm font-bold text-white">Your posted jobs</h2>
          {mine.length === 0 ? (
            <p className="mt-2 text-xs text-slate-500">Nothing posted yet — your jobs will appear here and on the Jobs page.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {mine.map((j) => (
                <li key={j._id || j.id} className="flex items-center justify-between rounded-md border border-white/10 p-2 text-sm">
                  <span className="text-slate-200">{j.title} <span className="text-xs text-slate-500">· {j.location}</span></span>
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
