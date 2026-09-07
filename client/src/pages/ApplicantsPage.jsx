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
      <Link to="/dashboard" className="text-sm text-neutral-400 hover:text-white">← Dashboard</Link>
      <h1 className="mt-2 text-2xl font-bold text-white">Applicants{title ? ` — ${title}` : ''}</h1>
      {loading && <p className="mt-6 text-sm text-neutral-400">Loading…</p>}
      {error && <p className="mt-4 rounded-md bg-red-500/10 p-2 text-xs text-red-400">{error}</p>}
      {!loading && !error && apps.length === 0 && (
        <p className="mt-6 rounded-xl border border-white/10 bg-panel p-6 text-sm text-neutral-400">
          No applicants yet. Share your role to get discovered.
        </p>
      )}
      <div className="mt-6 space-y-3">
        {apps.map((a) => {
          const c = a.applicant || {};
          return (
            <div key={a._id} className="rounded-xl border border-white/10 bg-panel p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-white">{c.name}</p>
                    {c.openToWork && (
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">● Open to work</span>
                    )}
                    {(c.experienceYears != null || c.experienceLevel) && (
                      <span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-neutral-300">
                        {c.experienceYears != null ? `${c.experienceYears} yrs` : ''}{c.experienceLevel ? ` · ${c.experienceLevel}` : ''}
                      </span>
                    )}
                    {c.availability && (
                      <span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-neutral-300">{c.availability}</span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-neutral-400">
                    {c.title || 'Candidate'} · {c.location || '—'} · {c.email}
                    {(c.educationDegree || c.educationInstitution) && (
                      <> · 🎓 {[c.educationDegree, c.educationInstitution, c.graduationYear].filter(Boolean).join(', ')}</>
                    )}
                  </p>
                  {c.bio && <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-neutral-400">{c.bio}</p>}
                  {(c.skills || []).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {c.skills.map((s) => (
                        <span key={s} className="rounded-full bg-accent/15 px-2 py-0.5 text-xs text-accent">{s}</span>
                      ))}
                    </div>
                  )}
                  {((c.desiredRoles || []).length > 0 || (c.workModes || []).length > 0 || (c.jobTypes || []).length > 0) && (
                    <p className="mt-1.5 text-[11px] text-neutral-500">
                      Wants: {[...(c.desiredRoles || []), ...(c.jobTypes || []), ...(c.workModes || [])].join(' · ')}
                      {c.desiredLocation ? ` · ${c.desiredLocation}` : ''}
                    </p>
                  )}
                  <div className="mt-1.5 flex flex-wrap gap-2 text-[11px]">
                    {c.resumeUrl && <a href={c.resumeUrl} target="_blank" rel="noreferrer" className="text-accent hover:underline">Résumé ↗</a>}
                    {c.portfolioUrl && <a href={c.portfolioUrl} target="_blank" rel="noreferrer" className="text-accent hover:underline">Portfolio ↗</a>}
                    {c.linkedinUrl && <a href={c.linkedinUrl} target="_blank" rel="noreferrer" className="text-accent hover:underline">LinkedIn ↗</a>}
                    {c.githubUrl && <a href={c.githubUrl} target="_blank" rel="noreferrer" className="text-accent hover:underline">GitHub ↗</a>}
                    {c.phone && <span className="text-neutral-500">{c.phone}</span>}
                  </div>
                  {a.coverNote && <p className="mt-2 rounded-md bg-panel2 p-2 text-xs italic text-neutral-400">“{a.coverNote}”</p>}
                </div>
                <select
                  value={a.status}
                  onChange={(e) => setStatus(a._id, e.target.value)}
                  className="rounded-md border border-white/10 bg-panel2 px-2 py-1 text-xs text-white"
                >
                  {STAGES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
