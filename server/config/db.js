import mongoose from 'mongoose';

export default async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes('<username>')) {
    console.warn('MONGODB_URI not set — running without database (health + mock jobs only).');
    return null;
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");
  return mongoose.connection;
}
