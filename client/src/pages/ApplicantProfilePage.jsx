import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { timeAgo, useNow } from '../lib/time';
import { useToast } from '../components/Toast';
import ResumeLink from '../components/ResumeLink';

const STAGES = ['applied', 'reviewing', 'interview', 'offer', 'rejected'];

// Standalone applicant profile page for employers:
// /jobs/:jobId/applicants/:appId — direct link to one candidate's profile.
export default function ApplicantProfilePage() {
  const { jobId, appId } = useParams();
  const toast = useToast();
  const now = useNow();
  const [app, setApp] = useState(null);
  const [jobTitle, setJobTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const [list, job] = await Promise.all([
          api.jobApplicants(jobId),
          api.job(jobId).catch(() => null),
        ]);
        if (!alive) return;
        setApp(list.find((x) => x._id === appId) || null);
        if (job) setJobTitle(job.title || job.role || '');
      } catch (e) {
        if (alive) setError(e.message);
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => { alive = false; };
  }, [jobId, appId]);

  const setStatus = async (status) => {
    const prev = app?.status;
    setApp((a) => (a ? { ...a, status } : a));
    try {
      const updated = await api.setApplicantStatus(appId, status);
      setApp(updated);
      toast?.notify(`Moved to ${status}`, 'success');
    } catch (e) {
      setApp((a) => (a ? { ...a, status: prev } : a));
      setError(e.message);
      toast?.notify(e.message, 'error');
    }
  };

  const c = app?.applicant || {};
  const jobs = Array.isArray(c.workExperiences) ? c.workExperiences : [];

  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <Link to={`/jobs/${jobId}/applicants`} className="text-sm text-neutral-400 hover:text-white">← All applicants</Link>
      {loading && <p className="mt-6 text-sm text-neutral-400">Loading profile…</p>}
      {error && <p className="mt-6 rounded-md bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}
      {!loading && !error && !app && (
        <div className="mt-6 rounded-xl border border-white/10 bg-panel p-6 text-center">
          <p className="text-sm text-neutral-400">Applicant not found — they may have withdrawn.</p>
          <Link to={`/jobs/${jobId}/applicants`} className="mt-2 inline-block text-sm text-accent">← Back to applicants</Link>
        </div>
      )}
      {!loading && app && (
        <div className="mt-4 rounded-xl border border-white/10 bg-panel p-6">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold text-white">{c.name || 'Candidate'}</h1>
            {c.openToWork && (
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">● Open to work</span>
            )}
            {app.createdAt && (
              <span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-neutral-400" title={new Date(app.createdAt).toLocaleString()}>
                🕒 {timeAgo(app.createdAt, 'Applied', now)}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-neutral-400">
            {c.title || 'Candidate'} · {c.location || '—'}
            {jobTitle ? ` · applied for ${jobTitle}` : ''}
          </p>

          <div className="mt-4 grid gap-1 text-xs text-neutral-300">
            {c.email && <p>✉️ {c.email}</p>}
            {c.phone && <p>📞 {c.phone}</p>}
            {(c.educationDegree || c.educationInstitution) && (
              <p>🎓 {[c.educationDegree, c.educationInstitution, c.graduationYear].filter(Boolean).join(', ')}</p>
            )}
          </div>

          {c.bio && (
            <div className="mt-5">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">About</h2>
              <p className="mt-1 text-sm leading-relaxed text-neutral-300">{c.bio}</p>
            </div>
          )}

          {jobs.length > 0 && (
            <div className="mt-5">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Experience</h2>
              <div className="mt-2 space-y-2">
                {jobs.map((w, i) => (
                  <div key={i} className="rounded-md border border-white/10 bg-panel2 p-3">
                    <p className="text-xs font-medium text-neutral-200">{[w.title, w.company].filter(Boolean).join(' @ ') || 'Role'}</p>
                    {(w.startDate || w.endDate || w.current) && (
                      <p className="text-[11px] text-neutral-500">{w.startDate || '?'} – {w.current ? 'Present' : w.endDate || '?'}</p>
                    )}
                    {w.description && <p className="mt-1 text-xs text-neutral-400">{w.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(c.skills || []).length > 0 && (
            <div className="mt-5">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Skills</h2>
              <div className="mt-2 flex flex-wrap gap-1">
                {c.skills.map((s) => (
                  <span key={s} className="rounded-full bg-accent/15 px-2 py-0.5 text-xs text-accent">{s}</span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            {c.resumeUrl && <ResumeLink url={c.resumeUrl} name={c.resumeName} className="rounded-md border border-accent/40 px-3 py-1 text-accent hover:bg-accent/10">Résumé ↗</ResumeLink>}
            {c.portfolioUrl && <a href={c.portfolioUrl} target="_blank" rel="noreferrer" className="rounded-md border border-white/15 px-3 py-1 text-white hover:border-accent">Portfolio ↗</a>}
            {c.linkedinUrl && <a href={c.linkedinUrl} target="_blank" rel="noreferrer" className="rounded-md border border-white/15 px-3 py-1 text-white hover:border-accent">LinkedIn ↗</a>}
            {c.githubUrl && <a href={c.githubUrl} target="_blank" rel="noreferrer" className="rounded-md border border-white/15 px-3 py-1 text-white hover:border-accent">GitHub ↗</a>}
          </div>

          {app.coverNote && (
            <div className="mt-5 rounded-md bg-panel2 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Why {jobTitle || 'us'}</p>
              <p className="mt-1 text-sm italic text-neutral-300">“{app.coverNote}”</p>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
            <label htmlFor="applicant-page-status" className="text-xs text-neutral-400">Stage:</label>
            <select
              id="applicant-page-status"
              value={app.status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-md border border-white/10 bg-panel2 px-2 py-1 text-xs text-white"
            >
              {STAGES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {app.updatedAt && (
              <span className="ml-auto text-[11px] text-neutral-500" title={new Date(app.updatedAt).toLocaleString()}>
                Updated {timeAgo(app.updatedAt, '', now)}
              </span>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
