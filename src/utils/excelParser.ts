
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { normalizeUSN, isValidUSN } from '@/utils/studentIdentification';
import { saveStudentMark } from '@/models/StudentMarks';

export interface ParsedStudentMark {
  usn: string;
  name: string;
  ia1: number;
  ia2: number;
  internalTotal: number;
  assignment1: number;
  assignment2: number;
  assignmentTotal: number;
  finalMark?: number;
  subject?: string;
  semester?: string;
}

export const parseMarksExcel = (file: File): Promise<ParsedStudentMark[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        // Get the first worksheet
        const wsname = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[wsname];
        
        // Convert to JSON, starting from row 3 (skipping the header rows)
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { 
          header: ["sNo", "usn", "name", "ia1", "ia2", "internalTotal", "assignment1", "assignment2", "assignmentTotal", "finalMark"],
          range: 2
        });
        
        // Extract the semester and subject from the first row
        const semesterCell = worksheet['A1'];
        const subjectCell = worksheet['B1'];
        
        const semester = semesterCell?.v?.toString() || '';
        const subject = subjectCell?.v?.toString() || '';
        
        // Validate that we have the required semester information
        if (!semester) {
          throw new Error('Semester information missing in the Excel file. Please ensure cell A1 contains semester information.');
        }
        
        // Filter and transform the data
        const studentMarks: ParsedStudentMark[] = jsonData
          .filter(row => row.usn && row.name) // Filter out any empty rows
          .map(row => {
            // Normalize and validate USN
            const usn = normalizeUSN(row.usn.toString());
            
            if (!isValidUSN(usn)) {
              console.warn(`Skipping invalid USN format: ${usn}`);
              return null;
            }
            
            return {
              usn,
              name: row.name,
              ia1: Number(row.ia1) || 0,
              ia2: Number(row.ia2) || 0,
              internalTotal: Number(row.internalTotal) || 0,
              assignment1: Number(row.assignment1) || 0,
              assignment2: Number(row.assignment2) || 0,
              assignmentTotal: Number(row.assignmentTotal) || 0,
              finalMark: Number(row.finalMark) || 0,
              subject,
              semester
            };
          })
          .filter(mark => mark !== null) as ParsedStudentMark[];
          
        resolve(studentMarks);
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        reject(new Error(error instanceof Error ? error.message : 'Failed to parse the Excel file. Please check the format.'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read the file.'));
    };
    
    reader.readAsBinaryString(file);
  });
};

export const processAndSaveMarks = async (marks: ParsedStudentMark[]): Promise<void> => {
  try {
    // Group marks by student USN
    const studentMarksMap = new Map<string, ParsedStudentMark[]>();
    
    marks.forEach(mark => {
      if (!studentMarksMap.has(mark.usn)) {
        studentMarksMap.set(mark.usn, []);
      }
      studentMarksMap.get(mark.usn)?.push(mark);
    });
    
    // For each student, save their marks
    studentMarksMap.forEach((studentMarks, usn) => {
      // Process each subject's marks
      studentMarks.forEach(mark => {
        // Calculate total marks (modify as per your grading system)
        const totalMarks = mark.internalTotal + mark.assignmentTotal + mark.finalMark;
        
        // Determine grade based on total marks (simplified version)
        let grade = 'F';
        if (totalMarks >= 90) grade = 'A+';
        else if (totalMarks >= 80) grade = 'A';
        else if (totalMarks >= 70) grade = 'B+';
        else if (totalMarks >= 60) grade = 'B';
        else if (totalMarks >= 50) grade = 'C';
        else if (totalMarks >= 40) grade = 'D';
        
        // Save to localStorage using the USN
        const courseId = `${mark.subject}-${mark.semester}`.replace(/\s+/g, '-').toLowerCase();
        
        // Save the mark with the semester included
        saveStudentMark({
          usn: usn,
          courseId: courseId, 
          courseName: mark.subject || 'Unknown Subject',
          IA1: mark.ia1,
          IA2: mark.ia2,
          semester: mark.finalMark || 0,
          semesterName: mark.semester || '',
          assignments: mark.assignmentTotal,
          totalMarks,
          grade
        });
      });
    });
    
    toast.success(`Successfully processed marks for ${studentMarksMap.size} students`);
  } catch (error) {
    console.error('Error saving marks:', error);
    throw new Error('Failed to save student marks.');
  }
};
