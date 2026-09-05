import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 120 },
    company: { type: String, required: [true, 'Company is required'], trim: true, maxlength: 120 },
    location: { type: String, required: [true, 'Location is required'], trim: true },
    salary: { type: String, trim: true, default: '' },
    type: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Internship'], default: 'Full-time' },
    remote: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
    description: { type: String, default: '' },
    responsibilities: { type: [String], default: [] },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

jobSchema.index({ title: 'text', company: 'text', location: 'text', tags: 'text' });

export default mongoose.model('Job', jobSchema);
