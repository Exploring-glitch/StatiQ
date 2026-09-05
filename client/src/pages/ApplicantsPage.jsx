import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';

const STAGES = ['applied', 'reviewing', 'interview', 'offer', 'rejected'];

export default function ApplicantsPage() {
  const { id } = useParams();
  const [apps, setApps] = useState([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [list, job] = await Promise.all([
          api.jobApplicants(id),
          api.job(id).catch(() => null),
        ]);
        setApps(list);
        if (job) setTitle(job.title || job.role);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const setStatus = async (appId, status) => {
    try {
      const updated = await api.setApplicantStatus(appId, status);
      setApps(apps.map((a) => (a._id === appId ? updated : a)));
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <Link to="/dashboard" className="text-sm text-slate-400 hover:text-white">← Dashboard</Link>
      <h1 className="mt-2 text-2xl font-bold text-white">Applicants{title ? ` — ${title}` : ''}</h1>
      {loading && <p className="mt-6 text-sm text-slate-400">Loading…</p>}
      {error && <p className="mt-4 rounded-md bg-red-500/10 p-2 text-xs text-red-400">{error}</p>}
      {!loading && !error && apps.length === 0 && (
        <p className="mt-6 rounded-xl border border-white/10 bg-surface p-6 text-sm text-slate-400">
          No applicants yet. Share your role to get discovered.
        </p>
      )}
      <div className="mt-6 space-y-3">
        {apps.map((a) => (
          <div key={a._id} className="rounded-xl border border-white/10 bg-surface p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-white">{a.applicant?.name}</p>
                <p className="text-xs text-slate-400">
                  {a.applicant?.title || 'Candidate'} · {a.applicant?.location || '—'} · {a.applicant?.email}
                </p>
                {(a.applicant?.skills || []).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {a.applicant.skills.map((s) => (
                      <span key={s} className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-slate-300">{s}</span>
                    ))}
                  </div>
                )}
              </div>
              <select
                value={a.status}
                onChange={(e) => setStatus(a._id, e.target.value)}
                className="rounded-md border border-white/10 bg-card px-2 py-1 text-xs text-white"
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
