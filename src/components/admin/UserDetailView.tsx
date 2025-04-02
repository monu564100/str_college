
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  EnhancedUser, 
  updateUser, 
  deleteUser, 
  changeUserRole 
} from '@/utils/userManagement';
import { 
  User, 
  Mail, 
  School, 
  Tag, 
  Calendar, 
  CheckCircle, 
  Trash2, 
  PencilLine, 
  Save, 
  UserCog,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface UserDetailViewProps {
  user: EnhancedUser | null;
  onUpdate: () => void;
}

const UserDetailView: React.FC<UserDetailViewProps> = ({ user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<EnhancedUser>>({});

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing
      setIsEditing(false);
      setEditedUser({});
    } else {
      // Start editing
      setIsEditing(true);
      setEditedUser({
        name: user?.name || '',
        email: user?.email || '',
        department: user?.department || '',
        role: user?.role || 'student',
        verificationStatus: user?.verificationStatus || 'pending'
      });
    }
  };

  const handleSaveUser = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const updatedUser = await updateUser(user.id, editedUser);
      if (updatedUser) {
        toast.success('User updated successfully');
        setIsEditing(false);
        onUpdate();
      } else {
        toast.error('Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Error updating user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const success = await deleteUser(user.id);
      if (success) {
        toast.success('User deleted successfully');
        onUpdate();
      } else {
        toast.error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Error deleting user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeRole = async (newRole: 'student' | 'teacher' | 'admin') => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const success = await changeUserRole(user.id, newRole);
      if (success) {
        toast.success(`User role changed to ${newRole}`);
        onUpdate();
      } else {
        toast.error('Failed to change user role');
      }
    } catch (error) {
      console.error('Error changing user role:', error);
      toast.error('Error changing user role');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const updatedUser = await updateUser(user.id, { verificationStatus: 'verified' });
      if (updatedUser) {
        toast.success('User verified successfully');
        onUpdate();
      } else {
        toast.error('Failed to verify user');
      }
    } catch (error) {
      console.error('Error verifying user:', error);
      toast.error('Error verifying user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({ ...prev, [name]: value }));
  };

  if (!user) {
    return (
      <Card className="h-full flex items-center justify-center text-center p-6">
        <div>
          <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No User Selected</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Select a user from the list to view details
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>User Details</CardTitle>
            <CardDescription className="mt-1">
              Manage user information and settings
            </CardDescription>
          </div>
          <Badge className={
            user.verificationStatus === 'verified' ? 'bg-green-500' :
            user.verificationStatus === 'rejected' ? 'bg-red-500' :
            'bg-amber-500'
          }>
            {user.verificationStatus.charAt(0).toUpperCase() + user.verificationStatus.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isEditing ? (
          // Edit mode fields
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={editedUser.name || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                value={editedUser.email || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                name="department"
                value={editedUser.department || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={editedUser.role}
                onValueChange={(value) => setEditedUser({...editedUser, role: value as 'student' | 'teacher' | 'admin'})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="verificationStatus">Verification Status</Label>
              <Select
                value={editedUser.verificationStatus}
                onValueChange={(value) => setEditedUser({...editedUser, verificationStatus: value as 'pending' | 'verified' | 'rejected'})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          // View mode
          <div className="space-y-4">
            <div className="flex items-center">
              <User className="h-5 w-5 text-muted-foreground mr-3" />
              <div>
                <div className="font-medium">{user.name}</div>
                <div className="text-sm text-muted-foreground">Name</div>
              </div>
            </div>
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-muted-foreground mr-3" />
              <div>
                <div className="font-medium">{user.email}</div>
                <div className="text-sm text-muted-foreground">Email</div>
              </div>
            </div>
            <div className="flex items-center">
              <School className="h-5 w-5 text-muted-foreground mr-3" />
              <div>
                <div className="font-medium capitalize">{user.role}</div>
                <div className="text-sm text-muted-foreground">Role</div>
              </div>
            </div>
            <div className="flex items-center">
              <Tag className="h-5 w-5 text-muted-foreground mr-3" />
              <div>
                <div className="font-medium">{user.department}</div>
                <div className="text-sm text-muted-foreground">Department</div>
              </div>
            </div>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-muted-foreground mr-3" />
              <div>
                <div className="font-medium">{user.joinDate}</div>
                <div className="text-sm text-muted-foreground">Join Date</div>
              </div>
            </div>
            {user.usn && (
              <div className="flex items-center">
                <Tag className="h-5 w-5 text-muted-foreground mr-3" />
                <div>
                  <div className="font-medium">{user.usn}</div>
                  <div className="text-sm text-muted-foreground">USN</div>
                </div>
              </div>
            )}
          </div>
        )}

        <Separator />

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Quick Actions</h3>
          <div className="flex flex-wrap gap-2">
            {user.verificationStatus === 'pending' && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center text-green-600"
                onClick={handleVerify}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-1" />
                )}
                Verify User
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleChangeRole('admin')}
              disabled={user.role === 'admin' || isLoading}
            >
              <UserCog className="h-4 w-4 mr-1" />
              Make Admin
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleChangeRole('teacher')}
              disabled={user.role === 'teacher' || isLoading}
            >
              <UserCog className="h-4 w-4 mr-1" />
              Make Teacher
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleChangeRole('student')}
              disabled={user.role === 'student' || isLoading}
            >
              <UserCog className="h-4 w-4 mr-1" />
              Make Student
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-1" />
                )}
                Delete User
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete User Account</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this user? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteUser}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        
        <div className="space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleEditToggle}
            disabled={isLoading}
          >
            {isEditing ? 'Cancel' : (
              <>
                <PencilLine className="h-4 w-4 mr-1" />
                Edit
              </>
            )}
          </Button>
          
          {isEditing && (
            <Button 
              size="sm" 
              onClick={handleSaveUser}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              Save
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default UserDetailView;
