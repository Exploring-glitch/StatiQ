import { Link } from 'react-router-dom';
import { fileUrl } from '../lib/api';
import { companyLink, initials } from '../lib/companies';

export default function CompanyCard({ company }) {
  const name = company?.name || company?.company || 'Company';
  const logo = company?.logoUrl ? fileUrl(company.logoUrl) : '';
  const to = companyLink(company);
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-xl border border-white/10 bg-panel p-4 transition hover:border-accent/50"
    >
      {logo ? (
        <img src={logo} alt={`${name} logo`} className="h-11 w-11 shrink-0 rounded-lg border border-white/10 object-cover" />
      ) : (
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-lg font-extrabold text-accent">
          {initials(name)}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-white group-hover:text-accent">{name}</span>
        <span className="block truncate text-xs text-neutral-400">
          {(company?.bio || company?.tagline || company?.industry || 'View profile').slice(0, 90)}
        </span>
        <span className="mt-0.5 block text-[11px] text-neutral-500">
          {company?.employeeCount != null ? `${company.employeeCount} employees` : company?.companySize ? `${company.companySize} people` : ''}
          {company?.jobsCount != null ? ` · ${company.jobsCount} open role${company.jobsCount === 1 ? '' : 's'}` : ''}
        </span>
      </span>
      <span className="shrink-0 text-accent transition-transform group-hover:translate-x-1">→</span>
    </Link>
  );
}
