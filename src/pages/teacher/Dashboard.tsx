import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StudentsMarksManagement from '@/components/teacher/StudentsMarksManagement';
import StudentVerification from '@/components/teacher/StudentVerification';
import StudentSearch from '@/components/teacher/StudentSearch';
import StudentProjectVerification from '@/components/teacher/StudentProjectVerification';
import { 
  Users, 
  GraduationCap, 
  FileSpreadsheet, 
  Calendar, 
  BookOpen,
  ArrowUpRight,
  UserCheck,
  Search,
  ClipboardCheck,
  BarChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getUserCounts } from '@/utils/auth';
import { getPendingProjects } from '@/utils/projectManagement';
import { Link } from 'react-router-dom';

const TeacherDashboard = () => {
  const [stats, setStats] = useState({
    students: 0,
    courses: 4,
    marksCompletion: 87,
    upcomingSubmissions: 2,
    pendingProjects: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        const counts = await getUserCounts();
        
        const pendingProjects = await getPendingProjects();
        
        setStats({
          students: counts.activeStudents,
          courses: 4,
          marksCompletion: 87,
          upcomingSubmissions: 2,
          pendingProjects: pendingProjects.length
        });
      } catch (error) {
        console.error("Failed to load stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <DashboardLayout userRole="teacher" pageTitle="Teacher Dashboard">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">Students</CardTitle>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats.students}</div>
            <p className="text-xs text-muted-foreground">+2% from last semester</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">Courses</CardTitle>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.courses}</div>
            <p className="text-xs text-muted-foreground">Active in current semester</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">Marks Records</CardTitle>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.marksCompletion}%</div>
            <p className="text-xs text-muted-foreground">Completed for this semester</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingSubmissions}</div>
            <p className="text-xs text-muted-foreground">Submissions due this week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center space-x-2">
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats.pendingProjects}</div>
            <p className="text-xs text-muted-foreground">Projects waiting for approval</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-primary/5 border-primary/20 border-dashed">
          <CardHeader>
            <CardTitle className="text-xl">Upload Student Marks</CardTitle>
            <CardDescription>
              Upload Excel sheets with student marks to quickly update records
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1">
              <p>
                Use the Excel template to upload student marks for Internal Assessments,
                Assignments, and Final Exams. The system will automatically calculate
                grades and update student records.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <Button size="sm">
                  <BookOpen className="h-4 w-4 mr-2" />
                  View Template
                </Button>
                <Button size="sm" variant="outline">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Upload Mark Sheet
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              <img 
                src="/lovable-uploads/b813ce39-30da-427f-9bb7-880ff202d851.png" 
                alt="Excel Marks Sheet Template" 
                className="max-h-32 object-contain"
              />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-dashed border-orange-200 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="text-xl">Semester Performance Analysis</CardTitle>
            <CardDescription>
              View detailed analysis of student performance by semester
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Get comprehensive insights into student performance, grade distributions,
              and course statistics for each semester. Compare trends and identify areas
              for improvement.
            </p>
            <div className="mt-4">
              <Button asChild>
                <Link to="/teacher/semester-analysis">
                  <BarChart className="h-4 w-4 mr-2" />
                  View Semester Analysis
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="students">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="students" className="flex items-center">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Student Marks
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center">
            <Search className="h-4 w-4 mr-2" />
            Student Search
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center">
            <ClipboardCheck className="h-4 w-4 mr-2" />
            Project Verification
          </TabsTrigger>
          <TabsTrigger value="verification" className="flex items-center">
            <UserCheck className="h-4 w-4 mr-2" />
            Student Verification
          </TabsTrigger>
          <TabsTrigger value="classes" className="flex items-center">
            <BookOpen className="h-4 w-4 mr-2" />
            Classes
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="students" className="pt-6">
          <StudentsMarksManagement />
        </TabsContent>
        
        <TabsContent value="search" className="pt-6">
          <StudentSearch />
        </TabsContent>
        
        <TabsContent value="projects" className="pt-6">
          <StudentProjectVerification />
        </TabsContent>
        
        <TabsContent value="verification" className="pt-6">
          <StudentVerification />
        </TabsContent>
        
        <TabsContent value="classes" className="pt-6">
          <div className="p-12 text-center text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium">Class Management</h3>
            <p className="mt-2">Manage your class rosters and attendance</p>
          </div>
        </TabsContent>
        
        <TabsContent value="schedule" className="pt-6">
          <div className="p-12 text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium">Teaching Schedule</h3>
            <p className="mt-2">View and manage your teaching schedule</p>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
