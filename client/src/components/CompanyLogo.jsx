import { fileUrl } from '../lib/api';
import { initials } from '../lib/companies';

// Uploaded company logo with letter fallback. Pass logoUrl ("/uploads/…"
// or https://) plus the company name for alt/initials.
export default function CompanyLogo({ logoUrl, name = '?', className = 'h-10 w-10 rounded-md', imgClassName = '' }) {
  const src = logoUrl ? fileUrl(logoUrl) : '';
  if (src) {
    return (
      <img
        src={src}
        alt={`${name} logo`}
        className={`${className} shrink-0 border border-white/10 object-cover ${imgClassName}`}
        loading="lazy"
      />
    );
  }
  return (
    <span className={`${className} flex shrink-0 items-center justify-center bg-accent/15 font-bold text-accent`}>
      {initials(name)}
    </span>
  );
}
