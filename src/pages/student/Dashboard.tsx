
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AcademicPerformance from '@/components/student/AcademicPerformance';
import StudentMarks from '@/components/student/StudentMarks';
import ProjectManager from '@/components/student/ProjectManager';
import { getStudentMarks, StudentMarkData } from '@/utils/api';
import { Book, BarChart2, FileText } from 'lucide-react';
import { getStudentMarksStorageKey, normalizeUSN } from '@/utils/studentIdentification';

const StudentDashboard = () => {
  const [studentMarks, setStudentMarks] = useState<StudentMarkData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    // Get user info from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      
      // Get student marks using USN if available, otherwise use ID
      const loadMarks = async () => {
        try {
          // Use USN preferentially, fall back to ID if not available
          const identifier = parsedUser.usn ? normalizeUSN(parsedUser.usn) : parsedUser.id;
          const marks = await getStudentMarks(identifier);
          setStudentMarks(marks);
        } catch (error) {
          console.error('Error loading marks:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      loadMarks();
    }
  }, []);
  
  return (
    <DashboardLayout userRole="student" pageTitle="Student Dashboard">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Courses</CardTitle>
              <CardDescription>Currently enrolled courses</CardDescription>
            </div>
            <Book className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentMarks.length}</div>
            <p className="text-muted-foreground">Active courses this semester</p>
            <Button variant="outline" className="w-full mt-4" size="sm">
              View All Courses
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Performance</CardTitle>
              <CardDescription>Overall academic standing</CardDescription>
            </div>
            <BarChart2 className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? 
                "Loading..." : 
                studentMarks.length > 0 ? 
                  (studentMarks.reduce((sum, mark) => sum + parseFloat(mark.grade === 'A+' ? '10' : 
                    mark.grade === 'A' ? '9' : 
                    mark.grade === 'B+' ? '8' : 
                    mark.grade === 'B' ? '7' : 
                    mark.grade === 'C' ? '6' : 
                    mark.grade === 'D' ? '5' : '0'
                  ), 0) / studentMarks.length).toFixed(2) : 
                  "N/A"}
            </div>
            <p className="text-muted-foreground">CGPA this semester</p>
            <Button variant="outline" className="w-full mt-4" size="sm">
              View Performance
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Projects</CardTitle>
              <CardDescription>Your project submissions</CardDescription>
            </div>
            <FileText className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-muted-foreground">Active projects</p>
            <Button variant="outline" className="w-full mt-4" size="sm">
              View All Projects
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="marks">
        <TabsList>
          <TabsTrigger value="marks">Academic Performance</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>
        
        <TabsContent value="marks" className="space-y-6 pt-4">
          <StudentMarks 
            studentName={user?.name || "Student"}
            marks={studentMarks.map(mark => ({
              subject: mark.courseName,
              ia1: mark.IA1,
              ia2: mark.IA2,
              semester: mark.semester,
              assignments: mark.assignments,
              totalMarks: mark.totalMarks,
              grade: mark.grade,
              semester_name: mark.semester_name
            }))} 
          />
          <AcademicPerformance />
        </TabsContent>
        
        <TabsContent value="projects" className="pt-4">
          <ProjectManager />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default StudentDashboard;
