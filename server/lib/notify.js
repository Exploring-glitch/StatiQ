import Notification from '../models/Notification.js';
import JobAlert from '../models/JobAlert.js';
import { buildAlertFilter } from '../controllers/alertController.js';

const safeCreate = async (doc) => {
  try {
    await Notification.create(doc);
  } catch {
    // Notifications are best-effort; never fail the main action.
  }
};

export const notifyNewApplicant = async ({ employerId, job, applicantName }) => {
  if (!employerId) return;
  await safeCreate({
    user: employerId,
    type: 'new_applicant',
    title: `New applicant for ${job?.title || 'your role'}`,
    body: `${applicantName || 'A candidate'} applied${job?.company ? ` at ${job.company}` : ''}.`,
    link: job?._id ? `/jobs/${job._id}/applicants` : '/dashboard',
    data: { jobId: job?._id || null },
  });
};

export const notifyStatusChanged = async ({ applicantId, job, status, applicationId }) => {
  if (!applicantId) return;
  await safeCreate({
    user: applicantId,
    type: 'status_changed',
    title: `Application ${status}: ${job?.title || 'your role'}`,
    body: `${job?.company ? `${job.company} ` : ''}moved you to ${status}.`,
    link: '/my-applications',
    data: { jobId: job?._id || null, applicationId: applicationId || null },
  });
};

export const fanoutNewJobMatches = async (job) => {
  try {
    const alerts = await JobAlert.find({ isActive: true, frequency: 'instant' }).limit(500);
    const docs = [];
    for (const a of alerts) {
      const filter = buildAlertFilter(a.query || {});
      const matches =
        filter === null
          ? true
          : await (await import('../models/Job.js')).default.exists({ _id: job._id, ...filter }).catch(() => null);
      // exists() with $text/$or spread can miss text index context; fall back to
      // lightweight field checks so obvious matches still notify.
      const fallback =
        !matches &&
        (!a.query?.q || `${job.title} ${job.company}`.toLowerCase().includes(String(a.query.q).toLowerCase())) &&
        (!a.query?.location || String(job.location || '').toLowerCase().includes(String(a.query.location).toLowerCase()));
      if (matches || fallback) {
        docs.push({
          user: a.user,
          type: 'new_match',
          title: `New match: ${job.title}`,
          body: `${job.company} · ${job.location}`,
          link: `/jobs/${job._id}`,
          data: { jobId: job._id },
        });
      }
    }
    if (docs.length) {
      await Notification.insertMany(docs, { ordered: false }).catch(() => {});
      await JobAlert.updateMany(
        { _id: { $in: alerts.filter((a) => docs.some((d) => String(d.user) === String(a.user))).map((a) => a._id) } },
        { $set: { lastSentAt: new Date() } }
      ).catch(() => {});
    }
  } catch {
    // Best-effort fan-out.
  }
};
