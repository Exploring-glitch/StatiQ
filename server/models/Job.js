import mongoose from 'mongoose';

// Parse human salary strings into annual numbers for filtering/sorting.
// Supports "$180K – $240K", "$150,000", "₹8L – ₹12L" (L = lakh), "2M", etc.
export function parseSalaryRange(str) {
  if (!str || typeof str !== 'string') return { min: null, max: null };
  const MULT = { K: 1e3, M: 1e6, L: 1e5 };
  const nums = [];
  const re = /([\d,.]+)\s*([KkMmLl])?/g;
  let m;
  while ((m = re.exec(str)) !== null) {
    const n = parseFloat(m[1].replace(/,/g, ''));
    if (Number.isNaN(n)) continue;
    // Skip tiny numbers that are clearly not salaries (e.g. "8 open roles")
    const mult = m[2] ? MULT[m[2].toUpperCase()] : 1;
    const val = n * mult;
    if (val < 1000) continue;
    nums.push(val);
  }
  if (nums.length === 0) return { min: null, max: null };
  nums.sort((a, b) => a - b);
  return { min: nums[0], max: nums[nums.length - 1] };
}

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 120 },
    company: { type: String, required: [true, 'Company is required'], trim: true, maxlength: 120 },
    location: { type: String, required: [true, 'Location is required'], trim: true },
    salary: { type: String, trim: true, default: '' },
    salaryMin: { type: Number, min: 0, default: null },
    salaryMax: { type: Number, min: 0, default: null },
    type: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Internship'], default: 'Full-time' },
    remote: { type: Boolean, default: false },
    workMode: { type: String, enum: ['', 'Remote', 'Hybrid', 'On-site'], default: '' },
    experienceLevel: {
      type: String,
      enum: ['', 'fresher', 'entry', 'mid', 'senior', 'lead', 'executive'],
      default: '',
    },
    tags: { type: [String], default: [] },
    description: { type: String, default: '' },
    responsibilities: { type: [String], default: [] },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Backfill filterable fields from legacy free-text fields on save.
jobSchema.pre('save', function (next) {
  if (this.salary && (this.salaryMin == null || this.salaryMax == null)) {
    const { min, max } = parseSalaryRange(this.salary);
    if (this.salaryMin == null) this.salaryMin = min;
    if (this.salaryMax == null) this.salaryMax = max;
  }
  if (!this.workMode) {
    this.workMode = this.remote ? 'Remote' : 'On-site';
  } else if (this.workMode === 'Remote') {
    this.remote = true;
  }
  next();
});

jobSchema.index({ title: 'text', company: 'text', location: 'text', tags: 'text' });
jobSchema.index({ salaryMax: 1, createdAt: -1 });

export default mongoose.model('Job', jobSchema);
