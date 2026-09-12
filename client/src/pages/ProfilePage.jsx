import { useEffect, useMemo, useRef, useState } from 'react';
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
const PRONOUNS = [
  { v: '', l: 'Select pronouns' },
  { v: 'she-her', l: 'She / Her' },
  { v: 'he-him', l: 'He / Him' },
  { v: 'they-them', l: 'They / Them' },
  { v: 'she-they', l: 'She / They' },
  { v: 'he-they', l: 'He / They' },
  { v: 'xe-xem', l: 'Xe / Xem' },
  { v: 'prefer-not-to-say', l: 'Prefer not to say' },
];
const GENDERS = [
  { v: '', l: 'Select gender' },
  { v: 'woman', l: 'Woman' },
  { v: 'man', l: 'Man' },
  { v: 'non-binary', l: 'Non-binary' },
  { v: 'transgender', l: 'Transgender' },
  { v: 'genderfluid', l: 'Genderfluid' },
  { v: 'agender', l: 'Agender' },
  { v: 'prefer-not-to-say', l: 'Prefer not to say' },
];
const ETHNICITIES = [
  { v: '', l: 'Select race / ethnicity' },
  { v: 'asian', l: 'Asian' },
  { v: 'black', l: 'Black or African' },
  { v: 'hispanic', l: 'Hispanic or Latino' },
  { v: 'middle-eastern', l: 'Middle Eastern or North African' },
  { v: 'native', l: 'Native / Indigenous' },
  { v: 'pacific-islander', l: 'Native Hawaiian or Pacific Islander' },
  { v: 'white', l: 'White or Caucasian' },
  { v: 'mixed', l: 'Mixed / Multiple' },
  { v: 'prefer-not-to-say', l: 'Prefer not to say' },
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

// Per-section server snapshots (used for init + Cancel) and option labels.
const snapBasics = (u) => ({ name: u?.name || '', title: u?.title || '', location: u?.location || '', company: u?.company || '', bio: u?.bio || '', phone: u?.phone || '', desiredLocation: u?.desiredLocation || '', desiredRoles: arr(u?.desiredRoles).join(', ') });
const snapIdentity = (u) => ({ pronouns: u?.pronouns || '', gender: u?.gender || '', ethnicity: u?.ethnicity || '' });
const snapExperience = (u) => ({ experienceYears: numOrEmpty(u?.experienceYears), experienceLevel: u?.experienceLevel || '', workExperiences: arr(u?.workExperiences).map(normExp) });
const snapSkills = (u) => ({ skills: arr(u?.skills).join(', '), languages: arr(u?.languages).join(', ') });
const snapPrefs = (u) => ({ openToWork: u?.openToWork ?? true, jobTypes: arr(u?.jobTypes), workModes: arr(u?.workModes), expectedSalaryMin: numOrEmpty(u?.expectedSalaryMin), expectedSalaryMax: numOrEmpty(u?.expectedSalaryMax), availability: u?.availability || '' });
const snapLinks = (u) => ({ resumeUrl: u?.resumeUrl || '', portfolioUrl: u?.portfolioUrl || '', linkedinUrl: u?.linkedinUrl || '', githubUrl: u?.githubUrl || '' });
const snapEducation = (u) => ({ educationDegree: u?.educationDegree || '', educationInstitution: u?.educationInstitution || '', graduationYear: numOrEmpty(u?.graduationYear) });
const SNAPS = { basics: snapBasics, identity: snapIdentity, experience: snapExperience, skills: snapSkills, prefs: snapPrefs, links: snapLinks, education: snapEducation };

// Full server snapshot for form init + re-sync.
const buildFresh = (u) => ({
  ...snapBasics(u),
  ...snapIdentity(u),
  ...snapExperience(u),
  ...snapSkills(u),
  ...snapPrefs(u),
  ...snapLinks(u),
  ...snapEducation(u),
});

// Sections with data start collapsed in view mode.
const buildEditing = (u) => {
  const emp = u?.role === 'employer';
  return {
    basics: emp
      ? !(u?.name && u?.company && u?.bio)
      : !(u?.title && u?.bio),
    identity: !(u?.pronouns || u?.gender || u?.ethnicity),
    experience: !(u?.experienceYears != null || u?.experienceLevel || (u?.workExperiences || []).length),
    skills: !((u?.skills || []).length || (u?.languages || []).length),
    prefs: !((u?.jobTypes || []).length || (u?.workModes || []).length || u?.availability),
    links: !(u?.resumeUrl || u?.portfolioUrl || u?.linkedinUrl || u?.githubUrl),
    education: !(u?.educationDegree || u?.educationInstitution || u?.graduationYear != null),
  };
};

const readDraft = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

// Restore unsaved edits surviving a refresh; server data wins for the
// résumé since uploads save immediately.
const applyDraft = (fresh, d) => {
  if (!d) return fresh;
  return {
    ...fresh,
    ...d,
    resumeUrl: fresh.resumeUrl || d.resumeUrl || '',
    workExperiences: Array.isArray(d.workExperiences) ? d.workExperiences.map(normExp) : fresh.workExperiences,
  };
};

const optLabel = (list, v) => (list.find((o) => o.v === v)?.l || '');

// Card header with per-section Edit / Cancel + Save.
function SecHead({ title, sub, isEditing, busy, msg, onEdit, onCancel, onSave }) {
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-white">{title}</h2>
          {sub && <p className="text-xs text-neutral-500">{sub}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {isEditing ? (
            <>
              <button type="button" onClick={onCancel} className="rounded-md border border-white/15 px-3 py-1.5 text-xs text-neutral-300 hover:border-accent">
                Cancel
              </button>
              <button type="button" onClick={onSave} disabled={busy} className="rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-accentHover disabled:opacity-60">
                {busy ? 'Saving…' : 'Save'}
              </button>
            </>
          ) : (
            <button type="button" onClick={onEdit} className="rounded-md border border-white/15 px-3 py-1.5 text-xs text-white hover:border-accent">
              Edit
            </button>
          )}
        </div>
      </div>
      {msg?.text && (
        <p
          className={`mt-2 rounded-md border p-2 text-xs ${
            msg.error
              ? 'border-red-500/30 bg-red-500/10 text-red-400'
              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
          }`}
        >
          {msg.error ? msg.text : `✓ ${msg.text}`}
        </p>
      )}
    </div>
  );
}

// Read-only label/value row for view mode.
function Row({ k, v, link }) {
  const body = link && v
    ? <a href={link} target="_blank" rel="noreferrer" className="break-all text-accent hover:underline">{v}</a>
    : (v || <span className="text-neutral-600">—</span>);
  return (
    <div className="flex gap-2 border-b border-white/5 py-1.5 text-sm last:border-0">
      <span className="w-28 shrink-0 pt-0.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">{k}</span>
      <span className="min-w-0 flex-1 break-words text-neutral-200">{body}</span>
    </div>
  );
}

export default function ProfilePage() {
  const { user, updateProfile, refresh } = useAuth();
  const isEmployer = user?.role === 'employer';
  const fileInput = useRef(null);
  const avatarInput = useRef(null);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const draftKey = `statiq_profile_draft_${user?.id || 'guest'}`;
  // Tracks which account the form was last synced from. Auth loads async,
  // so the first render usually snapshots user=null — see sync effect below.
  const hydratedId = useRef(user?.id || null);

  const [form, setForm] = useState(() => applyDraft(buildFresh(user), readDraft(draftKey)));

  // Persist every keystroke so a refresh never wipes unsaved edits.
  // Skipped until this account's server data has hydrated, so the initial
  // empty form can never overwrite a real draft.
  useEffect(() => {
    if (!user?.id || hydratedId.current !== user.id) return;
    try {
      localStorage.setItem(draftKey, JSON.stringify(form));
    } catch { /* storage full/blocked → form still works in memory */ }
  }, [form, draftKey, user?.id]);

  // Re-sync once the real user arrives (or the account changes). Runs only
  // on account change — never on profile saves — so in-progress edits in
  // other sections are never clobbered.
  useEffect(() => {
    if (!user?.id || hydratedId.current === user.id) return;
    hydratedId.current = user.id;
    setForm(applyDraft(buildFresh(user), readDraft(`statiq_profile_draft_${user.id}`)));
    setEditing(buildEditing(user));
    setResumeName(user.resumeName || '');
    try {
      localStorage.removeItem('statiq_profile_draft_guest');
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);
  const [resumeName, setResumeName] = useState(user?.resumeName || '');
  const [uploadBusy, setUploadBusy] = useState(false);

  // Per-section edit mode (sections with data start collapsed in view mode),
  // per-section save state. Each card saves only its own fields.
  const [editing, setEditing] = useState(() => buildEditing(user));
  const [secBusy, setSecBusy] = useState('');
  const [secMsg, setSecMsg] = useState({});
  const msgTimers = useRef({});

  // Success notes auto-dismiss after a moment; errors stay until acted on.
  const flashMsg = (key, text, error = false, dismissMs = 1800) => {
    if (msgTimers.current[key]) clearTimeout(msgTimers.current[key]);
    setSecMsg((m) => ({ ...m, [key]: text ? { text, error } : '' }));
    if (text && !error) {
      msgTimers.current[key] = setTimeout(() => {
        setSecMsg((m) => ({ ...m, [key]: '' }));
      }, dismissMs);
    }
  };

  useEffect(() => {
    const timers = msgTimers.current;
    return () => Object.values(timers).forEach(clearTimeout);
  }, []);

  const startEdit = (key) => {
    flashMsg(key, '');
    setEditing((e) => ({ ...e, [key]: true }));
  };
  const cancelEdit = (key) => {
    setForm((f) => ({ ...f, ...SNAPS[key](user) }));
    if (key === 'links') setResumeName(user?.resumeName || '');
    flashMsg(key, '');
    setEditing((e) => ({ ...e, [key]: false }));
  };

  const sectionPayload = (key) => {
    switch (key) {
      case 'basics': {
        const p = {
          name: form.name.trim(),
          title: form.title.trim(),
          location: form.location.trim(),
          company: form.company.trim(),
          bio: form.bio.trim(),
          desiredRoles: form.desiredRoles.split(',').map((s) => s.trim()).filter(Boolean),
        };
        if (!isEmployer) {
          p.phone = form.phone.trim();
          p.desiredLocation = form.desiredLocation.trim();
        }
        return p;
      }
      case 'identity':
        return { pronouns: form.pronouns, gender: form.gender, ethnicity: form.ethnicity };
      case 'experience':
        return {
          experienceYears: form.experienceYears === '' ? null : Number(form.experienceYears),
          experienceLevel: form.experienceLevel,
          workExperiences: form.workExperiences,
        };
      case 'skills':
        return {
          skills: skillsList,
          languages: form.languages.split(',').map((s) => s.trim()).filter(Boolean),
        };
      case 'prefs':
        return {
          openToWork: !!form.openToWork,
          jobTypes: form.jobTypes,
          workModes: form.workModes,
          expectedSalaryMin: form.expectedSalaryMin === '' ? null : Number(form.expectedSalaryMin),
          expectedSalaryMax: form.expectedSalaryMax === '' ? null : Number(form.expectedSalaryMax),
          availability: form.availability,
        };
      case 'links':
        return {
          resumeUrl: form.resumeUrl.trim(),
          portfolioUrl: form.portfolioUrl.trim(),
          linkedinUrl: form.linkedinUrl.trim(),
          githubUrl: form.githubUrl.trim(),
        };
      case 'education':
        return {
          educationDegree: form.educationDegree.trim(),
          educationInstitution: form.educationInstitution.trim(),
          graduationYear: form.graduationYear === '' ? null : Number(form.graduationYear),
        };
      default:
        return {};
    }
  };

  const saveSection = async (key) => {
    flashMsg(key, '');
    setSecBusy(key);
    try {
      await updateProfile(sectionPayload(key));
      setEditing((e) => ({ ...e, [key]: false }));
      flashMsg(key, 'Saved');
    } catch (err) {
      flashMsg(key, err.message, true);
    } finally {
      setSecBusy('');
    }
  };

  const head = (key, title, sub) => (
    <SecHead
      title={title}
      sub={sub}
      isEditing={editing[key]}
      busy={secBusy === key}
      msg={secMsg[key]}
      onEdit={() => startEdit(key)}
      onCancel={() => cancelEdit(key)}
      onSave={() => saveSection(key)}
    />
  );

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
    flashMsg('__resume', '');
    if (!/\.(pdf|doc|docx)$/i.test(file.name)) {
      flashMsg('__resume', 'Only PDF, DOC or DOCX files are allowed.', true);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      flashMsg('__resume', 'File is too big — max 5 MB.', true);
      return;
    }
    setUploadBusy(true);
    try {
      const updated = await api.uploadResume(file);
      await refresh();
      setForm((f) => ({ ...f, resumeUrl: updated.resumeUrl || '' }));
      setResumeName(updated.resumeName || file.name);
      flashMsg('__resume', 'Résumé uploaded.');
    } catch (err) {
      flashMsg('__resume', err.message, true);
    } finally {
      setUploadBusy(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const removeResume = async () => {
    flashMsg('__resume', '');
    setUploadBusy(true);
    try {
      if (isUploadedResume) {
        await api.deleteResume();
        await refresh();
      }
      setForm((f) => ({ ...f, resumeUrl: '' }));
      setResumeName('');
      flashMsg('__resume', 'Résumé removed.');
    } catch (err) {
      flashMsg('__resume', err.message, true);
    } finally {
      setUploadBusy(false);
    }
  };

  const pickAvatar = async (file) => {
    if (!file) return;
    flashMsg('__avatar', '');
    if (!/\.(jpe?g|png|webp)$/i.test(file.name)) {
      flashMsg('__avatar', 'Only JPG, PNG or WebP images are allowed.', true);
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      flashMsg('__avatar', 'Image is too big — max 2 MB.', true);
      return;
    }
    setAvatarBusy(true);
    try {
      await api.uploadAvatar(file);
      await refresh();
      flashMsg('__avatar', 'Photo updated.');
    } catch (err) {
      flashMsg('__avatar', err.message, true);
    } finally {
      setAvatarBusy(false);
      if (avatarInput.current) avatarInput.current.value = '';
    }
  };

  const removeAvatar = async () => {
    flashMsg('__avatar', '');
    setAvatarBusy(true);
    try {
      await api.deleteAvatar();
      await refresh();
      flashMsg('__avatar', 'Photo removed.');
    } catch (err) {
      flashMsg('__avatar', err.message, true);
    } finally {
      setAvatarBusy(false);
    }
  };

  const completion = useMemo(() => {
    const has = (v) => String(v ?? '').trim().length > 0;
    const hasList = (v) => String(v ?? '').split(',').map((s) => s.trim()).filter(Boolean).length > 0;
    if (isEmployer) {
      const checks = [
        has(form.name),
        has(form.title),
        has(form.company),
        has(form.location),
        has(form.bio),
        Boolean(user?.avatarUrl),
      ];
      return Math.round((checks.filter(Boolean).length / checks.length) * 100);
    }
    // Every fillable detail counts — 100% is reachable only when all are set.
    const checks = [
      has(form.name),
      has(form.title),
      has(form.location),
      has(form.company),
      has(form.bio),
      has(form.phone),
      has(form.desiredLocation),
      hasList(form.desiredRoles),
      has(form.pronouns),
      has(form.gender),
      has(form.ethnicity),
      form.experienceYears !== '',
      has(form.experienceLevel),
      form.workExperiences.length > 0,
      hasList(form.skills),
      hasList(form.languages),
      form.jobTypes.length > 0,
      form.workModes.length > 0,
      form.expectedSalaryMin !== '',
      form.expectedSalaryMax !== '',
      has(form.availability),
      has(form.resumeUrl),
      has(form.portfolioUrl),
      has(form.linkedinUrl),
      has(form.githubUrl),
      has(form.educationDegree),
      has(form.educationInstitution),
      form.graduationYear !== '',
      Boolean(user?.avatarUrl),
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [form, isEmployer, user?.avatarUrl]);

  const skillsList = form.skills.split(',').map((s) => s.trim()).filter(Boolean);
  const desiredRolesList = form.desiredRoles.split(',').map((s) => s.trim()).filter(Boolean);
  const latestExp =
    form.workExperiences.find((w) => w.current && (w.title || w.company)) ||
    form.workExperiences.find((w) => w.title || w.company);

  const hasVal = (v) => String(v ?? '').trim().length > 0;

  const missing = [
    !hasVal(form.name) && 'Add your full name',
    !hasVal(form.title) && 'Add a headline',
    !hasVal(form.location) && 'Add your location',
    !hasVal(form.company) && 'Add current / last company',
    !hasVal(form.bio) && 'Add a 2–4 line summary',
    !hasVal(form.phone) && 'Add phone number',
    !hasVal(form.desiredLocation) && 'Add desired location',
    !skillsList.length && 'Add at least 5 skills',
    !String(form.languages ?? '').split(',').map((s) => s.trim()).filter(Boolean).length && 'Add languages',
    !desiredRolesList.length && 'Add open-to roles',
    !hasVal(form.pronouns) && 'Add pronouns',
    !hasVal(form.gender) && 'Add gender',
    !hasVal(form.ethnicity) && 'Add race / ethnicity',
    form.experienceYears === '' && 'Add total experience (years)',
    !hasVal(form.experienceLevel) && 'Select experience level',
    form.workExperiences.length === 0 && 'Add work experience',
    form.jobTypes.length === 0 && 'Pick job types',
    form.workModes.length === 0 && 'Pick work modes',
    form.expectedSalaryMin === '' && 'Add expected min salary',
    form.expectedSalaryMax === '' && 'Add expected max salary',
    !hasVal(form.availability) && 'Set availability / notice period',
    !hasVal(form.resumeUrl) && 'Upload your résumé',
    !hasVal(form.portfolioUrl) && 'Add portfolio / website link',
    !hasVal(form.linkedinUrl) && 'Add LinkedIn link',
    !hasVal(form.githubUrl) && 'Add GitHub link',
    !hasVal(form.educationDegree) && 'Add education degree',
    !hasVal(form.educationInstitution) && 'Add education institution',
    form.graduationYear === '' && 'Add graduation year',
    !user?.avatarUrl && 'Add profile photo',
  ].filter(Boolean);

  const isComplete = completion === 100 && missing.length === 0;

  // (Section saves go through saveSection() above — one Save button per card.)

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={() => avatarInput.current?.click()}
            disabled={avatarBusy}
            title="Upload profile picture"
            className="relative h-16 w-16 overflow-hidden rounded-full bg-accent/20 text-2xl font-bold text-accent hover:ring-2 hover:ring-accent disabled:opacity-60"
          >
            {user?.avatarUrl ? (
              <img src={fileUrl(user.avatarUrl)} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center">
                {(user?.name || '?').charAt(0).toUpperCase()}
              </span>
            )}
          </button>
          {user?.avatarUrl ? (
            <button type="button" onClick={removeAvatar} disabled={avatarBusy} className="text-[11px] text-neutral-500 hover:text-red-400 disabled:opacity-60">
              Remove
            </button>
          ) : (
            <span className="text-[11px] text-neutral-600">Add photo</span>
          )}
          {secMsg.__avatar?.text && (
            <p className={`text-[11px] ${secMsg.__avatar.error ? 'text-red-400' : 'text-emerald-400'}`}>
              {secMsg.__avatar.error ? secMsg.__avatar.text : `✓ ${secMsg.__avatar.text}`}
            </p>
          )}
        </div>
        <input
          ref={avatarInput}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={(e) => pickAvatar(e.target.files?.[0])}
        />
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
        {/* Sections — each card has its own Edit + Save */}
        <div className="space-y-4 lg:col-span-2">
          {/* Basics */}
          <div className={card}>
            {head('basics', 'Basics', 'How you appear in search and applications.')}
            {editing.basics ? (
              <>
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
            {!isEmployer && (
              <div className="mt-3">
                <span className={label}>Open to the following roles (comma separated)</span>
                <input value={form.desiredRoles} onChange={set('desiredRoles')} placeholder="Backend Engineer, Platform Engineer" className={input} />
                {desiredRolesList.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {desiredRolesList.map((r) => (
                      <span key={r} className="rounded-full bg-accent/15 px-2 py-0.5 text-xs text-accent">{r}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className="mt-3">
              <span className={label}>{isEmployer ? 'About the company / hiring note' : 'Professional summary *'}</span>
              <textarea value={form.bio} onChange={set('bio')} rows={4} maxLength={1000}
                placeholder={isEmployer ? 'What are you building? What roles are you hiring for?' : '2–4 lines: what you do, years of experience, standout work, what you want next.'}
                className={`${input} resize-y`} />
              <p className="mt-1 text-right text-[11px] text-neutral-500">{form.bio.length}/1000</p>
                </div>
              </>
            ) : (
              <div className="mt-3">
                <Row k="Name" v={form.name} />
                <Row k={isEmployer ? 'Title' : 'Headline'} v={form.title} />
                <Row k="Location" v={form.location} />
                <Row k="Company" v={form.company} />
                {!isEmployer && <Row k="Phone" v={form.phone} />}
                {!isEmployer && <Row k="Wants" v={form.desiredLocation} />}
                {!isEmployer && (
                  <div className="py-1.5">
                    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                      Open to the following roles
                    </p>
                    {desiredRolesList.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {desiredRolesList.map((r) => (
                          <span key={r} className="rounded-full bg-accent/15 px-2 py-0.5 text-xs text-accent">{r}</span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-600">—</p>
                    )}
                  </div>
                )}
                {form.bio ? (
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-neutral-200">{form.bio}</p>
                ) : (
                  <p className="mt-2 text-sm text-neutral-600">No summary yet — click Edit to add one.</p>
                )}
              </div>
            )}
          </div>

          {!isEmployer && (
            <>
              {/* Identity */}
              <div className={card}>
                {head('identity', 'Identity', 'Optional — helps employers address you correctly. Never shown to recruiters.')}
                {editing.identity ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div><span className={label}>Pronouns</span>
                      <select value={form.pronouns} onChange={set('pronouns')} className={input}>
                        {PRONOUNS.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
                      </select>
                    </div>
                    <div><span className={label}>Gender</span>
                      <select value={form.gender} onChange={set('gender')} className={input}>
                        {GENDERS.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
                      </select>
                    </div>
                    <div><span className={label}>Race / ethnicity</span>
                      <select value={form.ethnicity} onChange={set('ethnicity')} className={input}>
                        {ETHNICITIES.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3">
                    <Row k="Pronouns" v={optLabel(PRONOUNS, form.pronouns)} />
                    <Row k="Gender" v={optLabel(GENDERS, form.gender)} />
                    <Row k="Race" v={optLabel(ETHNICITIES, form.ethnicity)} />
                  </div>
                )}
              </div>

              {/* Work experience */}
              <div className={card}>
                {head('experience', 'Work experience', 'Recruiters filter on these first.')}
                {editing.experience ? (
                  <>
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
                        <input type="checkbox" checked={w.current} onChange={() => toggleCurrent(i)} className="h-4 w-4 accent-[#6366F1]" />
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
                  </>
                ) : (
                  <div className="mt-3">
                    <Row k="Total exp" v={form.experienceYears !== '' ? `${form.experienceYears} yrs` : ''} />
                    <Row k="Level" v={optLabel(LEVELS, form.experienceLevel)} />
                    {form.workExperiences.length > 0 ? (
                      <div className="mt-2 space-y-2">
                        {form.workExperiences.map((w, i) => (
                          <div key={i} className="rounded-lg border border-white/10 bg-panel2 p-3">
                            <p className="text-sm font-semibold text-white">
                              {[w.title, w.company].filter(Boolean).join(' @ ') || `Role ${i + 1}`}
                            </p>
                            {(w.startDate || w.endDate || w.current) && (
                              <p className="text-xs text-neutral-500">
                                {w.startDate || '?'} – {w.current ? 'Present' : w.endDate || '?'}
                                {w.current && ' · Currently here'}
                              </p>
                            )}
                            {w.description && (
                              <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-neutral-400">{w.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-neutral-600">No work experience added yet — click Edit to add roles.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Skills */}
              <div className={card}>
                {head('skills', 'Skills', 'Recruiters search on these — add your strongest first.')}
                {editing.skills ? (
                  <>
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
                  </>
                ) : (
                  <div className="mt-3">
                    {skillsList.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {skillsList.map((s) => (
                          <span key={s} className="rounded-full bg-accent/15 px-2 py-0.5 text-xs text-accent">{s}</span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-600">No skills added yet — click Edit to add some.</p>
                    )}
                    <div className="mt-2">
                      <Row k="Languages" v={form.languages} />
                    </div>
                  </div>
                )}
              </div>

              {/* Job preferences */}
              <div className={card}>
                {head('prefs', 'Job preferences', 'Match yourself to the right roles.')}
                {editing.prefs ? (
                  <>
                    <label className="mt-4 flex cursor-pointer items-center gap-2 text-xs text-neutral-300">
                      <button type="button" onClick={() => setForm({ ...form, openToWork: !form.openToWork })}
                        className={`relative h-5 w-9 rounded-full transition ${form.openToWork ? 'bg-emerald-500' : 'bg-neutral-600'}`}>
                        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-[#f4f4f5] transition-all ${form.openToWork ? 'left-4' : 'left-0.5'}`} />
                      </button>
                      Open to work
                    </label>
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
                  </>
                ) : (
                  <div className="mt-3">
                    <Row k="Status" v={form.openToWork ? '● Open to work' : 'Not looking right now'} />
                    {(form.jobTypes.length > 0 || form.workModes.length > 0) && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {[...form.jobTypes, ...form.workModes].map((t) => (
                          <span key={t} className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-neutral-300">{t}</span>
                        ))}
                      </div>
                    )}
                    <Row k="Salary" v={(form.expectedSalaryMin !== '' || form.expectedSalaryMax !== '') ? `${form.expectedSalaryMin || '?'} – ${form.expectedSalaryMax || '?'}` : ''} />
                    <Row k="Notice" v={optLabel(AVAIL, form.availability)} />
                  </div>
                )}
              </div>

              {/* Links */}
              <div className={card}>
                {head('links', 'Links & résumé', 'Profiles with a résumé + one proof-of-work link get far more replies.')}
                {editing.links ? (
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
                    {secMsg.__resume?.text && (
                      <p className={`mt-1 text-xs ${secMsg.__resume.error ? 'text-red-400' : 'text-emerald-400'}`}>
                        {secMsg.__resume.error ? secMsg.__resume.text : `✓ ${secMsg.__resume.text}`}
                      </p>
                    )}
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
                ) : (
                  <div className="mt-3">
                    <Row
                      k="Résumé"
                      v={isUploadedResume ? (resumeName || 'Uploaded file') : form.resumeUrl}
                      link={form.resumeUrl ? fileUrl(form.resumeUrl) : ''}
                    />
                    <Row k="Portfolio" v={form.portfolioUrl} link={form.portfolioUrl} />
                    <Row k="LinkedIn" v={form.linkedinUrl} link={form.linkedinUrl} />
                    <Row k="GitHub" v={form.githubUrl} link={form.githubUrl} />
                  </div>
                )}
              </div>

              {/* Education */}
              <div className={card}>
                {head('education', 'Education', '')}
                {editing.education ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div><span className={label}>Degree</span><input value={form.educationDegree} onChange={set('educationDegree')} placeholder="B.Tech, CSE" className={input} /></div>
                    <div><span className={label}>Institution</span><input value={form.educationInstitution} onChange={set('educationInstitution')} placeholder="College / university" className={input} /></div>
                    <div><span className={label}>Graduation year</span><input type="number" min="1950" max="2100" value={form.graduationYear} onChange={set('graduationYear')} placeholder="2023" className={input} /></div>
                  </div>
                ) : (
                  <div className="mt-3">
                    <Row k="Degree" v={form.educationDegree} />
                    <Row k="School" v={form.educationInstitution} />
                    <Row k="Year" v={form.graduationYear} />
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Live preview */}
        <aside className="h-fit space-y-4 lg:sticky lg:top-20">
          <div className="rounded-xl border border-white/10 bg-panel p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Recruiter preview</p>
            <div className="mt-3 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-accent/20 text-lg font-bold text-accent">
                {user?.avatarUrl ? (
                  <img src={fileUrl(user.avatarUrl)} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  (form.name || '?').charAt(0).toUpperCase()
                )}
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
              {isComplete ? (
                <p className="font-bold text-emerald-400">✓ All set — your profile is complete and ready to get discovered.</p>
              ) : (
                <>
                  <p className="font-bold text-white">Missing for better matches:</p>
                  <ul className="mt-2 list-disc space-y-1 pl-4">
                    {missing.map((tip) => (
                      <li key={tip}>{tip}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
