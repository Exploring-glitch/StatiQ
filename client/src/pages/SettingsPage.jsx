import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

const card = 'rounded-xl border border-white/10 bg-panel p-5 sm:p-6';
const input = 'w-full rounded-md border border-white/10 bg-panel2 px-3 py-2 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-accent/60';

// Employer + seeker account settings: account facts, password rotation,
// notification inbox access, company settings shortcut (employers) and logout.
// Personal data stays on /profile, company data on /company/manage.
export default function SettingsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const isEmployer = user?.role === 'employer';
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const rotatePassword = async (e) => {
    e.preventDefault();
    setMsg('');
    setBusy(true);
    try {
      await api.changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setMsg('Password updated.');
      toast?.notify('Password updated', 'success');
    } catch (err) {
      setMsg(err?.message || 'Could not update password.');
      toast?.notify(err?.message || 'Could not update password.', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-accent">Settings</p>
      <h1 className="mt-2 text-3xl font-bold text-white">Account settings</h1>
      <p className="mt-1 text-sm text-neutral-400">Signed in as {user?.email} · {user?.role}</p>

      <div className={`${card} mt-6`}>
        <h2 className="text-sm font-bold text-white">Account</h2>
        <p className="mt-1 text-xs text-neutral-500">Personal details live on your profile — this is just the facts.</p>
        <dl className="mt-3 space-y-2 text-sm">
          {[
            ['Name', user?.name || '—'],
            ['Email', user?.email || '—'],
            ['Role', user?.role || '—'],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-2 border-b border-white/5 py-1.5 last:border-0">
              <dt className="w-24 shrink-0 pt-0.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">{k}</dt>
              <dd className="min-w-0 flex-1 break-words text-neutral-200">{v}</dd>
            </div>
          ))}
        </dl>
        <Link to="/profile" className="mt-3 inline-block text-xs font-semibold text-accent hover:underline">
          Edit {isEmployer ? 'personal' : ''} profile →
        </Link>
      </div>

      {isEmployer && (
        <div className={`${card} mt-4`}>
          <h2 className="text-sm font-bold text-white">Company settings</h2>
          <p className="mt-1 text-xs text-neutral-500">Logo, mission, socials, culture — everything seekers see.</p>
          <Link
            to="/company/manage"
            className="mt-3 inline-block rounded-md border border-white/15 px-3 py-1.5 text-xs text-white hover:border-accent"
          >
            Manage company profile →
          </Link>
        </div>
      )}

      <div className={`${card} mt-4`}>
        <h2 className="text-sm font-bold text-white">Notifications</h2>
        <p className="mt-1 text-xs text-neutral-500">
          {isEmployer ? 'New applicants and hiring updates land here.' : 'Matches and application updates land here.'}
        </p>
        <Link
          to="/notifications"
          className="mt-3 inline-block rounded-md border border-white/15 px-3 py-1.5 text-xs text-white hover:border-accent"
        >
          Open inbox →
        </Link>
      </div>

      <div className={`${card} mt-4`}>
        <h2 className="text-sm font-bold text-white">Security</h2>
        <p className="mt-1 text-xs text-neutral-500">Rotate your password — 8+ characters.</p>
        <form onSubmit={rotatePassword} className="mt-3 grid gap-3 sm:grid-cols-2">
          <input
            type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
            required placeholder="Current password" autoComplete="current-password" className={input}
          />
          <input
            type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
            required minLength={8} placeholder="New password (8+ chars)" autoComplete="new-password" className={input}
          />
          <div className="sm:col-span-2">
            <button
              type="submit" disabled={busy}
              className="rounded-md bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-accentHover disabled:opacity-60"
            >
              {busy ? 'Updating…' : 'Update password'}
            </button>
            {msg && <p className="mt-2 text-xs text-neutral-400">{msg}</p>}
          </div>
        </form>
      </div>

      <div className={`${card} mt-4`}>
        <h2 className="text-sm font-bold text-white">Session</h2>
        <Link to="/logout" className="mt-3 inline-block rounded-md border border-red-500/30 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10">
          Log out →
        </Link>
      </div>
    </section>
  );
}
