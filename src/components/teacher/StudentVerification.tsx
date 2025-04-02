
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

interface StudentVerificationProps {}

const StudentVerification: React.FC<StudentVerificationProps> = () => {
  const [pendingStudents, setPendingStudents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingUsers, setProcessingUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadPendingStudents();
  }, []);

  const loadPendingStudents = async () => {
    setIsLoading(true);
    try {
      // Get real pending students from localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const students = users.filter((user: User) => 
        user.role === 'student' && user.verificationStatus === 'pending'
      );
      setPendingStudents(students);
    } catch (error) {
      console.error('Failed to load pending students:', error);
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
        setPendingStudents(pendingStudents.filter(student => student.id !== userId));
        toast.success("Student verified successfully");
      }
    } catch (error) {
      console.error('Failed to verify student:', error);
      toast.error('Failed to verify student');
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
        setPendingStudents(pendingStudents.filter(student => student.id !== userId));
        toast.success("Student rejected");
      }
    } catch (error) {
      console.error('Failed to reject student:', error);
      toast.error('Failed to reject student');
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
          <CardTitle>Student Verification</CardTitle>
          <CardDescription>
            Verify new student registrations
          </CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadPendingStudents}
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
        ) : pendingStudents.length === 0 ? (
          <div className="text-center py-10">
            <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No pending verifications</h3>
            <p className="text-sm text-muted-foreground mt-2">
              All students have been verified or rejected
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>USN</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.usn}</TableCell>
                  <TableCell>{student.department}</TableCell>
                  <TableCell>{student.joinDate}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {student.verificationStatus.charAt(0).toUpperCase() + student.verificationStatus.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleVerify(student.id)}
                        disabled={processingUsers.has(student.id)}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        {processingUsers.has(student.id) ? (
                          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="mr-1 h-4 w-4" />
                        )}
                        Verify
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleReject(student.id)}
                        disabled={processingUsers.has(student.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {processingUsers.has(student.id) ? (
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

export default StudentVerification;
