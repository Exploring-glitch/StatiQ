import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const workExperienceSchema = new mongoose.Schema(
  {
    company: { type: String, trim: true, default: '', maxlength: 120 },
    title: { type: String, trim: true, default: '', maxlength: 120 },
    startDate: { type: String, trim: true, default: '' }, // YYYY-MM
    endDate: { type: String, trim: true, default: '' }, // YYYY-MM, empty when current
    current: { type: Boolean, default: false },
    description: { type: String, trim: true, default: '', maxlength: 2000 },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 80 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email'],
    },
    password: { type: String, required: [true, 'Password is required'], minlength: 8, select: false },
    role: { type: String, enum: ['jobseeker', 'employer', 'admin'], default: 'jobseeker' },
    avatarUrl: { type: String, trim: true, default: '' }, // /uploads/avatar-…
    title: { type: String, trim: true, default: '' }, // e.g. "Senior Backend Engineer"
    location: { type: String, trim: true, default: '' },
    skills: { type: [String], default: [] },
    company: { type: String, trim: true, default: '' }, // employer org name

    // ── Job-seeker profile (needed to get discovered + hired) ──
    bio: { type: String, trim: true, default: '', maxlength: 1000 },
    phone: { type: String, trim: true, default: '' },
    resumeUrl: { type: String, trim: true, default: '' },
    resumeName: { type: String, trim: true, default: '' }, // original filename of uploaded résumé
    portfolioUrl: { type: String, trim: true, default: '' },
    linkedinUrl: { type: String, trim: true, default: '' },
    githubUrl: { type: String, trim: true, default: '' },

    experienceYears: { type: Number, min: 0, max: 50, default: null },
    experienceLevel: {
      type: String,
      enum: ['', 'fresher', 'entry', 'mid', 'senior', 'lead', 'executive'],
      default: '',
    },
    workExperiences: { type: [workExperienceSchema], default: [] },
    openToWork: { type: Boolean, default: true },

    // ── Identity (voluntary, seeker-only; never shown to recruiters) ──
    pronouns: {
      type: String,
      enum: ['', 'she-her', 'he-him', 'they-them', 'she-they', 'he-they', 'xe-xem', 'prefer-not-to-say'],
      default: '',
    },
    gender: {
      type: String,
      enum: ['', 'woman', 'man', 'non-binary', 'transgender', 'genderfluid', 'agender', 'prefer-not-to-say'],
      default: '',
    },
    ethnicity: {
      type: String,
      enum: ['', 'asian', 'black', 'hispanic', 'middle-eastern', 'native', 'pacific-islander', 'white', 'mixed', 'prefer-not-to-say'],
      default: '',
    },

    desiredRoles: { type: [String], default: [] }, // e.g. ["Backend Engineer", "DevOps"]
    jobTypes: { type: [String], default: [] }, // Full-time, Part-time, Contract, Internship
    workModes: { type: [String], default: [] }, // Remote, Hybrid, On-site
    desiredLocation: { type: String, trim: true, default: '' },
    languages: { type: [String], default: [] },

    expectedSalaryMin: { type: Number, min: 0, default: null },
    expectedSalaryMax: { type: Number, min: 0, default: null },
    availability: {
      type: String,
      enum: ['', 'immediate', '2-weeks', '1-month', '2-months', 'open'],
      default: '',
    },

    educationDegree: { type: String, trim: true, default: '' },
    educationInstitution: { type: String, trim: true, default: '' },
    graduationYear: { type: Number, min: 1950, max: 2100, default: null },

    // Bookmarked jobs — stored as string ids so demo/mock ids work too.
    savedJobs: { type: [String], default: [] },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeJSON = function () {
  const {
    _id, name, email, role, title, location, skills, company, createdAt,
    avatarUrl, bio, phone, resumeUrl, resumeName, portfolioUrl, linkedinUrl, githubUrl,
    experienceYears, experienceLevel, workExperiences, openToWork,
    pronouns, gender, ethnicity,
    desiredRoles, jobTypes, workModes, desiredLocation, languages,
    expectedSalaryMin, expectedSalaryMax, availability,
    educationDegree, educationInstitution, graduationYear,
    savedJobs,
  } = this;
  return {
    id: _id, name, email, role, title, location, skills, company, createdAt,
    avatarUrl, bio, phone, resumeUrl, resumeName, portfolioUrl, linkedinUrl, githubUrl,
    experienceYears, experienceLevel, workExperiences, openToWork,
    pronouns, gender, ethnicity,
    desiredRoles, jobTypes, workModes, desiredLocation, languages,
    expectedSalaryMin, expectedSalaryMax, availability,
    educationDegree, educationInstitution, graduationYear,
    savedJobs: Array.isArray(savedJobs) ? savedJobs : [],
  };
};

export default mongoose.model('User', userSchema);
