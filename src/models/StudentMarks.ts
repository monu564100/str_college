
import mongoose, { Schema, Document } from 'mongoose';
import { getStudentMarksStorageKey, normalizeUSN } from '@/utils/studentIdentification';

export interface IStudentMarks extends Document {
  usn: string;
  courseId: string;
  courseName: string;
  IA1: number;
  IA2: number;
  semester: number;
  semesterName: string;
  totalMarks: number;
  grade: string;
  assignments?: number;
}

const StudentMarksSchema = new Schema<IStudentMarks>({
  usn: { 
    type: String, 
    required: true,
    index: true
  },
  courseId: { type: String, required: true },
  courseName: { type: String, required: true },
  IA1: { type: Number, default: 0 },
  IA2: { type: Number, default: 0 },
  semester: { type: Number, default: 0 },
  semesterName: { type: String, required: true },
  totalMarks: { type: Number, default: 0 },
  grade: { type: String, default: 'N/A' },
  assignments: { type: Number, default: 0 }
});

// Calculate total marks before saving
StudentMarksSchema.pre('save', function(next) {
  const assignmentMarks = this.assignments || 0;
  this.totalMarks = this.IA1 + this.IA2 + this.semester + assignmentMarks;
  
  // Calculate grade based on total marks
  if (this.totalMarks >= 140) this.grade = 'A+';
  else if (this.totalMarks >= 120) this.grade = 'A';
  else if (this.totalMarks >= 100) this.grade = 'B+';
  else if (this.totalMarks >= 80) this.grade = 'B';
  else if (this.totalMarks >= 60) this.grade = 'C';
  else if (this.totalMarks >= 40) this.grade = 'D';
  else this.grade = 'F';
  
  next();
});

// For browser use, we'll use localStorage instead of MongoDB
export const saveStudentMark = (mark: Partial<IStudentMarks>) => {
  if (!mark.usn || !mark.courseId) {
    throw new Error('Student USN and Course ID are required');
  }
  
  const normalizedUSN = normalizeUSN(mark.usn);
  const storageKey = getStudentMarksStorageKey(normalizedUSN);
  const existingMarksJson = localStorage.getItem(storageKey);
  const existingMarks = existingMarksJson ? JSON.parse(existingMarksJson) : [];
  
  // Calculate total and assign grade
  if (mark.IA1 !== undefined && mark.IA2 !== undefined && mark.semester !== undefined) {
    const assignmentMarks = mark.assignments || 0;
    mark.totalMarks = mark.IA1 + mark.IA2 + mark.semester + assignmentMarks;
    
    // Calculate grade
    if (mark.totalMarks >= 140) mark.grade = 'A+';
    else if (mark.totalMarks >= 120) mark.grade = 'A';
    else if (mark.totalMarks >= 100) mark.grade = 'B+';
    else if (mark.totalMarks >= 80) mark.grade = 'B';
    else if (mark.totalMarks >= 60) mark.grade = 'C';
    else if (mark.totalMarks >= 40) mark.grade = 'D';
    else mark.grade = 'F';
  }
  
  // Find if this course already exists in the same semester
  const courseIndex = existingMarks.findIndex((m: any) => 
    m.courseId === mark.courseId && m.semesterName === mark.semesterName);
  
  if (courseIndex >= 0) {
    // Update existing mark
    existingMarks[courseIndex] = { ...existingMarks[courseIndex], ...mark };
  } else {
    // Add new mark
    existingMarks.push({
      id: Math.random().toString(),
      ...mark
    });
  }
  
  // Save to localStorage
  localStorage.setItem(storageKey, JSON.stringify(existingMarks));
  
  return courseIndex >= 0 ? existingMarks[courseIndex] : existingMarks[existingMarks.length - 1];
};

// Create a safe model export that works in both server and client environments
let StudentMarks: mongoose.Model<IStudentMarks>;

// Check if we're in a browser environment (window exists)
if (typeof window !== 'undefined') {
  // For client-side, create a dummy model
  StudentMarks = {} as mongoose.Model<IStudentMarks>;
} else {
  // For server-side, create or get the actual model
  StudentMarks = (mongoose.models.StudentMarks || 
    mongoose.model<IStudentMarks>('StudentMarks', StudentMarksSchema)) as mongoose.Model<IStudentMarks>;
}

export default StudentMarks;
