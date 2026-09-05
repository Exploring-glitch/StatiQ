// Saved jobs stored locally per browser (Wellfound-style bookmark list)
const KEY = 'statiq_saved_jobs';

export const getSavedIds = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
};

export const isSaved = (id) => getSavedIds().includes(String(id));

export const toggleSaved = (id) => {
  const sid = String(id);
  const cur = getSavedIds();
  const next = cur.includes(sid) ? cur.filter((x) => x !== sid) : [...cur, sid];
  localStorage.setItem(KEY, JSON.stringify(next));
  return next.includes(sid);
};
