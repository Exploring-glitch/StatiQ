import { useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, fileUrl } from '../lib/api';

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];
const WORK_MODES = ['Remote', 'Hybrid', 'On-site'];
const LEVELS = [
  { v: '', l: 'Select level' },
  { v: 'fresher', l: 'Fresher' },
  { v: 'entry', l: 'Entry (0–1 yrs)' },
  { v: 'mid', l: 'Mid (2–4 yrs)' },
  { v: 'senior', l: 'Senior (5–8 yrs)' },
  { v: 'lead', l: 'Lead / Staff (8+ yrs)' },
  { v: 'executive', l: 'Executive' },
];
const AVAIL = [
  { v: '', l: 'Select availability' },
  { v: 'immediate', l: 'Immediate joiner' },
  { v: '2-weeks', l: '2 weeks notice' },
  { v: '1-month', l: '1 month notice' },
  { v: '2-months', l: '2 months notice' },
  { v: 'open', l: 'Open / flexible' },
];

const input = 'w-full rounded-md border border-white/10 bg-panel2 px-3 py-2 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-accent/60';
const label = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-400';
const card = 'rounded-xl border border-white/10 bg-panel p-5 sm:p-6';
const chipOn = 'rounded-full border border-accent bg-accent/15 px-3 py-1 text-xs font-medium text-accent cursor-pointer';
const chipOff = 'rounded-full border border-white/15 px-3 py-1 text-xs text-neutral-300 hover:border-accent cursor-pointer';

const arr = (v) => (Array.isArray(v) ? v : []);
const numOrEmpty = (v) => (v === null || v === undefined ? '' : String(v));

const emptyExp = { company: '', title: '', startDate: '', endDate: '', current: false, description: '' };
const normExp = (w) => ({
  company: w?.company || '',
  title: w?.title || '',
  startDate: w?.startDate || '',
  endDate: w?.endDate || '',
  current: !!w?.current,
  description: w?.description || '',
});

export default function ProfilePage() {
  const { user, updateProfile, refresh } = useAuth();
  const isEmployer = user?.role === 'employer';
  const fileInput = useRef(null);

  const [form, setForm] = useState({
    name: user?.name || '',
    title: user?.title || '',
    location: user?.location || '',
    company: user?.company || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    resumeUrl: user?.resumeUrl || '',
    portfolioUrl: user?.portfolioUrl || '',
    linkedinUrl: user?.linkedinUrl || '',
    githubUrl: user?.githubUrl || '',
    experienceYears: numOrEmpty(user?.experienceYears),
    experienceLevel: user?.experienceLevel || '',
    workExperiences: arr(user?.workExperiences).map(normExp),
    openToWork: user?.openToWork ?? true,
    desiredRoles: arr(user?.desiredRoles).join(', '),
    jobTypes: arr(user?.jobTypes),
    workModes: arr(user?.workModes),
    desiredLocation: user?.desiredLocation || '',
    languages: arr(user?.languages).join(', '),
    skills: arr(user?.skills).join(', '),
    expectedSalaryMin: numOrEmpty(user?.expectedSalaryMin),
    expectedSalaryMax: numOrEmpty(user?.expectedSalaryMax),
    availability: user?.availability || '',
    educationDegree: user?.educationDegree || '',
    educationInstitution: user?.educationInstitution || '',
    graduationYear: numOrEmpty(user?.graduationYear),
  });
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [resumeName, setResumeName] = useState(user?.resumeName || '');
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const toggleList = (k, v) =>
    setForm((f) => ({ ...f, [k]: f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v] }));

  const isUploadedResume = form.resumeUrl.startsWith('/uploads/');

  const setExp = (i, k, v) =>
    setForm((f) => ({ ...f, workExperiences: f.workExperiences.map((w, j) => (j === i ? { ...w, [k]: v } : w)) }));
  const addExp = () => setForm((f) => ({ ...f, workExperiences: [...f.workExperiences, { ...emptyExp }] }));
  const removeExp = (i) =>
    setForm((f) => ({ ...f, workExperiences: f.workExperiences.filter((_, j) => j !== i) }));
  const toggleCurrent = (i) =>
    setForm((f) => ({
      ...f,
      workExperiences: f.workExperiences.map((w, j) =>
        j === i ? { ...w, current: !w.current, endDate: !w.current ? '' : w.endDate } : w
      ),
    }));

  const pickFile = async (file) => {
    if (!file) return;
    setUploadMsg('');
    if (!/\.(pdf|doc|docx)$/i.test(file.name)) {
      setUploadMsg('Only PDF, DOC or DOCX files are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadMsg('File is too big — max 5 MB.');
      return;
    }
    setUploadBusy(true);
    try {
      const updated = await api.uploadResume(file);
      await refresh();
      setForm((f) => ({ ...f, resumeUrl: updated.resumeUrl || '' }));
      setResumeName(updated.resumeName || file.name);
      setUploadMsg('Résumé uploaded.');
    } catch (err) {
      setUploadMsg(err.message);
    } finally {
      setUploadBusy(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const removeResume = async () => {
    setUploadMsg('');
    setUploadBusy(true);
    try {
      if (isUploadedResume) {
        await api.deleteResume();
        await refresh();
      }
      setForm((f) => ({ ...f, resumeUrl: '' }));
      setResumeName('');
    } catch (err) {
      setUploadMsg(err.message);
    } finally {
      setUploadBusy(false);
    }
  };

  const completion = useMemo(() => {
    if (isEmployer) {
      const checks = [form.name, form.title, form.company, form.location, form.bio];
      return Math.round((checks.filter((x) => String(x).trim()).length / checks.length) * 100);
    }
    const checks = [
      form.name, form.title, form.location, form.bio, form.phone,
      form.skills.trim(), form.desiredRoles.trim(),
      form.experienceYears !== '', form.experienceLevel,
      form.workExperiences.length > 0,
      form.jobTypes.length > 0, form.workModes.length > 0,
      form.availability, (form.resumeUrl || form.portfolioUrl || form.linkedinUrl),
      form.educationDegree, form.expectedSalaryMin !== '' || form.expectedSalaryMax !== '',
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [form, isEmployer]);

  const skillsList = form.skills.split(',').map((s) => s.trim()).filter(Boolean);
  const latestExp =
    form.workExperiences.find((w) => w.current && (w.title || w.company)) ||
    form.workExperiences.find((w) => w.title || w.company);

  const missing = [
    !form.bio.trim() && 'Add a 2–4 line summary',
    !skillsList.length && 'Add at least 5 skills',
    form.workExperiences.length === 0 && 'Add work experience',
    !(form.resumeUrl || form.portfolioUrl) && 'Upload your résumé or add a portfolio link',
    form.jobTypes.length === 0 && 'Pick job types',
    form.workModes.length === 0 && 'Pick work modes',
    !form.availability && 'Set availability / notice period',
    !form.educationDegree && 'Add education',
  ].filter(Boolean);

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    setBusy(true);
    try {
      const payload = {
        name: form.name.trim(),
        title: form.title.trim(),
        location: form.location.trim(),
        company: form.company.trim(),
        bio: form.bio.trim(),
        phone: form.phone.trim(),
        resumeUrl: form.resumeUrl.trim(),
        portfolioUrl: form.portfolioUrl.trim(),
        linkedinUrl: form.linkedinUrl.trim(),
        githubUrl: form.githubUrl.trim(),
        experienceYears: form.experienceYears === '' ? null : Number(form.experienceYears),
        experienceLevel: form.experienceLevel,
        workExperiences: form.workExperiences,
        openToWork: !!form.openToWork,
        desiredRoles: form.desiredRoles.split(',').map((s) => s.trim()).filter(Boolean),
        jobTypes: form.jobTypes,
        workModes: form.workModes,
        desiredLocation: form.desiredLocation.trim(),
        languages: form.languages.split(',').map((s) => s.trim()).filter(Boolean),
        skills: skillsList,
        expectedSalaryMin: form.expectedSalaryMin === '' ? null : Number(form.expectedSalaryMin),
        expectedSalaryMax: form.expectedSalaryMax === '' ? null : Number(form.expectedSalaryMax),
        availability: form.availability,
        educationDegree: form.educationDegree.trim(),
        educationInstitution: form.educationInstitution.trim(),
        graduationYear: form.graduationYear === '' ? null : Number(form.graduationYear),
      };
      await updateProfile(payload);
      setMsg('Profile saved.');
    } catch (err) {
      setMsg(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/20 text-2xl font-bold text-accent">
          {(user?.name || '?').charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-2xl font-bold text-white">{user?.name}</h1>
            <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">{user?.role}</span>
            {!isEmployer && form.openToWork && (
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                ● Open to work
              </span>
            )}
          </div>
          <p className="truncate text-sm text-neutral-400">
            {user?.email} {form.title ? `· ${form.title}` : ''} {form.location ? `· ${form.location}` : ''}
          </p>
        </div>
        <div className="w-full sm:w-64">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Profile strength</span>
            <span className={completion >= 80 ? 'text-emerald-400' : completion >= 50 ? 'text-amber-400' : 'text-accent'}>
              {completion}%
            </span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-panel2">
            <div
              className={`h-full rounded-full transition-all ${completion >= 80 ? 'bg-emerald-500' : completion >= 50 ? 'bg-amber-500' : 'bg-accent'}`}
              style={{ width: `${completion}%` }}
            />
          </div>
          <p className="mt-1 text-[11px] text-neutral-500">
            {completion >= 80 ? 'Strong — recruiters can find & shortlist you.' : 'Complete your profile to get discovered faster.'}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {/* Form */}
        <form onSubmit={submit} className="space-y-4 lg:col-span-2">
          {/* Basics */}
          <div className={card}>
            <h2 className="text-sm font-bold text-white">Basics</h2>
            <p className="text-xs text-neutral-500">How you appear in search and applications.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div><span className={label}>Full name *</span><input value={form.name} onChange={set('name')} required placeholder="Full name" className={input} /></div>
              <div><span className={label}>{isEmployer ? 'Your title' : 'Headline *'}</span><input value={form.title} onChange={set('title')} placeholder={isEmployer ? 'Founder, Hiring Manager…' : 'Senior Backend Engineer'} className={input} /></div>
              <div><span className={label}>Location</span><input value={form.location} onChange={set('location')} placeholder="Bengaluru, India" className={input} /></div>
              <div><span className={label}>{isEmployer ? 'Company *' : 'Current / last company'}</span><input value={form.company} onChange={set('company')} placeholder="Company" className={input} /></div>
              {!isEmployer && (
                <div><span className={label}>Phone</span><input value={form.phone} onChange={set('phone')} placeholder="+91 …" className={input} /></div>
              )}
              {!isEmployer && (
                <div><span className={label}>Desired location</span><input value={form.desiredLocation} onChange={set('desiredLocation')} placeholder="Remote / Bengaluru / NYC…" className={input} /></div>
              )}
            </div>
            <div className="mt-3">
              <span className={label}>{isEmployer ? 'About the company / hiring note' : 'Professional summary *'}</span>
              <textarea value={form.bio} onChange={set('bio')} rows={4} maxLength={1000}
                placeholder={isEmployer ? 'What are you building? What roles are you hiring for?' : '2–4 lines: what you do, years of experience, standout work, what you want next.'}
                className={`${input} resize-y`} />
              <p className="mt-1 text-right text-[11px] text-neutral-500">{form.bio.length}/1000</p>
            </div>
          </div>

          {!isEmployer && (
            <>
              {/* Work experience */}
              <div className={card}>
                <h2 className="text-sm font-bold text-white">Work experience</h2>
                <p className="text-xs text-neutral-500">Recruiters filter on these first.</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div><span className={label}>Total experience (years)</span><input type="number" min="0" max="50" step="0.5" value={form.experienceYears} onChange={set('experienceYears')} placeholder="e.g. 3" className={input} /></div>
                  <div><span className={label}>Experience level</span>
                    <select value={form.experienceLevel} onChange={set('experienceLevel')} className={input}>
                      {LEVELS.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  {form.workExperiences.map((w, i) => (
                    <div key={i} className="rounded-lg border border-white/10 bg-panel2 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-white">Role {i + 1}</p>
                        <button type="button" onClick={() => removeExp(i)} className="text-xs text-neutral-500 hover:text-red-400">
                          Remove
                        </button>
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div><span className={label}>Job title</span><input value={w.title} onChange={(e) => setExp(i, 'title', e.target.value)} placeholder="Senior Backend Engineer" className={input} /></div>
                        <div><span className={label}>Company</span><input value={w.company} onChange={(e) => setExp(i, 'company', e.target.value)} placeholder="Acme Inc" className={input} /></div>
                        <div><span className={label}>Start date</span><input type="month" value={w.startDate} onChange={(e) => setExp(i, 'startDate', e.target.value)} className={input} /></div>
                        <div><span className={label}>End date</span><input type="month" value={w.endDate} disabled={w.current} onChange={(e) => setExp(i, 'endDate', e.target.value)} className={`${input} disabled:opacity-40`} /></div>
                      </div>
                      <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs text-neutral-300">
                        <input type="checkbox" checked={w.current} onChange={() => toggleCurrent(i)} className="h-4 w-4 accent-[#E5483A]" />
                        I currently work here
                      </label>
                      <div className="mt-3">
                        <span className={label}>Job description</span>
                        <textarea value={w.description} onChange={(e) => setExp(i, 'description', e.target.value)} rows={3} maxLength={2000}
                          placeholder="What you owned, built, shipped…"
                          className={`${input} resize-y`} />
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addExp} className="mt-3 w-full rounded-md border border-dashed border-white/20 px-3 py-2 text-sm text-neutral-300 hover:border-accent">
                  + Add work experience
                </button>
              </div>

              {/* Skills */}
              <div className={card}>
                <h2 className="text-sm font-bold text-white">Skills</h2>
                <p className="text-xs text-neutral-500">Recruiters search on these — add your strongest first.</p>
                <div className="mt-4">
                  <span className={label}>Skills * (comma separated)</span>
                  <input value={form.skills} onChange={set('skills')} placeholder="React, Node, Postgres, AWS" className={input} />
                  {skillsList.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {skillsList.map((s) => (
                        <span key={s} className="rounded-full bg-accent/15 px-2 py-0.5 text-xs text-accent">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <span className={label}>Languages (comma separated)</span>
                  <input value={form.languages} onChange={set('languages')} placeholder="English, Hindi" className={input} />
                </div>
              </div>

              {/* Job preferences */}
              <div className={card}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-white">Job preferences</h2>
                    <p className="text-xs text-neutral-500">Match yourself to the right roles.</p>
                  </div>
                  <label className="flex cursor-pointer items-center gap-2 text-xs text-neutral-300">
                    <button type="button" onClick={() => setForm({ ...form, openToWork: !form.openToWork })}
                      className={`relative h-5 w-9 rounded-full transition ${form.openToWork ? 'bg-emerald-500' : 'bg-neutral-600'}`}>
                      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${form.openToWork ? 'left-4' : 'left-0.5'}`} />
                    </button>
                    Open to work
                  </label>
                </div>
                <div className="mt-4">
                  <span className={label}>Desired roles * (comma separated)</span>
                  <input value={form.desiredRoles} onChange={set('desiredRoles')} placeholder="Backend Engineer, Platform Engineer" className={input} />
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <span className={label}>Job type</span>
                    <div className="flex flex-wrap gap-2">
                      {JOB_TYPES.map((t) => (
                        <span key={t} onClick={() => toggleList('jobTypes', t)} className={form.jobTypes.includes(t) ? chipOn : chipOff}>{t}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className={label}>Work mode</span>
                    <div className="flex flex-wrap gap-2">
                      {WORK_MODES.map((t) => (
                        <span key={t} onClick={() => toggleList('workModes', t)} className={form.workModes.includes(t) ? chipOn : chipOff}>{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div><span className={label}>Min salary (annual)</span><input type="number" min="0" value={form.expectedSalaryMin} onChange={set('expectedSalaryMin')} placeholder="800000" className={input} /></div>
                  <div><span className={label}>Max salary (annual)</span><input type="number" min="0" value={form.expectedSalaryMax} onChange={set('expectedSalaryMax')} placeholder="1500000" className={input} /></div>
                  <div><span className={label}>Availability</span>
                    <select value={form.availability} onChange={set('availability')} className={input}>
                      {AVAIL.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Links */}
              <div className={card}>
                <h2 className="text-sm font-bold text-white">Links & résumé</h2>
                <p className="text-xs text-neutral-500">Profiles with a résumé + one proof-of-work link get far more replies.</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <span className={label}>Résumé * — upload file (PDF, DOC, DOCX · max 5 MB)</span>
                    <input
                      ref={fileInput}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => pickFile(e.target.files?.[0])}
                    />
                    {form.resumeUrl ? (
                      <div className="flex flex-wrap items-center gap-2 rounded-md border border-white/10 bg-panel2 px-3 py-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded bg-accent/15 text-sm font-bold text-accent">PDF</span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-white">
                            {isUploadedResume ? (resumeName || 'resume') : form.resumeUrl}
                          </p>
                          <a
                            href={fileUrl(form.resumeUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-accent hover:underline"
                          >
                            View ↗
                          </a>
                        </div>
                        <button
                          type="button"
                          disabled={uploadBusy}
                          onClick={() => fileInput.current?.click()}
                          className="rounded-md border border-white/15 px-3 py-1.5 text-xs text-white hover:border-accent disabled:opacity-60"
                        >
                          {uploadBusy ? 'Working…' : 'Replace'}
                        </button>
                        <button
                          type="button"
                          disabled={uploadBusy}
                          onClick={removeResume}
                          className="rounded-md border border-white/15 px-3 py-1.5 text-xs text-neutral-400 hover:border-red-500 hover:text-red-400 disabled:opacity-60"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={uploadBusy}
                        onClick={() => fileInput.current?.click()}
                        className="w-full rounded-md border border-dashed border-white/20 bg-panel2 px-3 py-4 text-center text-sm text-neutral-300 hover:border-accent disabled:opacity-60"
                      >
                        {uploadBusy ? 'Uploading…' : '📎 Click to choose your résumé file'}
                      </button>
                    )}
                    {uploadMsg && <p className="mt-1 text-xs text-accent">{uploadMsg}</p>}
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs text-neutral-500 hover:text-white">
                        …or paste a résumé link instead
                      </summary>
                      <input
                        value={isUploadedResume ? '' : form.resumeUrl}
                        onChange={(e) => { setForm({ ...form, resumeUrl: e.target.value }); setResumeName(''); }}
                        placeholder="https://…/resume.pdf"
                        className={`${input} mt-2`}
                      />
                    </details>
                  </div>
                  <div><span className={label}>Portfolio / website</span><input value={form.portfolioUrl} onChange={set('portfolioUrl')} placeholder="https://your-work.dev" className={input} /></div>
                  <div><span className={label}>LinkedIn</span><input value={form.linkedinUrl} onChange={set('linkedinUrl')} placeholder="https://linkedin.com/in/…" className={input} /></div>
                  <div><span className={label}>GitHub</span><input value={form.githubUrl} onChange={set('githubUrl')} placeholder="https://github.com/…" className={input} /></div>
                </div>
              </div>

              {/* Education */}
              <div className={card}>
                <h2 className="text-sm font-bold text-white">Education</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div><span className={label}>Degree</span><input value={form.educationDegree} onChange={set('educationDegree')} placeholder="B.Tech, CSE" className={input} /></div>
                  <div><span className={label}>Institution</span><input value={form.educationInstitution} onChange={set('educationInstitution')} placeholder="College / university" className={input} /></div>
                  <div><span className={label}>Graduation year</span><input type="number" min="1950" max="2100" value={form.graduationYear} onChange={set('graduationYear')} placeholder="2023" className={input} /></div>
                </div>
              </div>
            </>
          )}

          {msg && <p className="rounded-md border border-accent/30 bg-accent/10 p-2 text-xs text-accent">{msg}</p>}
          <div className="flex gap-3">
            <button disabled={busy} className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accentHover disabled:opacity-60">
              {busy ? 'Saving…' : 'Save profile'}
            </button>
          </div>
        </form>

        {/* Live preview */}
        <aside className="h-fit space-y-4 lg:sticky lg:top-20">
          <div className="rounded-xl border border-white/10 bg-panel p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Recruiter preview</p>
            <div className="mt-3 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 text-lg font-bold text-accent">
                {(form.name || '?').charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">{form.name || 'Your name'}</p>
                <p className="truncate text-xs text-neutral-400">{form.title || 'Headline'}</p>
              </div>
            </div>
            {form.bio && <p className="mt-3 line-clamp-4 text-xs leading-relaxed text-neutral-400">{form.bio}</p>}
            <div className="mt-3 space-y-1 text-xs text-neutral-400">
              {form.location && <p>📍 {form.location}{form.desiredLocation ? ` · wants ${form.desiredLocation}` : ''}</p>}
              {latestExp && (
                <p>🏢 {[latestExp.title, latestExp.company].filter(Boolean).join(' @ ')}
                  {(latestExp.startDate || latestExp.endDate || latestExp.current) && (
                    <> · {latestExp.startDate || '?'} – {latestExp.current ? 'Present' : latestExp.endDate || '?'}</>
                  )}
                </p>
              )}
              {(form.experienceYears !== '' || form.experienceLevel) && (
                <p>💼 {form.experienceYears !== '' ? `${form.experienceYears} yrs` : ''}{form.experienceLevel ? ` · ${form.experienceLevel}` : ''}</p>
              )}
              {form.availability && <p>🕒 {AVAIL.find((a) => a.v === form.availability)?.l}</p>}
              {(form.expectedSalaryMin !== '' || form.expectedSalaryMax !== '') && (
                <p>💰 {form.expectedSalaryMin || '?'} – {form.expectedSalaryMax || '?'} expected</p>
              )}
            </div>
            {skillsList.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {skillsList.slice(0, 8).map((s) => (
                  <span key={s} className="rounded-full bg-accent/15 px-2 py-0.5 text-[11px] text-accent">{s}</span>
                ))}
              </div>
            )}
            {(form.jobTypes.length > 0 || form.workModes.length > 0) && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[...form.jobTypes, ...form.workModes].map((t) => (
                  <span key={t} className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-neutral-300">{t}</span>
                ))}
              </div>
            )}
            <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
              {form.resumeUrl && <a href={fileUrl(form.resumeUrl)} target="_blank" rel="noreferrer" className="text-accent hover:underline">Résumé ↗</a>}
              {form.portfolioUrl && <a href={form.portfolioUrl} target="_blank" rel="noreferrer" className="text-accent hover:underline">Portfolio ↗</a>}
              {form.linkedinUrl && <a href={form.linkedinUrl} target="_blank" rel="noreferrer" className="text-accent hover:underline">LinkedIn ↗</a>}
              {form.githubUrl && <a href={form.githubUrl} target="_blank" rel="noreferrer" className="text-accent hover:underline">GitHub ↗</a>}
            </div>
          </div>
          {!isEmployer && (
            <div className="rounded-xl border border-white/10 bg-panel p-5 text-xs text-neutral-400">
              {missing.length > 0 ? (
                <>
                  <p className="font-bold text-white">Missing for better matches:</p>
                  <ul className="mt-2 list-disc space-y-1 pl-4">
                    {missing.map((tip) => (
                      <li key={tip}>{tip}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="font-bold text-emerald-400">✓ All set — your profile is complete and ready to get discovered.</p>
              )}
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
