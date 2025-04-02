
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, CheckCircle, XCircle, Clock, Eye, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getPendingProjects, updateProjectVerification } from '@/utils/projectManagement';
import { IStudentProject } from '@/models/StudentProject';
import StudentProjects from '@/components/student/StudentProjects';

const StudentProjectVerification = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingProjects, setPendingProjects] = useState<IStudentProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<IStudentProject | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'verified' | 'rejected'>('verified');
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<'all' | 'mooc' | 'mini-project'>('all');

  useEffect(() => {
    const loadPendingProjects = async () => {
      try {
        setIsLoading(true);
        const projects = await getPendingProjects();
        setPendingProjects(projects);
      } catch (error) {
        console.error('Error loading pending projects:', error);
        toast.error('Failed to load pending projects');
      } finally {
        setIsLoading(false);
      }
    };

    loadPendingProjects();
  }, []);

  const filteredProjects = pendingProjects.filter(project => {
    const matchesSearch = 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.usn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.studentName && project.studentName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = selectedType === 'all' || project.projectType === selectedType;
    
    return matchesSearch && matchesType;
  });

  const handleViewDetails = (project: IStudentProject) => {
    setSelectedProject(project);
    setIsDetailsOpen(true);
  };

  const handleOpenVerifyDialog = (project: IStudentProject, status: 'verified' | 'rejected') => {
    setSelectedProject(project);
    setVerificationStatus(status);
    setFeedback('');
    setIsVerifyDialogOpen(true);
  };

  const handleVerifyProject = async () => {
    if (!selectedProject) return;
    
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const teacherId = user.id;
      
      const updatedProject = await updateProjectVerification(
        selectedProject.usn,
        selectedProject.id as string,
        verificationStatus,
        teacherId,
        feedback
      );
      
      if (updatedProject) {
        // Update the local state
        setPendingProjects(prevProjects => 
          prevProjects.filter(p => p.id !== selectedProject.id)
        );
        
        toast.success(
          `Project ${verificationStatus === 'verified' ? 'verified' : 'rejected'} successfully`
        );
        
        setIsVerifyDialogOpen(false);
      } else {
        toast.error('Failed to update project verification status');
      }
    } catch (error) {
      console.error('Error verifying project:', error);
      toast.error('Failed to update project verification status');
    }
  };

  const getStatusBadge = (status: 'pending' | 'verified' | 'rejected') => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="w-3 h-3 mr-1" /> Verified
        </Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          <XCircle className="w-3 h-3 mr-1" /> Rejected
        </Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          <Clock className="w-3 h-3 mr-1" /> Pending
        </Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Student Project Verification</CardTitle>
          <CardDescription>Verify MOOC courses and mini-projects submitted by students</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, USN, or project title..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select value={selectedType} onValueChange={(value: 'all' | 'mooc' | 'mini-project') => setSelectedType(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="mooc">MOOC Courses</SelectItem>
                  <SelectItem value="mini-project">Mini Projects</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>USN</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Project Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">Loading projects...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredProjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      {searchQuery || selectedType !== 'all'
                        ? 'No projects found matching your search criteria.'
                        : 'No pending projects found for verification.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.usn}</TableCell>
                      <TableCell>{project.studentName}</TableCell>
                      <TableCell>
                        {project.projectType === 'mooc' ? 'MOOC Course' : 'Mini Project'}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={project.title}>
                          {project.title}
                        </div>
                      </TableCell>
                      <TableCell>{project.semester}</TableCell>
                      <TableCell>{getStatusBadge(project.verificationStatus)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewDetails(project)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-green-500 text-green-600 hover:bg-green-50"
                            onClick={() => handleOpenVerifyDialog(project, 'verified')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Verify
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-red-500 text-red-600 hover:bg-red-50"
                            onClick={() => handleOpenVerifyDialog(project, 'rejected')}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Project Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl">
          {selectedProject && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedProject.title}</DialogTitle>
                <DialogDescription>
                  Submitted by {selectedProject.studentName || selectedProject.usn} for Semester {selectedProject.semester}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Project Type</p>
                    <p className="text-sm">
                      {selectedProject.projectType === 'mooc' ? 'MOOC Course' : 'Mini Project'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Submission Date</p>
                    <p className="text-sm">
                      {new Date(selectedProject.submissionDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium">Description</p>
                    <p className="text-sm whitespace-pre-line">{selectedProject.description}</p>
                  </div>
                  {selectedProject.certificateUrl && (
                    <div>
                      <p className="text-sm font-medium">Certificate</p>
                      <Button variant="outline" size="sm" asChild className="mt-1">
                        <a href={selectedProject.certificateUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View Certificate
                        </a>
                      </Button>
                    </div>
                  )}
                  {selectedProject.projectUrl && (
                    <div>
                      <p className="text-sm font-medium">Project Link</p>
                      <Button variant="outline" size="sm" asChild className="mt-1">
                        <a href={selectedProject.projectUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View Project
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  className="border-green-500 text-green-600 hover:bg-green-50"
                  onClick={() => {
                    setIsDetailsOpen(false);
                    handleOpenVerifyDialog(selectedProject, 'verified');
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Verify
                </Button>
                <Button 
                  variant="outline" 
                  className="border-red-500 text-red-600 hover:bg-red-50"
                  onClick={() => {
                    setIsDetailsOpen(false);
                    handleOpenVerifyDialog(selectedProject, 'rejected');
                  }}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Verification Dialog */}
      <Dialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
        <DialogContent>
          {selectedProject && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {verificationStatus === 'verified' ? 'Verify' : 'Reject'} Project
                </DialogTitle>
                <DialogDescription>
                  {verificationStatus === 'verified' 
                    ? 'Confirm that this project meets the requirements'
                    : 'Provide a reason for rejecting this project'}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm font-medium">Project: {selectedProject.title}</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Submitted by {selectedProject.studentName || selectedProject.usn}
                </p>
                
                <div className="space-y-2">
                  <label htmlFor="feedback" className="text-sm font-medium">
                    {verificationStatus === 'verified' ? 'Feedback (Optional)' : 'Reason for Rejection'}
                  </label>
                  <Textarea
                    id="feedback"
                    placeholder={verificationStatus === 'verified' 
                      ? "Add any feedback for the student (optional)"
                      : "Please provide a reason for rejection"}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    required={verificationStatus === 'rejected'}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button 
                  onClick={handleVerifyProject}
                  className={verificationStatus === 'verified' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'}
                  disabled={verificationStatus === 'rejected' && !feedback}
                >
                  {verificationStatus === 'verified' ? 'Verify Project' : 'Reject Project'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentProjectVerification;
