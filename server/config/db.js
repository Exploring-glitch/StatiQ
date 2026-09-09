import mongoose from 'mongoose';

export default async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes('<username>')) {
    console.warn('MONGODB_URI not set — running without database (health + mock jobs only).');
    return null;
  }
  mongoose.set('strictQuery', true);
  // Fail fast (5s) instead of hanging ~30s when the cluster is unreachable,
  // so the API boots into degraded mode quickly. Tune up for slow networks.
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  console.log("Connected to MongoDB");
  return mongoose.connection;
}
