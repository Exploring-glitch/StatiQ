import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['new_applicant', 'status_changed', 'new_match', 'system'],
      required: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 140 },
    body: { type: String, trim: true, maxlength: 1000, default: '' },
    link: { type: String, trim: true, maxlength: 300, default: '' },
    data: {
      jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', default: null },
      applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', default: null },
    },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
