// Saved jobs: localStorage for guests (instant, offline-safe), synced to the
// backend whenever logged in so bookmarks follow the user across devices.
import { api } from './api';

const KEY = 'statiq_saved_jobs';
const TOKEN_KEY = 'statiq_token';

const hasToken = () => !!localStorage.getItem(TOKEN_KEY);

export const getSavedIds = () => {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
};

const setLocalIds = (ids) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch { /* storage blocked → keep in-memory behaviour */ }
};

export const isSaved = (id) => getSavedIds().includes(String(id));

// Push the full local list to the server (fire-and-forget safe).
const pushToServer = (ids) => {
  if (!hasToken()) return;
  api.saveJobs(ids).catch(() => { /* offline/API down → local copy still wins */ });
};

export const toggleSaved = (id) => {
  const sid = String(id);
  const cur = getSavedIds();
  const next = cur.includes(sid) ? cur.filter((x) => x !== sid) : [...cur, sid];
  setLocalIds(next);
  pushToServer(next);
  return next.includes(sid);
};

// Union of local + server lists, persisted in both places.
// Call after login/register/refresh and before rendering SavedJobs.
export const mergeSavedOnAuth = async () => {
  if (!hasToken()) return getSavedIds();
  let serverIds = [];
  try {
    const data = await api.getSavedJobs();
    serverIds = Array.isArray(data.savedJobIds) ? data.savedJobIds.map(String) : [];
  } catch {
    return getSavedIds(); // API unreachable → stick with local
  }
  const union = [...new Set([...getSavedIds(), ...serverIds])];
  setLocalIds(union);
  try {
    const data = await api.saveJobs(union);
    const confirmed = Array.isArray(data.savedJobIds) ? data.savedJobIds.map(String) : union;
    setLocalIds(confirmed);
    return confirmed;
  } catch {
    return union;
  }
};
