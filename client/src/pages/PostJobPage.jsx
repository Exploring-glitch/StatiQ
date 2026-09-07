import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const empty = {
  title: '', company: '', location: '', salary: '',
  salaryMin: '', salaryMax: '', type: 'Full-time',
  workMode: 'On-site', experienceLevel: '',
  tags: '', description: '', responsibilities: '',
};

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

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    setBusy(true);
    try {
      const payload = {
        ...form,
        salaryMin: form.salaryMin === '' ? null : Number(form.salaryMin),
        salaryMax: form.salaryMax === '' ? null : Number(form.salaryMax),
        remote: form.workMode === 'Remote',
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

  const input = 'w-full rounded-md border border-white/10 bg-panel2 px-3 py-2 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-accent/60';
  const label = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500';

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-accent">Employer studio</p>
      <h1 className="mt-2 text-3xl font-bold text-white">Post a job — free.</h1>
      <p className="mt-2 text-sm text-neutral-400">Rich details (salary range, level, work mode) get far more applicants — and make your role filterable.</p>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <form onSubmit={submit} className="space-y-3 rounded-xl border border-white/10 bg-panel p-6">
          <input value={form.title} onChange={set('title')} required placeholder="Job title *" className={input} />
          <input value={form.company} onChange={set('company')} required placeholder="Company *" className={input} />
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
          <input value={form.tags} onChange={set('tags')} placeholder="Tags (comma separated: AI, Fintech)" className={input} />
          <textarea value={form.description} onChange={set('description')} placeholder="Role description" rows={4} className={`${input} resize-y`} />
          <textarea value={form.responsibilities} onChange={set('responsibilities')} placeholder="Responsibilities (one per line)" rows={3} className={`${input} resize-y`} />
          {msg && <p className="rounded-md border border-accent/30 bg-accent/10 p-2 text-xs text-accent">{msg}</p>}
          <button disabled={busy} className="w-full rounded-md bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-neutral-300 disabled:opacity-60">
            {busy ? 'Posting…' : 'Post job →'}
          </button>
        </form>
        <div className="h-fit rounded-xl border border-white/10 bg-panel p-6">
          <h2 className="text-sm font-bold text-white">Your posted jobs</h2>
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
