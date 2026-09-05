import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema(
  {
    company: String,
    role: String,
    location: String,
    salary: String,
  },
  { timestamps: true }
);

export default mongoose.model('Job', JobSchema);
