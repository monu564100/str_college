
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserCheck, BookOpen, BarChart3, BookUser } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserManagement from '@/components/admin/UserManagement';
import UserVerification from '@/components/admin/UserVerification';

const AdminDashboard = () => {
  const [counts, setCounts] = useState({
    totalUsers: 0,
    activeStudents: 0,
    facultyMembers: 0,
    activeCourses: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCounts = async () => {
      try {
        setIsLoading(true);
        // Get real user counts from localStorage
        const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
        
        const totalUsers = allUsers.length;
        const activeStudents = allUsers.filter((user: any) => 
          user.role === 'student' && user.verificationStatus === 'verified'
        ).length;
        const facultyMembers = allUsers.filter((user: any) => 
          user.role === 'teacher' && user.verificationStatus === 'verified'
        ).length;
        
        // For courses, we could use a more sophisticated approach in a real app
        // For now, we'll estimate based on faculty members
        const activeCourses = facultyMembers > 0 ? facultyMembers * 2 : 0;
        
        setCounts({
          totalUsers,
          activeStudents,
          facultyMembers,
          activeCourses
        });
      } catch (error) {
        console.error('Failed to load user counts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCounts();
  }, []);

  return (
    <DashboardLayout userRole="admin" pageTitle="Admin Dashboard">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <CardDescription>System Users</CardDescription>
            </div>
            <div className="p-2 bg-primary/10 rounded-full">
              <Users className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : counts.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All registered users
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">Active Students</CardTitle>
              <CardDescription>Verified Students</CardDescription>
            </div>
            <div className="p-2 bg-primary/10 rounded-full">
              <UserCheck className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : counts.activeStudents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Verified student accounts
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">Faculty Members</CardTitle>
              <CardDescription>Available Teachers</CardDescription>
            </div>
            <div className="p-2 bg-primary/10 rounded-full">
              <BookUser className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : counts.facultyMembers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Verified faculty members</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
              <CardDescription>Current Semester</CardDescription>
            </div>
            <div className="p-2 bg-primary/10 rounded-full">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : counts.activeCourses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all departments</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6">
        <Tabs defaultValue="verification">
          <TabsList>
            <TabsTrigger value="verification">Verification Requests</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="verification" className="mt-6">
            <UserVerification />
          </TabsContent>
          
          <TabsContent value="users" className="mt-6">
            <UserManagement />
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>System Analytics</CardTitle>
                <CardDescription>Overview of system usage and performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center border border-dashed rounded-md">
                  <div className="text-center">
                    <BarChart3 className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Analytics Dashboard</h3>
                    <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                      Detailed analytics will be available here showing user engagement, course completion rates, and system performance metrics.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reports" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>System Reports</CardTitle>
                <CardDescription>Generate and download various system reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[
                    "Student Performance Report",
                    "Course Completion Report",
                    "Faculty Activity Report",
                    "Department Statistics",
                    "User Registration Report",
                    "System Access Logs"
                  ].map((report, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <span>{report}</span>
                          <Button size="sm" variant="outline">Generate</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
