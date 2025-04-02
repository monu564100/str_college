
import mongoose from 'mongoose';

export const connectToDatabase = async () => {
  try {
    // In a real environment, you'd use process.env.MONGODB_URI
    // For demo purposes, we're using a MongoDB Atlas free tier connection
    // Replace with your actual MongoDB connection string in production
    const MONGODB_URI = 'mongodb+srv://demo:demo123@cluster0.mongodb.net/academic-portal?retryWrites=true&w=majority';
    
    if (mongoose.connection.readyState >= 1) {
      return;
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    throw new Error('Database connection failed');
  }
};
