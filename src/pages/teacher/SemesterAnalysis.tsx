
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getStudentsByCourse, getStudentMarks } from '@/utils/api';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Loader2 } from 'lucide-react';
import { normalizeUSN } from '@/utils/studentIdentification';

const SemesterAnalysis = () => {
  const [semesters, setSemesters] = useState<string[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [students, setStudents] = useState<any[]>([]);
  const [studentData, setStudentData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [courseData, setCourseData] = useState<any[]>([]);
  const [currentProgress, setCurrentProgress] = useState(0);
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        // Get all students from a course (we'll refine this later)
        const studentsData = await getStudentsByCourse('all');
        setStudents(studentsData);
        
        // Extract unique semesters from all students
        const fetchedSemesters = new Set<string>();
        const allStudentData: any[] = [];
        
        // Fetch marks for each student
        for (const student of studentsData) {
          const marks = await getStudentMarks(student.usn || student.id);
          
          // Store student data
          allStudentData.push({
            ...student,
            marks
          });
          
          // Extract semesters
          marks.forEach((mark: any) => {
            if (mark.semester_name) {
              fetchedSemesters.add(mark.semester_name);
            }
          });
        }
        
        // Convert Set to Array and sort
        const semesterArray = Array.from(fetchedSemesters).sort();
        setSemesters(semesterArray);
        
        // Set default selected semester to the most recent one
        if (semesterArray.length > 0) {
          setSelectedSemester(semesterArray[semesterArray.length - 1]);
        }
        
        setStudentData(allStudentData);
        // Calculate progress for current semester (latest)
        calculateCurrentProgress(allStudentData, semesterArray[semesterArray.length - 1]);
        
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStudents();
  }, []);
  
  useEffect(() => {
    if (selectedSemester && studentData.length > 0) {
      // Process data for the selected semester
      processDataForSemester(selectedSemester);
      // Calculate progress for selected semester
      calculateCurrentProgress(studentData, selectedSemester);
    }
  }, [selectedSemester, studentData]);
  
  const calculateCurrentProgress = (data: any[], semester: string) => {
    // Calculate average completion percentage for the semester
    let totalCompletion = 0;
    let count = 0;
    
    data.forEach(student => {
      const semesterMarks = student.marks.filter((mark: any) => 
        mark.semester_name === semester
      );
      
      semesterMarks.forEach((mark: any) => {
        // Calculate percentage of max possible marks (assume max is 200 for simplicity)
        const percentage = (mark.totalMarks / 200) * 100;
        totalCompletion += percentage;
        count++;
      });
    });
    
    const averageCompletion = count > 0 ? totalCompletion / count : 0;
    setCurrentProgress(Math.round(averageCompletion));
  };
  
  const processDataForSemester = (semester: string) => {
    // Collect all course data for the selected semester
    const courses: Record<string, any> = {};
    
    studentData.forEach(student => {
      const semesterMarks = student.marks.filter((mark: any) => 
        mark.semester_name === semester
      );
      
      semesterMarks.forEach((mark: any) => {
        if (!courses[mark.courseName]) {
          courses[mark.courseName] = {
            name: mark.courseName,
            totalMarks: 0,
            count: 0,
            grades: { 'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 }
          };
        }
        
        courses[mark.courseName].totalMarks += mark.totalMarks;
        courses[mark.courseName].count++;
        
        // Count grades
        if (mark.grade) {
          courses[mark.courseName].grades[mark.grade]++;
        }
      });
    });
    
    // Calculate averages and prepare data for charts
    const processedData = Object.values(courses).map((course: any) => ({
      ...course,
      averageMarks: course.count > 0 ? Math.round(course.totalMarks / course.count) : 0
    }));
    
    setCourseData(processedData);
  };
  
  // Prepare grade distribution data for charts
  const prepareGradeDistribution = () => {
    const gradeData: Record<string, number> = { 'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 };
    
    courseData.forEach(course => {
      Object.entries(course.grades).forEach(([grade, count]: [string, any]) => {
        gradeData[grade] += count;
      });
    });
    
    return Object.entries(gradeData).map(([grade, count]) => ({
      name: grade,
      value: count
    }));
  };
  
  if (isLoading) {
    return (
      <DashboardLayout userRole="teacher" pageTitle="Semester Analysis">
        <div className="flex justify-center items-center h-full min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2">Loading semester data...</span>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout userRole="teacher" pageTitle="Semester Analysis">
      <div className="space-y-6">
        {/* Semester selector */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Semester Performance Analysis</h2>
          <div className="w-48">
            <Select value={selectedSemester} onValueChange={setSelectedSemester}>
              <SelectTrigger>
                <SelectValue placeholder="Select semester" />
              </SelectTrigger>
              <SelectContent>
                {semesters.map((sem) => (
                  <SelectItem key={sem} value={sem}>
                    {`Semester ${sem}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Current semester progress */}
        <Card>
          <CardHeader>
            <CardTitle>Current Semester Progress</CardTitle>
            <CardDescription>
              Overall completion for Semester {selectedSemester}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm font-medium">{currentProgress}%</span>
              </div>
              <Progress value={currentProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="performance">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="performance">Course Performance</TabsTrigger>
            <TabsTrigger value="grades">Grade Distribution</TabsTrigger>
            <TabsTrigger value="students">Student Performance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="performance" className="pt-4">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Average Course Performance</CardTitle>
                <CardDescription>
                  Average marks across all courses for Semester {selectedSemester}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {courseData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={courseData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="averageMarks" fill="#8884d8" name="Average Marks" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center text-muted-foreground">
                    No data available for the selected semester
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="grades" className="pt-4">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Grade Distribution</CardTitle>
                  <CardDescription>
                    Distribution of grades across all courses for Semester {selectedSemester}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {courseData.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={prepareGradeDistribution()}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {prepareGradeDistribution().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      No grade data available
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Course-wise Grade Distribution</CardTitle>
                  <CardDescription>
                    Grade breakdown by course for Semester {selectedSemester}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {courseData.length > 0 ? (
                    <div className="space-y-4 max-h-64 overflow-y-auto">
                      {courseData.map((course, index) => (
                        <div key={index} className="space-y-2">
                          <h4 className="font-medium text-sm">{course.name}</h4>
                          <div className="grid grid-cols-7 gap-1 text-xs">
                            {Object.entries(course.grades).map(([grade, count]: [string, any]) => (
                              <div 
                                key={grade} 
                                className={`p-1 rounded text-center ${
                                  count > 0 ? 'bg-primary/20' : 'bg-muted'
                                }`}
                              >
                                {grade}: {count}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      No grade data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="students" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Student Analysis</CardTitle>
                <CardDescription>
                  Performance metrics for students in Semester {selectedSemester}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {studentData.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {studentData.map((student, index) => {
                        const semesterMarks = student.marks.filter((mark: any) => 
                          mark.semester_name === selectedSemester
                        );
                        
                        if (semesterMarks.length === 0) return null;
                        
                        // Calculate average marks for this student in this semester
                        const totalMarks = semesterMarks.reduce((sum: number, mark: any) => 
                          sum + mark.totalMarks, 0
                        );
                        const avgMarks = semesterMarks.length > 0 
                          ? Math.round(totalMarks / semesterMarks.length) 
                          : 0;
                        
                        return (
                          <Card key={index} className="overflow-hidden">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base">{student.name}</CardTitle>
                              <CardDescription>USN: {student.usn || 'N/A'}</CardDescription>
                            </CardHeader>
                            <CardContent className="pb-2">
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Average marks:</span>
                                  <span className="font-medium">{avgMarks}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Courses:</span>
                                  <span className="font-medium">{semesterMarks.length}</span>
                                </div>
                                <Progress 
                                  value={(avgMarks / 200) * 100} 
                                  className="h-1.5 mt-2" 
                                />
                              </div>
                            </CardContent>
                          </Card>
                        );
                      }).filter(Boolean)}
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    No student data available for this semester
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SemesterAnalysis;
