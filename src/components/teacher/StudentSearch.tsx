import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Search } from "lucide-react";
import { getStudentMarks } from '@/utils/api';
import { Badge } from "@/components/ui/badge";

interface Student {
  id: string;
  usn: string;
  name: string;
  email: string;
}

interface StudentMark {
  courseName: string;
  IA1: number;
  IA2: number;
  semester: number;
  totalMarks: number;
  grade: string;
  semester_name?: string;
}

const getGradeBadgeVariant = (grade: string) => {
  switch (grade) {
    case 'A+': return "success";
    case 'A': return "success";
    case 'B+': return "secondary";
    case 'B': return "secondary";
    case 'C': return "warning";
    case 'D': return "warning";
    case 'F': return "destructive";
    default: return "default";
  }
};

const StudentSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<{ student: Student; marks: StudentMark[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load students from localStorage
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      const users = JSON.parse(storedUsers);
      const studentUsers = users.filter((user: any) => user.role === 'student');
      setStudents(studentUsers);
    }
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query) {
      const results = students.filter(student =>
        student.name.toLowerCase().includes(query.toLowerCase()) ||
        student.usn.toLowerCase().includes(query.toLowerCase()) ||
        student.email.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectStudent = async (student: Student) => {
    setIsLoading(true);
    try {
      const marks = await getStudentMarks(student.usn || student.id);
      setSelectedStudent({ student, marks });
    } catch (error) {
      console.error("Error fetching student marks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <Label htmlFor="search">Search Student</Label>
        <div className="relative">
          <Input
            type="search"
            id="search"
            placeholder="Enter student name, USN, or email"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      {searchResults.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Search Results</h3>
          {searchResults.map(student => (
            <Card key={student.id} className="cursor-pointer hover:bg-secondary/50 transition" onClick={() => handleSelectStudent(student)}>
              <CardContent className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={`https://avatar.api.dicebear.com/7.x/lorelei/svg?seed=${student.id}`} />
                  <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-sm font-medium">{student.name}</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    USN: {student.usn || 'N/A'}
                  </CardDescription>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedStudent?.marks && (
        <div className="space-y-4 mt-4">
          <h3 className="text-lg font-semibold">Academic Records</h3>
          {selectedStudent.marks.map((mark, idx) => (
            <Card key={idx} className="overflow-hidden">
              <CardHeader className="bg-muted/50 pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base">{mark.courseName}</CardTitle>
                  <Badge variant={getGradeBadgeVariant(mark.grade)}>{mark.grade}</Badge>
                </div>
                <CardDescription>
                  Semester: {mark.semester_name || 'N/A'}
                </CardDescription>
              </CardHeader>
              <CardContent className="py-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm font-medium">IA 1</p>
                    <p className="text-sm text-muted-foreground">{mark.IA1}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">IA 2</p>
                    <p className="text-sm text-muted-foreground">{mark.IA2}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Semester Marks</p>
                    <p className="text-sm text-muted-foreground">{mark.semester}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Total Marks</p>
                    <p className="text-sm text-muted-foreground">{mark.totalMarks}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isLoading && (
        <div className="text-center mt-4">
          Loading student data...
        </div>
      )}

      {selectedStudent && selectedStudent.marks.length === 0 && !isLoading && (
        <div className="text-center mt-4 text-muted-foreground">
          No academic records found for this student.
        </div>
      )}
    </div>
  );
};

export default StudentSearch;
