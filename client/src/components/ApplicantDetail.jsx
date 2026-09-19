import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { timeAgo } from '../lib/time';
import ResumeLink from './ResumeLink';

const STAGES = ['applied', 'reviewing', 'interview', 'offer', 'rejected'];

// Full applicant profile in a modal. Data comes from the already-fetched
// GET /api/applications/job/:jobId list — no extra request needed.
export default function ApplicantDetail({ app, jobTitle, now, profileUrl, onClose, onStatusChange }) {
  const c = app?.applicant || {};
  const jobs = Array.isArray(c.workExperiences) ? c.workExperiences : [];

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!app) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Applicant profile — ${c.name || 'Candidate'}`}
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-white/10 bg-panel p-6 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-white">{c.name || 'Candidate'}</h2>
              {c.openToWork && (
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">● Open to work</span>
              )}
            </div>
            <p className="mt-1 text-xs text-neutral-400">
              {c.title || 'Candidate'} · {c.location || '—'}
              {app.createdAt ? ` · ${timeAgo(app.createdAt, 'Applied', now)}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close applicant profile"
            autoFocus
            className="rounded-md border border-white/15 px-2 py-1 text-sm text-neutral-300 hover:border-accent hover:text-white"
          >
            ✕
          </button>
        </div>
        {profileUrl && (
          <Link to={profileUrl} className="mt-2 inline-block text-xs font-semibold text-accent hover:underline">
            Open full profile page ↗
          </Link>
        )}

        {(c.experienceYears != null || c.experienceLevel || c.availability) && (
          <div className="mt-3 flex flex-wrap gap-1">
            {(c.experienceYears != null || c.experienceLevel) && (
              <span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-neutral-300">
                {c.experienceYears != null ? `${c.experienceYears} yrs` : ''}{c.experienceLevel ? ` · ${c.experienceLevel}` : ''}
              </span>
            )}
            {c.availability && (
              <span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-neutral-300">{c.availability}</span>
            )}
          </div>
        )}

        <div className="mt-4 grid gap-2 text-xs text-neutral-300">
          {c.email && <p>✉️ {c.email}</p>}
          {c.phone && <p>📞 {c.phone}</p>}
          {(c.educationDegree || c.educationInstitution) && (
            <p>🎓 {[c.educationDegree, c.educationInstitution, c.graduationYear].filter(Boolean).join(', ')}</p>
          )}
        </div>

        {c.bio && (
          <div className="mt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">About</h3>
            <p className="mt-1 text-sm leading-relaxed text-neutral-300">{c.bio}</p>
          </div>
        )}

        {jobs.length > 0 && (
          <div className="mt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Experience</h3>
            <div className="mt-2 space-y-2">
              {jobs.map((w, i) => (
                <div key={i} className="rounded-md border border-white/10 bg-panel2 p-2">
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
          <div className="mt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Skills</h3>
            <div className="mt-2 flex flex-wrap gap-1">
              {c.skills.map((s) => (
                <span key={s} className="rounded-full bg-accent/15 px-2 py-0.5 text-xs text-accent">{s}</span>
              ))}
            </div>
          </div>
        )}

        {((c.desiredRoles || []).length > 0 || (c.workModes || []).length > 0 || (c.jobTypes || []).length > 0 || c.desiredLocation) && (
          <div className="mt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Preferences</h3>
            <p className="mt-1 text-xs text-neutral-400">
              Wants: {[...(c.desiredRoles || []), ...(c.jobTypes || []), ...(c.workModes || [])].join(' · ')}
              {c.desiredLocation ? ` · ${c.desiredLocation}` : ''}
            </p>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {c.resumeUrl && <ResumeLink url={c.resumeUrl} name={c.resumeName} className="rounded-md border border-accent/40 px-3 py-1 text-accent hover:bg-accent/10">Résumé ↗</ResumeLink>}
          {c.portfolioUrl && <a href={c.portfolioUrl} target="_blank" rel="noreferrer" className="rounded-md border border-white/15 px-3 py-1 text-white hover:border-accent">Portfolio ↗</a>}
          {c.linkedinUrl && <a href={c.linkedinUrl} target="_blank" rel="noreferrer" className="rounded-md border border-white/15 px-3 py-1 text-white hover:border-accent">LinkedIn ↗</a>}
          {c.githubUrl && <a href={c.githubUrl} target="_blank" rel="noreferrer" className="rounded-md border border-white/15 px-3 py-1 text-white hover:border-accent">GitHub ↗</a>}
        </div>

        {app.coverNote && (
          <div className="mt-4 rounded-md bg-panel2 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Why {jobTitle || 'us'}</p>
            <p className="mt-1 text-sm italic text-neutral-300">“{app.coverNote}”</p>
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
          <label htmlFor="applicant-detail-status" className="text-xs text-neutral-400">Stage:</label>
          <select
            id="applicant-detail-status"
            value={app.status}
            onChange={(e) => onStatusChange?.(app._id, e.target.value)}
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
    </div>
  );
}
