import mongoose from 'mongoose';
import logger from './logger.js';

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rbac_pro';
  mongoose.set('strictQuery', true);

  await mongoose.connect(uri);
  logger.info(`MongoDB connected: ${mongoose.connection.host}`);
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

export default connectDB;
