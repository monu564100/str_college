import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'student' | 'teacher' | 'admin';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department: string;
  joinDate: Date;
  verificationStatus: VerificationStatus;
  usn?: string; // USN field for students
  phoneNumber?: string; // Added phone number
  address?: string; // Added address
  profileImage?: string; // Added profile image
  bio?: string; // Added bio
  lastLogin?: Date; // Added last login date
  isActive?: boolean; // Added active status
  accountLocked?: boolean; // Added account locked status
  semester?: number; // Added semester for students
  batch?: string; // Added batch for students
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['student', 'teacher', 'admin'], 
    required: true 
  },
  department: { type: String, required: true },
  joinDate: { type: Date, default: Date.now },
  verificationStatus: { 
    type: String, 
    enum: ['pending', 'verified', 'rejected'], 
    default: 'pending' 
  },
  usn: { type: String, sparse: true },
  phoneNumber: { type: String, sparse: true },
  address: { type: String, sparse: true },
  profileImage: { type: String, sparse: true },
  bio: { type: String, sparse: true },
  lastLogin: { type: Date, sparse: true },
  isActive: { type: Boolean, default: true },
  accountLocked: { type: Boolean, default: false },
  semester: { type: Number, sparse: true },
  batch: { type: String, sparse: true }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Check if the model already exists to prevent compilation errors
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
