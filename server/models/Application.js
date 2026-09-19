import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    coverNote: { type: String, trim: true, maxlength: 2000, default: '' },
    status: {
      type: String,
      enum: ['applied', 'reviewing', 'interview', 'offer', 'rejected'],
      default: 'applied',
    },
    // Employer-internal mark (never shown to the seeker): best / good /
    // maybe / not-good. Empty = not marked yet.
    mark: {
      type: String,
      enum: ['', 'best', 'good', 'maybe', 'not-good'],
      default: '',
    },
  },
  { timestamps: true }
);

applicationSchema.index({ job: 1, applicant: 1 }, { unique: true }); // one application per job

export default mongoose.model('Application', applicationSchema);
