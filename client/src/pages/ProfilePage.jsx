import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    title: user?.title || '',
    location: user?.location || '',
    company: user?.company || '',
    skills: (user?.skills || []).join(', '),
  });
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const input = 'w-full rounded-md border border-white/10 bg-base px-3 py-2 text-sm text-white placeholder:text-slate-500';

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    setBusy(true);
    try {
      await updateProfile({
        ...form,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
      });
      setMsg('Profile saved.');
    } catch (err) {
      setMsg(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/20 text-2xl font-bold text-accent">
          {(user?.name || '?').charAt(0).toUpperCase()}
        </span>
        <div>
          <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
          <p className="text-sm text-slate-400">{user?.email} · <span className="text-accent">{user?.role}</span></p>
        </div>
      </div>

      <form onSubmit={submit} className="mt-8 space-y-3 rounded-xl border border-white/10 bg-surface p-6">
        <h2 className="text-sm font-bold text-white">Edit profile</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input value={form.name} onChange={set('name')} required placeholder="Full name" className={input} />
          <input value={form.title} onChange={set('title')} placeholder={user?.role === 'employer' ? 'Your title (e.g. Founder)' : 'Headline (e.g. Senior Backend Engineer)'} className={input} />
          <input value={form.location} onChange={set('location')} placeholder="Location" className={input} />
          <input value={form.company} onChange={set('company')} placeholder="Company" className={input} />
        </div>
        <input value={form.skills} onChange={set('skills')} placeholder="Skills (comma separated: React, Node, Postgres)" className={input} />
        {form.skills.trim() && (
          <div className="flex flex-wrap gap-2">
            {form.skills.split(',').map((s) => s.trim()).filter(Boolean).map((s) => (
              <span key={s} className="rounded-full bg-accent/15 px-2 py-0.5 text-xs text-accent">{s}</span>
            ))}
          </div>
        )}
        {msg && <p className="rounded-md bg-accent/10 p-2 text-xs text-accent">{msg}</p>}
        <div className="flex gap-3">
          <button disabled={busy} className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-base hover:bg-accentHover disabled:opacity-60">
            {busy ? 'Saving…' : 'Save profile'}
          </button>
          <button type="button" onClick={logout} className="rounded-md border border-white/15 px-4 py-2 text-sm text-white">
            Log out
          </button>
        </div>
      </form>
    </section>
  );
}
