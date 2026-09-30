// Shared ownership check: poster, admin, or manager of the job's company.
// Keeps updateJob/deleteJob/jobApplicants/setStatus consistent.
export const canManageJob = async (user, job) => {
  if (!user || !job) return false;
  if (user.role === 'admin') return true;
  const postedById = job.postedBy?._id?.toString?.() || job.postedBy?.toString?.();
  if (postedById && postedById === user._id.toString()) return true;
  if (job.companyId) {
    const { default: Company } = await import('../models/Company.js');
    const mine = await Company.exists({ _id: job.companyId, owner: user._id });
    if (mine) return true;
  }
  return false;
};
