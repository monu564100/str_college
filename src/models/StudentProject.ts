
import mongoose, { Schema, Document } from 'mongoose';
import { getStudentProjectStorageKey, normalizeUSN } from '@/utils/studentIdentification';

export type ProjectType = 'mooc' | 'mini-project';
export type ProjectVerificationStatus = 'pending' | 'verified' | 'rejected';

export interface IStudentProject extends Document {
  usn: string;
  studentName: string;
  projectType: ProjectType;
  title: string;
  description: string;
  semester: number;
  submissionDate: Date;
  verificationStatus: ProjectVerificationStatus;
  verifiedBy?: string;
  verificationDate?: Date;
  certificateUrl?: string;
  projectUrl?: string;
  grade?: string;
  feedback?: string;
}

const StudentProjectSchema = new Schema<IStudentProject>({
  usn: { 
    type: String, 
    required: true,
    index: true
  },
  studentName: { type: String, required: true },
  projectType: { 
    type: String, 
    enum: ['mooc', 'mini-project'],
    required: true 
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  semester: { type: Number, required: true },
  submissionDate: { type: Date, default: Date.now },
  verificationStatus: { 
    type: String, 
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verifiedBy: { type: String },
  verificationDate: { type: Date },
  certificateUrl: { type: String },
  projectUrl: { type: String },
  grade: { type: String },
  feedback: { type: String }
});

// For browser use, we'll use localStorage instead of MongoDB
export const saveStudentProject = (project: Partial<IStudentProject>) => {
  if (!project.usn) {
    throw new Error('Student USN is required');
  }
  
  const normalizedUSN = normalizeUSN(project.usn);
  const storageKey = getStudentProjectStorageKey(normalizedUSN);
  const existingProjectsJson = localStorage.getItem(storageKey);
  const existingProjects = existingProjectsJson ? JSON.parse(existingProjectsJson) : [];
  
  // Generate ID if it's a new project
  if (!project.id) {
    project.id = Math.random().toString(36).substring(2, 15);
  }
  
  // Update existing project or add new one
  const projectIndex = existingProjects.findIndex((p: any) => p.id === project.id);
  
  if (projectIndex >= 0) {
    // Update existing project
    existingProjects[projectIndex] = { ...existingProjects[projectIndex], ...project };
  } else {
    // Add new project
    existingProjects.push(project);
  }
  
  // Save to localStorage
  localStorage.setItem(storageKey, JSON.stringify(existingProjects));
  
  return projectIndex >= 0 ? existingProjects[projectIndex] : existingProjects[existingProjects.length - 1];
};

// Create a safe model export that works in both server and client environments
let StudentProject: mongoose.Model<IStudentProject>;

// Check if we're in a browser environment (window exists)
if (typeof window !== 'undefined') {
  // For client-side, create a dummy model
  StudentProject = {} as mongoose.Model<IStudentProject>;
} else {
  // For server-side, create or get the actual model
  StudentProject = (mongoose.models.StudentProject || 
    mongoose.model<IStudentProject>('StudentProject', StudentProjectSchema)) as mongoose.Model<IStudentProject>;
}

export default StudentProject;
