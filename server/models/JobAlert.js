import mongoose from 'mongoose';

const alertQuerySchema = new mongoose.Schema(
  {
    q: { type: String, trim: true, maxlength: 120, default: '' },
    location: { type: String, trim: true, maxlength: 120, default: '' },
    type: { type: String, trim: true, maxlength: 120, default: '' },
    workMode: { type: String, trim: true, maxlength: 120, default: '' },
    experienceLevel: { type: String, trim: true, maxlength: 40, default: '' },
    minSalary: { type: String, trim: true, maxlength: 20, default: '' },
    sort: { type: String, enum: ['', 'newest', 'salary'], default: '' },
  },
  { _id: false }
);

const jobAlertSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: [true, 'Alert name is required'], trim: true, maxlength: 80 },
    query: { type: alertQuerySchema, default: {} },
    frequency: { type: String, enum: ['instant', 'daily'], default: 'instant' },
    isActive: { type: Boolean, default: true },
    lastSentAt: { type: Date, default: null },
  },
  { timestamps: true }
);

jobAlertSchema.index({ user: 1, isActive: 1, createdAt: -1 });

export default mongoose.model('JobAlert', jobAlertSchema);
