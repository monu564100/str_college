import React, { useState, useRef, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FileSpreadsheet, Download, Upload, Eye, Loader2, Filter } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import StudentMarks, { StudentMark } from "@/components/student/StudentMarks";
import { parseMarksExcel, processAndSaveMarks, ParsedStudentMark } from '@/utils/excelParser';
import { getCourses, CourseData, getStudentsByCourse, StudentData } from '@/utils/api';
import { getStudentMarksStorageKey, normalizeUSN } from '@/utils/studentIdentification';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Interface for student with marks
interface Student {
  id: string;
  usn: string;
  name: string;
  email: string;
  department: string;
  semester?: number;
  cgpa?: number;
  marks: StudentMark[];
}

// Semesters data for selection
const AVAILABLE_SEMESTERS = [
  { value: '1', label: '1st Semester' },
  { value: '2', label: '2nd Semester' },
  { value: '3', label: '3rd Semester' },
  { value: '4', label: '4th Semester' },
  { value: '5', label: '5th Semester' },
  { value: '6', label: '6th Semester' },
  { value: '7', label: '7th Semester' },
  { value: '8', label: '8th Semester' },
];

const StudentsMarksManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isMarksDialogOpen, setIsMarksDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [filterBySemester, setFilterBySemester] = useState<string>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedMarks, setParsedMarks] = useState<ParsedStudentMark[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadTemplateData, setDownloadTemplateData] = useState<{
    semester: string;
    course: string;
  }>({ semester: '1', course: '' });
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const fetchedCourses = await getCourses();
        setCourses(fetchedCourses);
        
        const fetchedStudents = await getStudentsByCourse('all');
        
        const studentsWithMarks: Student[] = fetchedStudents.map(student => ({
          id: student.id,
          usn: student.usn,
          name: student.name,
          email: student.email,
          department: 'Computer Science',
          semester: 0,
          cgpa: 0,
          marks: []
        }));
        
        for (const student of studentsWithMarks) {
          try {
            const storageKey = getStudentMarksStorageKey(normalizeUSN(student.usn));
            const marksJson = localStorage.getItem(storageKey);
            if (marksJson) {
              const marksData = JSON.parse(marksJson);
              if (Array.isArray(marksData)) {
                const formattedMarks: StudentMark[] = marksData.map(mark => ({
                  subject: mark.courseName,
                  ia1: mark.IA1,
                  ia2: mark.IA2,
                  semester: mark.semester,
                  assignments: mark.assignments,
                  totalMarks: mark.totalMarks,
                  grade: mark.grade,
                  semester_name: mark.semesterName
                }));
                
                student.marks = formattedMarks;
                
                const cgpa = formattedMarks.reduce((sum, mark) => {
                  const gradePoints = 
                    mark.grade === 'A+' ? 10 :
                    mark.grade === 'A' ? 9 :
                    mark.grade === 'B+' ? 8 :
                    mark.grade === 'B' ? 7 :
                    mark.grade === 'C' ? 6 :
                    mark.grade === 'D' ? 5 : 0;
                  return sum + gradePoints;
                }, 0) / formattedMarks.length;
                
                student.cgpa = parseFloat(cgpa.toFixed(2));
                
                const semesters = formattedMarks
                  .map(mark => {
                    if (mark.semester_name) {
                      const semNum = parseInt(mark.semester_name);
                      return isNaN(semNum) ? 0 : semNum;
                    }
                    return 0;
                  })
                  .filter(sem => sem > 0);
                
                if (semesters.length > 0) {
                  const semesterCounts: Record<number, number> = {};
                  let maxSemester = 0;
                  let maxCount = 0;
                  
                  semesters.forEach(sem => {
                    semesterCounts[sem] = (semesterCounts[sem] || 0) + 1;
                    if (semesterCounts[sem] > maxCount) {
                      maxCount = semesterCounts[sem];
                      maxSemester = sem;
                    }
                  });
                  
                  student.semester = maxSemester;
                }
              }
            }
          } catch (error) {
            console.error(`Error loading marks for student ${student.usn}:`, error);
          }
        }
        
        setStudents(studentsWithMarks);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load student data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         student.usn.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterBySemester === 'all') {
      return matchesSearch;
    }
    
    const semesterMatches = student.marks.some(mark => 
      mark.semester_name === filterBySemester
    );
    
    return matchesSearch && semesterMatches;
  });
  
  const handleViewMarks = (student: Student) => {
    setSelectedStudent(student);
    setIsMarksDialogOpen(true);
  };
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setIsUploading(true);
      
      try {
        const marks = await parseMarksExcel(file);
        
        if (selectedSemester) {
          marks.forEach(mark => {
            mark.semester = selectedSemester;
          });
        }
        
        setParsedMarks(marks);
        setPreviewMode(true);
        toast.success(`File "${file.name}" processed successfully. ${marks.length} student records found.`);
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to process the file');
      } finally {
        setIsUploading(false);
      }
    }
  };
  
  const handleConfirmUpload = async () => {
    if (parsedMarks.length === 0) {
      toast.error('No marks data available to upload');
      return;
    }
    
    setIsUploading(true);
    try {
      await processAndSaveMarks(parsedMarks);
      
      setParsedMarks([]);
      setPreviewMode(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      const fetchedStudents = await getStudentsByCourse('all');
      setStudents(prevStudents => {
        return prevStudents.map(student => {
          const storageKey = getStudentMarksStorageKey(normalizeUSN(student.usn));
          const marksJson = localStorage.getItem(storageKey);
          if (marksJson) {
            try {
              const marksData = JSON.parse(marksJson);
              if (Array.isArray(marksData)) {
                const formattedMarks: StudentMark[] = marksData.map(mark => ({
                  subject: mark.courseName,
                  ia1: mark.IA1,
                  ia2: mark.IA2,
                  semester: mark.semester,
                  assignments: mark.assignments,
                  totalMarks: mark.totalMarks,
                  grade: mark.grade,
                  semester_name: mark.semesterName
                }));
                
                student.marks = formattedMarks;
                
                const cgpa = formattedMarks.reduce((sum, mark) => {
                  const gradePoints = 
                    mark.grade === 'A+' ? 10 :
                    mark.grade === 'A' ? 9 :
                    mark.grade === 'B+' ? 8 :
                    mark.grade === 'B' ? 7 :
                    mark.grade === 'C' ? 6 :
                    mark.grade === 'D' ? 5 : 0;
                  return sum + gradePoints;
                }, 0) / formattedMarks.length;
                
                student.cgpa = parseFloat(cgpa.toFixed(2));
              }
            } catch (error) {
              console.error(`Error updating marks for student ${student.usn}:`, error);
            }
          }
          return student;
        });
      });
      
      toast.success('Student marks saved successfully!');
    } catch (error) {
      console.error('Error uploading marks:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload marks');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const semesterDisplay = AVAILABLE_SEMESTERS.find(
      sem => sem.value === downloadTemplateData.semester
    )?.label || '';
    
    const courseDisplay = courses.find(
      course => course.id === downloadTemplateData.course
    )?.name || '';
    
    const message = `Template downloaded for ${semesterDisplay}${courseDisplay ? ` - ${courseDisplay}` : ''}`;
    toast.success(message);
  };

  const generateExcelTemplate = () => {
    if (!downloadTemplateData.semester) {
      toast.error('Please select a semester first');
      return;
    }
    
    handleDownloadTemplate();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Student Marks Management</CardTitle>
          <CardDescription>View and manage student marks by semester</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students by name or USN..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    {filterBySemester !== 'all' ? `Semester ${filterBySemester}` : "All Semesters"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-60" align="end">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Select Semester</p>
                    <Select value={filterBySemester} onValueChange={setFilterBySemester}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Semesters" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Semesters</SelectItem>
                        {AVAILABLE_SEMESTERS.map(sem => (
                          <SelectItem key={sem.value} value={sem.value}>{sem.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </PopoverContent>
              </Popover>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Template
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Download Marks Sheet Template</h4>
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Select semester for the template:</p>
                      <Select 
                        value={downloadTemplateData.semester} 
                        onValueChange={(value) => setDownloadTemplateData(prev => ({...prev, semester: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select semester" />
                        </SelectTrigger>
                        <SelectContent>
                          {AVAILABLE_SEMESTERS.map(sem => (
                            <SelectItem key={sem.value} value={sem.value}>{sem.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Select course (optional):</p>
                      <Select 
                        value={downloadTemplateData.course} 
                        onValueChange={(value) => setDownloadTemplateData(prev => ({...prev, course: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select course" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any_course">Any Course</SelectItem>
                          {courses.map(course => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.name} ({course.semester})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={generateExcelTemplate}
                      disabled={!downloadTemplateData.semester}
                    >
                      Download Template
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              
              <Button
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.click();
                  }
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Marks
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".xlsx,.xls,.csv"
                className="hidden"
              />
            </div>
            
            {previewMode ? (
              <div className="space-y-4 border p-4 rounded-md">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Preview Marks Data</h3>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      onClick={() => {
                        setParsedMarks([]);
                        setPreviewMode(false);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleConfirmUpload} 
                      disabled={isUploading || parsedMarks.length === 0}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : 'Confirm Upload'}
                    </Button>
                  </div>
                </div>
                
                {parsedMarks.length > 0 && (
                  <>
                    <div className="bg-muted p-2 rounded flex gap-4 text-sm">
                      <div><strong>Semester:</strong> {parsedMarks[0].semester}</div>
                      <div><strong>Subject:</strong> {parsedMarks[0].subject}</div>
                      <div><strong>Students:</strong> {parsedMarks.length}</div>
                    </div>
                    
                    <div className="border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>USN</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead className="text-right">IA-1</TableHead>
                            <TableHead className="text-right">IA-2</TableHead>
                            <TableHead className="text-right">Assignment 1</TableHead>
                            <TableHead className="text-right">Assignment 2</TableHead>
                            <TableHead className="text-right">Final</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {parsedMarks.slice(0, 5).map((mark, i) => (
                            <TableRow key={i}>
                              <TableCell className="font-medium">{mark.usn}</TableCell>
                              <TableCell>{mark.name}</TableCell>
                              <TableCell className="text-right">{mark.ia1}</TableCell>
                              <TableCell className="text-right">{mark.ia2}</TableCell>
                              <TableCell className="text-right">{mark.assignment1}</TableCell>
                              <TableCell className="text-right">{mark.assignment2}</TableCell>
                              <TableCell className="text-right">{mark.finalMark}</TableCell>
                            </TableRow>
                          ))}
                          {parsedMarks.length > 5 && (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center text-muted-foreground">
                                + {parsedMarks.length - 5} more students
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="p-4 border border-dashed rounded-md">
                <div className="text-center">
                  <FileSpreadsheet className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Upload Grade Sheet</h3>
                  <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                    Upload Excel sheets with student marks. The system will automatically process and update student records.
                  </p>
                  <div className="mt-4 space-y-4">
                    <div className="flex flex-col gap-2 max-w-xs mx-auto">
                      <label htmlFor="semester-select" className="text-sm font-medium">
                        Select Semester
                      </label>
                      <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                        <SelectTrigger id="semester-select">
                          <SelectValue placeholder="Select semester" />
                        </SelectTrigger>
                        <SelectContent>
                          {AVAILABLE_SEMESTERS.map(sem => (
                            <SelectItem key={sem.value} value={sem.value}>{sem.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <label htmlFor="course-select" className="text-sm font-medium mt-2">
                        Select Course (Optional)
                      </label>
                      <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                        <SelectTrigger id="course-select">
                          <SelectValue placeholder="Select course" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map(course => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.name} ({course.semester})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept=".xlsx,.xls,.csv"
                        className="hidden"
                      />
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          if (fileInputRef.current) {
                            fileInputRef.current.click();
                          }
                        }} 
                        className="cursor-pointer"
                      >
                        Select File
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">
                      Supported formats: .xlsx, .xls, .csv
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>USN</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>CGPA</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      <p className="mt-2 text-sm text-muted-foreground">Loading student data...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      No students found matching your search criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.usn}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.department}</TableCell>
                      <TableCell>{student.semester || 'N/A'}</TableCell>
                      <TableCell>{student.cgpa || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewMarks(student)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Marks
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={isMarksDialogOpen} onOpenChange={setIsMarksDialogOpen}>
        <DialogContent className="max-w-4xl">
          {selectedStudent && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedStudent.name}'s Academic Record</DialogTitle>
                <DialogDescription>
                  USN: {selectedStudent.usn} | Department: {selectedStudent.department} {selectedStudent.semester ? `| Semester: ${selectedStudent.semester}` : ''}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                {selectedStudent.marks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No marks data available for this student.
                  </div>
                ) : (
                  <StudentMarks 
                    studentName={selectedStudent.name} 
                    marks={selectedStudent.marks}
                    isTeacherView={true}
                  />
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentsMarksManagement;
