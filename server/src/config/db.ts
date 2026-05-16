import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  const MONGO_URI = process.env.MONGO_URI;

  if (!MONGO_URI) {
    console.error('[DB] MONGO_URI is not defined in environment variables.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Fail fast if MongoDB is unreachable
    });

    console.log(`[DB] MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error(`[DB] Connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[DB] MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('[DB] MongoDB reconnected.');
    });

  } catch (error: any) {
    console.error(`[DB] Connection failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
