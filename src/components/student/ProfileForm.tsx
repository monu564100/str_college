
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UploadCloud } from 'lucide-react';
import StudentMarks, { StudentMark } from './StudentMarks';
import { getStudentMarks, StudentMarkData } from '@/utils/api';
import AcademicPerformance from './AcademicPerformance';

const ProfileForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    gender: 'male',
    address: '',
    studentId: '',
    department: 'computerScience',
    degree: 'btech',
    admissionYear: '2020',
    currentSemester: '6',
    cgpa: '',
    moocCourses: ''
  });
  const [studentMarks, setStudentMarks] = useState<StudentMark[]>([]);

  // Load profile data from localStorage on component mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const studentId = user.id;
    
    // Load profile data
    const savedProfile = localStorage.getItem(`student_profile_${studentId}`);
    if (savedProfile) {
      setProfileData(JSON.parse(savedProfile));
    } else {
      // Set default email and name from user object
      if (user.email) {
        setProfileData(prev => ({
          ...prev,
          email: user.email,
          firstName: user.name?.split(' ')[0] || '',
          lastName: user.name?.split(' ')[1] || '',
          studentId: user.id || '',
          department: user.department || 'computerScience'
        }));
      }
    }
    
    // Load marks data
    const loadMarks = async () => {
      try {
        const marks = await getStudentMarks(studentId);
        setStudentMarks(marks.map(mark => ({
          subject: mark.courseName,
          ia1: mark.IA1,
          ia2: mark.IA2,
          semester: mark.semester,
          totalMarks: mark.totalMarks,
          grade: mark.grade
        })));
      } catch (error) {
        console.error('Error loading student marks:', error);
      }
    };
    
    loadMarks();
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setProfileData(prev => ({ ...prev, [id]: value }));
  };
  
  const handleSelectChange = (id: string, value: string) => {
    setProfileData(prev => ({ ...prev, [id]: value }));
  };
  
  const handleBasicInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Save to localStorage
    localStorage.setItem(`student_profile_${user.id}`, JSON.stringify(profileData));
    
    setTimeout(() => {
      toast.success('Profile information updated successfully');
      setIsSubmitting(false);
    }, 500);
  };
  
  const handleAcademicInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Save to localStorage
    localStorage.setItem(`student_profile_${user.id}`, JSON.stringify(profileData));
    
    setTimeout(() => {
      toast.success('Academic information updated successfully');
      setIsSubmitting(false);
    }, 500);
  };
  
  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Save document to localStorage (simulated)
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const documents = JSON.parse(localStorage.getItem(`student_documents_${user.id}`) || '[]');
      documents.push({
        id: Math.random().toString(),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date().toISOString()
      });
      localStorage.setItem(`student_documents_${user.id}`, JSON.stringify(documents));
      
      toast.success(`File "${file.name}" uploaded successfully`);
    }
  };

  // Get uploaded documents
  const getUploadedDocuments = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return JSON.parse(localStorage.getItem(`student_documents_${user.id}`) || '[]');
  };

  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="basic">Basic Information</TabsTrigger>
        <TabsTrigger value="academic">Academic Details</TabsTrigger>
        <TabsTrigger value="marks">Academic Performance</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
      </TabsList>
      
      <TabsContent value="basic">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your personal information and contact details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBasicInfoSubmit} className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <Avatar className="w-24 h-24">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>{profileData.firstName?.charAt(0)}{profileData.lastName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <Button size="sm" variant="outline" type="button">
                    Change Avatar
                  </Button>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    value={profileData.firstName} 
                    onChange={handleInputChange}
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    value={profileData.lastName} 
                    onChange={handleInputChange}
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={profileData.email} 
                    onChange={handleInputChange}
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    value={profileData.phone} 
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input 
                    id="dob" 
                    type="date" 
                    value={profileData.dob} 
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select 
                    value={profileData.gender}
                    onValueChange={(value) => handleSelectChange('gender', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="preferNotToSay">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea 
                  id="address" 
                  value={profileData.address} 
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="academic">
        <Card>
          <CardHeader>
            <CardTitle>Academic Information</CardTitle>
            <CardDescription>
              Manage your academic details and educational background.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAcademicInfoSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input 
                    id="studentId" 
                    value={profileData.studentId} 
                    readOnly 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select 
                    value={profileData.department}
                    onValueChange={(value) => handleSelectChange('department', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="computerScience">Computer Science</SelectItem>
                      <SelectItem value="electrical">Electrical Engineering</SelectItem>
                      <SelectItem value="mechanical">Mechanical Engineering</SelectItem>
                      <SelectItem value="civil">Civil Engineering</SelectItem>
                      <SelectItem value="business">Business Administration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="degree">Degree Program</Label>
                  <Select 
                    value={profileData.degree}
                    onValueChange={(value) => handleSelectChange('degree', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select degree" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="btech">B.Tech</SelectItem>
                      <SelectItem value="mtech">M.Tech</SelectItem>
                      <SelectItem value="phd">Ph.D</SelectItem>
                      <SelectItem value="diploma">Diploma</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="admissionYear">Admission Year</Label>
                  <Input 
                    id="admissionYear" 
                    type="number" 
                    value={profileData.admissionYear} 
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currentSemester">Current Semester</Label>
                  <Select 
                    value={profileData.currentSemester}
                    onValueChange={(value) => handleSelectChange('currentSemester', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <SelectItem key={sem} value={sem.toString()}>
                          Semester {sem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cgpa">Current CGPA</Label>
                  <Input 
                    id="cgpa" 
                    type="text" 
                    value={profileData.cgpa} 
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="moocCourses">MOOC Courses Completed</Label>
                <Textarea 
                  id="moocCourses" 
                  placeholder="Enter MOOC courses details (course name, platform, completion date)"
                  value={profileData.moocCourses}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="marks">
        <div className="space-y-6">
          <AcademicPerformance />
          <StudentMarks marks={studentMarks} />
        </div>
      </TabsContent>
      
      <TabsContent value="documents">
        <Card>
          <CardHeader>
            <CardTitle>Documents & Uploads</CardTitle>
            <CardDescription>
              Upload and manage your project documents, presentations, and other files.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
                <div className="flex flex-col items-center space-y-2">
                  <div className="p-3 bg-primary-foreground rounded-full">
                    <UploadCloud className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-sm">
                    <Label htmlFor="fileUpload" className="font-medium text-primary cursor-pointer hover:underline">
                      Click to upload
                    </Label>
                    <span className="text-muted-foreground"> or drag and drop</span>
                    <Input
                      id="fileUpload"
                      type="file"
                      className="hidden"
                      onChange={handleDocumentUpload}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, PPT, DOCX up to 10MB
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Uploaded Documents</h3>
                <div className="space-y-3">
                  {getUploadedDocuments().map((file: any) => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-muted rounded-md">
                      <div className="truncate">{file.name}</div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                        <Button size="sm" variant="destructive">
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                  {getUploadedDocuments().length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      No documents uploaded yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default ProfileForm;
