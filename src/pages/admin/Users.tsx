
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AdminUserList from '@/components/admin/AdminUserList';
import UserDetailView from '@/components/admin/UserDetailView';
import { EnhancedUser, getAllUsers, getUserStats } from '@/utils/userManagement';
import { 
  Search, 
  Filter, 
  UserPlus, 
  RefreshCw, 
  Download, 
  Upload, 
  Loader2 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const Users = () => {
  const [users, setUsers] = useState<EnhancedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<EnhancedUser | null>(null);
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeStudents: 0,
    pendingStudents: 0,
    activeTeachers: 0,
    pendingTeachers: 0,
    adminUsers: 0
  });

  useEffect(() => {
    loadUsers();
    loadUserStats();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const filters: any = {};
      if (roleFilter !== 'all') filters.role = roleFilter;
      if (statusFilter !== 'all') filters.verificationStatus = statusFilter;
      if (searchQuery) filters.searchQuery = searchQuery;
      
      const fetchedUsers = await getAllUsers(filters);
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const stats = await getUserStats();
      setUserStats(stats);
    } catch (error) {
      console.error('Failed to load user statistics:', error);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = () => {
    loadUsers();
  };

  const handleUserSelect = (user: EnhancedUser) => {
    setSelectedUser(user);
  };

  const handleUserUpdate = () => {
    loadUsers();
    loadUserStats();
    setSelectedUser(null);
  };

  return (
    <DashboardLayout userRole="admin" pageTitle="User Management">
      <div className="grid gap-6 mb-6 md:grid-cols-4">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All registered users in the system
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.activeStudents}</div>
            <div className="flex items-center mt-1">
              <Badge variant="outline" className="text-xs">
                {userStats.pendingStudents} pending
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Faculty</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.activeTeachers}</div>
            <div className="flex items-center mt-1">
              <Badge variant="outline" className="text-xs">
                {userStats.pendingTeachers} pending
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.adminUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              System administrators
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name, email, ID or department..."
            className="pl-10"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="student">Students</SelectItem>
              <SelectItem value="teacher">Faculty</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={handleFilterChange}>
            <Filter className="h-4 w-4 mr-2" />
            Apply Filters
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">User Management</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadUsers}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Loading users...</span>
                </div>
              ) : (
                <AdminUserList 
                  users={users} 
                  onUserSelect={handleUserSelect}
                  selectedUserId={selectedUser?.id}
                />
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <UserDetailView 
            user={selectedUser} 
            onUpdate={handleUserUpdate}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Users;
