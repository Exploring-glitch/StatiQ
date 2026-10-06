// Shared location helpers — employer My Profile stores Country / State /
// City separately, composed into `location` as "City, State, Country".
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
