// Attach the owning company's logoUrl to job payloads so every listing,
// preview, and detail page renders the uploaded logo instead of a letter.
// Lookup order per job: companyId → companySlug → exact company name.
export const attachCompanyLogos = async (jobs) => {
  const list = Array.isArray(jobs) ? jobs : jobs ? [jobs] : [];
  if (!list.length) return Array.isArray(jobs) ? [] : jobs;
  const { default: Company } = await import('../models/Company.js');
  const ids = [...new Set(list.map((j) => String(j?.companyId || '')).filter(Boolean))];
  const slugs = [...new Set(list.map((j) => String(j?.companySlug || '').toLowerCase()).filter(Boolean))];
  const names = [...new Set(list.map((j) => String(j?.company || '').trim()).filter(Boolean))].slice(0, 100);
  const ors = [];
  if (ids.length) ors.push({ _id: { $in: ids } });
  if (slugs.length) ors.push({ slug: { $in: slugs } });
  if (names.length) ors.push({ name: { $in: names } });
  if (!ors.length) {
    return list.map((j) => ({ ...(typeof j?.toObject === 'function' ? j.toObject() : j) }));
  }
  const companies = await Company.find({ $or: ors }).select('_id slug name logoUrl').lean();
  const byId = new Map(companies.map((c) => [String(c._id), c]));
  const bySlug = new Map(companies.map((c) => [String(c.slug || '').toLowerCase(), c]));
  const byName = new Map(companies.map((c) => [String(c.name || '').trim().toLowerCase(), c]));
  const out = list.map((j) => {
    const base = typeof j?.toObject === 'function' ? j.toObject() : { ...j };
    const hit =
      (base.companyId && byId.get(String(base.companyId))) ||
      (base.companySlug && bySlug.get(String(base.companySlug).toLowerCase())) ||
      (base.company && byName.get(String(base.company).trim().toLowerCase()));
    if (hit?.logoUrl) base.logoUrl = hit.logoUrl;
    return base;
  });
  return Array.isArray(jobs) ? out : out[0];
};
