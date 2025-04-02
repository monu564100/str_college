
import React, { useState, useEffect } from 'react';
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
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { getPendingUsers, verifyUserById, User } from '@/utils/auth';

interface UserVerificationProps {}

const UserVerification: React.FC<UserVerificationProps> = () => {
  const [pendingTeachers, setPendingTeachers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingUsers, setProcessingUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadPendingTeachers();
  }, []);

  const loadPendingTeachers = async () => {
    setIsLoading(true);
    try {
      // Get real pending teachers from localStorage, not demo data
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const teachers = users.filter((user: User) => 
        user.role === 'teacher' && user.verificationStatus === 'pending'
      );
      setPendingTeachers(teachers);
    } catch (error) {
      console.error('Failed to load pending teachers:', error);
      toast.error('Failed to load pending verification requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (userId: string) => {
    setProcessingUsers(prev => new Set(prev).add(userId));
    try {
      const success = await verifyUserById(userId, 'verified');
      if (success) {
        setPendingTeachers(pendingTeachers.filter(teacher => teacher.id !== userId));
        toast.success("Teacher verified successfully");
      }
    } catch (error) {
      console.error('Failed to verify teacher:', error);
      toast.error('Failed to verify teacher');
    } finally {
      setProcessingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleReject = async (userId: string) => {
    setProcessingUsers(prev => new Set(prev).add(userId));
    try {
      const success = await verifyUserById(userId, 'rejected');
      if (success) {
        setPendingTeachers(pendingTeachers.filter(teacher => teacher.id !== userId));
        toast.success("Teacher rejected");
      }
    } catch (error) {
      console.error('Failed to reject teacher:', error);
      toast.error('Failed to reject teacher');
    } finally {
      setProcessingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Faculty Verification</CardTitle>
          <CardDescription>
            Verify new faculty member registrations
          </CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadPendingTeachers}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <span className="ml-2">Loading verification requests...</span>
          </div>
        ) : pendingTeachers.length === 0 ? (
          <div className="text-center py-10">
            <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No pending verifications</h3>
            <p className="text-sm text-muted-foreground mt-2">
              All faculty members have been verified or rejected
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingTeachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell className="font-medium">{teacher.name}</TableCell>
                  <TableCell>{teacher.email}</TableCell>
                  <TableCell>{teacher.department}</TableCell>
                  <TableCell>{teacher.joinDate}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {teacher.verificationStatus.charAt(0).toUpperCase() + teacher.verificationStatus.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleVerify(teacher.id)}
                        disabled={processingUsers.has(teacher.id)}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        {processingUsers.has(teacher.id) ? (
                          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="mr-1 h-4 w-4" />
                        )}
                        Verify
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleReject(teacher.id)}
                        disabled={processingUsers.has(teacher.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {processingUsers.has(teacher.id) ? (
                          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="mr-1 h-4 w-4" />
                        )}
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default UserVerification;
