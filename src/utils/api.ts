import { toast } from 'sonner';
import { ParsedStudentMark } from './excelParser';
import { getStudentMarksStorageKey, normalizeUSN } from '@/utils/studentIdentification';

// Define proper types for student marks
export interface StudentMarkData {
  courseName: string;
  IA1: number;
  IA2: number;
  semester: number;
  totalMarks: number;
  grade: string;
  assignments?: number;
  semester_name?: string;
}

// Mock API for student marks
const mockMarks: StudentMarkData[] = [
  {
    courseName: "Database Systems",
    IA1: 25,
    IA2: 27,
    semester: 85,
    totalMarks: 137,
    grade: "A",
    semester_name: "3"
  },
  {
    courseName: "Web Technologies",
    IA1: 22,
    IA2: 24,
    semester: 78,
    totalMarks: 124,
    grade: "B",
    semester_name: "3"
  },
  {
    courseName: "Operating Systems",
    IA1: 28,
    IA2: 26,
    semester: 88,
    totalMarks: 142,
    grade: "A",
    semester_name: "3"
  }
];

// Get student marks from localStorage - always prioritize real data
export const getStudentMarks = async (usnOrId: string): Promise<StudentMarkData[]> => {
  try {
    // Try using the parameter as USN first
    let storageKey = getStudentMarksStorageKey(normalizeUSN(usnOrId));
    let storedMarksJson = localStorage.getItem(storageKey);
    
    // If not found, try using it as an ID (backwards compatibility)
    if (!storedMarksJson) {
      storageKey = `student_marks_${usnOrId}`;
      storedMarksJson = localStorage.getItem(storageKey);
    }
    
    if (storedMarksJson) {
      const storedMarks = JSON.parse(storedMarksJson);
      if (Array.isArray(storedMarks) && storedMarks.length > 0) {
        return storedMarks as StudentMarkData[];
      }
    }
    
    // If no stored marks, return empty array instead of mock data
    return [];
  } catch (error) {
    console.error('Error getting student marks:', error);
    return []; // Return empty array as fallback
  }
};

// Define interface for student data
export interface StudentData {
  id: string;
  usn: string;
  name: string;
  email: string;
}

// Get students for a particular course/subject - prioritize real data
export const getStudentsByCourse = async (courseId: string): Promise<StudentData[]> => {
  // Get real students from localStorage
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const students = users.filter((user: any) => user.role === 'student');
  
  if (students.length > 0) {
    return students.map((student: any) => ({
      id: student.id,
      usn: student.usn || student.id, // Use USN if available, otherwise use ID
      name: student.name,
      email: student.email
    }));
  }
  
  // Return empty array instead of mock data
  return [];
};

// Upload student marks from excel file
export const uploadStudentMarks = async (marks: ParsedStudentMark[]) => {
  try {
    // In a real application, this would be an API call to the server
    // For now, we'll just simulate a successful upload
    return new Promise(resolve => {
      setTimeout(() => {
        localStorage.setItem('uploaded_marks', JSON.stringify(marks));
        
        // Save marks for each student based on their USN
        marks.forEach(mark => {
          const usn = normalizeUSN(mark.usn);
          const storageKey = getStudentMarksStorageKey(usn);
          
          // Get existing marks for this student
          const existingMarksJson = localStorage.getItem(storageKey);
          const existingMarks = existingMarksJson ? JSON.parse(existingMarksJson) : [];
          
          // Calculate total marks and grade
          const totalMarks = mark.internalTotal + mark.assignmentTotal + mark.finalMark;
          let grade = 'F';
          if (totalMarks >= 90) grade = 'A+';
          else if (totalMarks >= 80) grade = 'A';
          else if (totalMarks >= 70) grade = 'B+';
          else if (totalMarks >= 60) grade = 'B';
          else if (totalMarks >= 50) grade = 'C';
          else if (totalMarks >= 40) grade = 'D';
          
          // Create new mark object
          const newMark = {
            id: Math.random().toString(),
            usn: usn,
            courseName: mark.subject || 'Unknown Subject',
            courseId: `${mark.subject}-${mark.semester}`.replace(/\s+/g, '-').toLowerCase(),
            IA1: mark.ia1,
            IA2: mark.ia2,
            semester: mark.finalMark,
            assignments: mark.assignmentTotal,
            totalMarks,
            grade,
            semesterName: mark.semester
          };
          
          // Check if this course already exists in this semester
          const courseIndex = existingMarks.findIndex((m: any) => 
            m.courseName === newMark.courseName && m.semesterName === newMark.semesterName
          );
          
          if (courseIndex >= 0) {
            // Update existing course mark
            existingMarks[courseIndex] = { ...existingMarks[courseIndex], ...newMark };
          } else {
            // Add new course mark
            existingMarks.push(newMark);
          }
          
          // Save updated marks
          localStorage.setItem(storageKey, JSON.stringify(existingMarks));
        });
        
        resolve({ success: true, message: 'Marks uploaded successfully' });
      }, 1500);
    });
  } catch (error) {
    console.error('Error uploading student marks:', error);
    throw new Error('Failed to upload student marks');
  }
};

// Define interface for course data
export interface CourseData {
  id: string;
  name: string;
  semester: string;
}

// Get all courses
export const getCourses = async (): Promise<CourseData[]> => {
  // Simulated API call
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([
        { id: 'DDCO', name: 'Digital Design and Computer Organization', semester: '3rd sem' },
        { id: 'DSA', name: 'Data Structures and Algorithms', semester: '3rd sem' },
        { id: 'DBMS', name: 'Database Management Systems', semester: '4th sem' },
        { id: 'OS', name: 'Operating Systems', semester: '4th sem' },
        { id: 'CN', name: 'Computer Networks', semester: '5th sem' },
        { id: 'ML', name: 'Machine Learning', semester: '6th sem' },
        { id: 'DAA', name: 'Design and Analysis of Algorithms', semester: '5th sem' }
      ]);
    }, 1000);
  });
};
