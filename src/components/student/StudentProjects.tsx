
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { ExternalLink, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from '@/components/ui/button';

export interface StudentProject {
  id: string;
  projectType: 'mooc' | 'mini-project';
  title: string;
  description: string;
  semester: number;
  submissionDate: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  certificateUrl?: string;
  projectUrl?: string;
  grade?: string;
  feedback?: string;
}

interface StudentProjectsProps {
  studentId?: string;
  studentName?: string;
  projects: StudentProject[];
  isTeacherView?: boolean;
  onVerify?: (projectId: string, status: 'verified' | 'rejected', feedback?: string) => void;
}

const StudentProjects: React.FC<StudentProjectsProps> = ({ 
  studentId, 
  studentName, 
  projects,
  isTeacherView = false,
  onVerify
}) => {
  // Group projects by semester
  const projectsBySemester = projects.reduce((acc: Record<number, StudentProject[]>, project) => {
    if (!acc[project.semester]) {
      acc[project.semester] = [];
    }
    
    acc[project.semester].push(project);
    return acc;
  }, {});
  
  const semesters = Object.keys(projectsBySemester).map(Number).sort((a, b) => a - b);
  
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
      {semesters.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {isTeacherView && studentName ? `${studentName}'s Projects` : 'My Projects'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              No projects submitted yet.
            </div>
          </CardContent>
        </Card>
      ) : (
        semesters.map(semester => (
          <Card key={semester}>
            <CardHeader>
              <CardTitle>
                {isTeacherView && studentName 
                  ? `${studentName}'s Projects - Semester ${semester}` 
                  : `My Projects - Semester ${semester}`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Submission Date</TableHead>
                    <TableHead>Status</TableHead>
                    {isTeacherView && <TableHead>Actions</TableHead>}
                    <TableHead>Links</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projectsBySemester[semester].map(project => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">
                        {project.projectType === 'mooc' ? 'MOOC Course' : 'Mini Project'}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{project.title}</div>
                          <div className="text-sm text-muted-foreground">{project.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(project.submissionDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(project.verificationStatus)}
                        {project.feedback && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            Feedback: {project.feedback}
                          </div>
                        )}
                      </TableCell>
                      {isTeacherView && (
                        <TableCell>
                          {project.verificationStatus === 'pending' && onVerify && (
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="flex items-center gap-1 border-green-500 text-green-600 hover:bg-green-50"
                                onClick={() => onVerify(project.id, 'verified')}
                              >
                                <CheckCircle className="h-3 w-3" />
                                Verify
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="flex items-center gap-1 border-red-500 text-red-600 hover:bg-red-50"
                                onClick={() => onVerify(project.id, 'rejected')}
                              >
                                <XCircle className="h-3 w-3" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="flex space-x-2">
                          {project.certificateUrl && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={project.certificateUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Certificate
                              </a>
                            </Button>
                          )}
                          {project.projectUrl && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={project.projectUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Project
                              </a>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default StudentProjects;
