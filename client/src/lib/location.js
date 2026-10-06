// Employer My Profile stores Country / State / City separately.
// `location` is the composed "City, State, Country" string kept for
// search + backwards compatibility with older accounts.
export const formatLocation = ({ city = '', state = '', country = '', location = '' } = {}) => {
  const parts = [city, state, country].map((s) => String(s ?? '').trim()).filter(Boolean);
  if (parts.length) return parts.join(', ');
  return String(location ?? '').trim();
};

// Best-effort split of a legacy "City, State, Country" string so older
// accounts hydrate the new fields without data loss.
export const splitLocation = (location = '') => {
  const parts = String(location ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (!parts.length) return { city: '', state: '', country: '' };
  if (parts.length === 1) return { city: parts[0], state: '', country: '' };
  if (parts.length === 2) return { city: parts[0], state: '', country: parts[1] };
  const country = parts.pop();
  const state = parts.pop();
  const city = parts.join(', ');
  return { city, state, country };
};

// Resolve split fields with legacy fallback: explicit fields win,
// otherwise parse the composed `location` string.
export const resolveLocationParts = (u = {}) => {
  const country = String(u?.country ?? '').trim();
  const state = String(u?.state ?? '').trim();
  const city = String(u?.city ?? '').trim();
  if (country || state || city) return { city, state, country };
  return splitLocation(u?.location);
};

// Display string for headers / previews — prefers split fields.
export const displayLocation = (u = {}) =>
  formatLocation({
    city: u?.city ?? resolveLocationParts(u).city,
    state: u?.state ?? resolveLocationParts(u).state,
    country: u?.country ?? resolveLocationParts(u).country,
    location: u?.location ?? '',
  });
