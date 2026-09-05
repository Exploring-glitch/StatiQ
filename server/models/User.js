import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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
    title: { type: String, trim: true, default: '' }, // e.g. "Senior Backend Engineer"
    location: { type: String, trim: true, default: '' },
    skills: { type: [String], default: [] },
    company: { type: String, trim: true, default: '' }, // employer org name
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
  const { _id, name, email, role, title, location, skills, company, createdAt } = this;
  return { id: _id, name, email, role, title, location, skills, company, createdAt };
};

export default mongoose.model('User', userSchema);
