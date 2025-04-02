
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';

export interface StudentMark {
  subject: string;
  ia1: number;
  ia2: number;
  semester: number;
  grade: string;
  totalMarks: number;
  assignments?: number; // For assignment total
  semester_name?: string; // For displaying which semester this is for
}

interface StudentMarksProps {
  studentId?: string;
  studentName?: string;
  marks: StudentMark[];
  isTeacherView?: boolean;
}

const StudentMarks: React.FC<StudentMarksProps> = ({ 
  studentId, 
  studentName, 
  marks,
  isTeacherView = false
}) => {
  // Group by semester if semester_name exists
  const marksBySemester = marks.reduce((acc: Record<string, StudentMark[]>, mark) => {
    const semesterKey = mark.semester_name || 'Current Semester';
    
    if (!acc[semesterKey]) {
      acc[semesterKey] = [];
    }
    
    acc[semesterKey].push(mark);
    return acc;
  }, {});
  
  const semesters = Object.keys(marksBySemester);
  
  return (
    <div className="space-y-6">
      {semesters.length > 1 ? (
        semesters.map(semester => (
          <Card key={semester}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">
                {isTeacherView && studentName 
                  ? `${studentName}'s Marks - ${semester}` 
                  : `Academic Performance - ${semester}`}
              </CardTitle>
              <Badge variant="outline">{semester}</Badge>
            </CardHeader>
            <CardContent>
              <MarkTable marks={marksBySemester[semester]} />
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              {isTeacherView && studentName ? `${studentName}'s Marks` : 'Academic Performance'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MarkTable marks={marks} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Separated the table component for better organization
const MarkTable = ({ marks }: { marks: StudentMark[] }) => {
  const hasAssignments = marks.some(m => m.assignments !== undefined);
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Subject</TableHead>
          <TableHead className="text-center">IA1 (30)</TableHead>
          <TableHead className="text-center">IA2 (30)</TableHead>
          {hasAssignments && (
            <TableHead className="text-center">Assignments (40)</TableHead>
          )}
          <TableHead className="text-center">Semester Exam (100)</TableHead>
          <TableHead className="text-center">Total</TableHead>
          <TableHead className="text-center">Grade</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {marks.length === 0 ? (
          <TableRow>
            <TableCell colSpan={hasAssignments ? 7 : 6} className="text-center py-10 text-muted-foreground">
              No marks data available.
            </TableCell>
          </TableRow>
        ) : (
          marks.map((mark, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{mark.subject}</TableCell>
              <TableCell className="text-center">{mark.ia1}</TableCell>
              <TableCell className="text-center">{mark.ia2}</TableCell>
              {hasAssignments && (
                <TableCell className="text-center">{mark.assignments ?? '-'}</TableCell>
              )}
              <TableCell className="text-center">{mark.semester}</TableCell>
              <TableCell className="text-center">{mark.totalMarks}</TableCell>
              <TableCell className={`text-center font-medium ${
                mark.grade === 'A+' || mark.grade === 'A' ? 'text-green-600' : 
                mark.grade === 'B+' || mark.grade === 'B' ? 'text-blue-600' : 
                mark.grade === 'C' ? 'text-yellow-600' : 
                mark.grade === 'D' ? 'text-orange-600' : 'text-red-600'
              }`}>
                {mark.grade}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default StudentMarks;
