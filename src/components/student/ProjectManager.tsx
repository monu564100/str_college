
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Github, Upload, Vote, Award } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";

// Project interface
interface Project {
  id: string;
  title: string;
  description: string;
  deadline: string;
  progress: number;
  studentId: string;
  studentName: string;
  githubRepo?: string;
  presentationLink?: string;
  votes: string[]; // Array of user IDs who voted
  createdAt: string;
}

const ProjectManager = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    deadline: '',
    githubRepo: '',
    presentationLink: ''
  });
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Load user data from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
    
    // Load projects from localStorage
    const storedProjects = JSON.parse(localStorage.getItem('student_projects') || '[]');
    setProjects(storedProjects);
    
    // Filter user's projects
    const userProjs = storedProjects.filter((project: Project) => project.studentId === user.id);
    setUserProjects(userProjs);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewProject({
      ...newProject,
      [name]: value
    });
  };

  const handleProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProject.title || !newProject.description || !newProject.deadline) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }
    
    // Create new project
    const projectId = `project_${Date.now()}`;
    const project: Project = {
      id: projectId,
      title: newProject.title,
      description: newProject.description,
      deadline: newProject.deadline,
      progress: 0,
      studentId: currentUser.id,
      studentName: currentUser.name,
      githubRepo: newProject.githubRepo,
      presentationLink: newProject.presentationLink,
      votes: [],
      createdAt: new Date().toISOString()
    };
    
    // Add to projects list
    const updatedProjects = [...projects, project];
    setProjects(updatedProjects);
    setUserProjects([...userProjects, project]);
    
    // Save to localStorage
    localStorage.setItem('student_projects', JSON.stringify(updatedProjects));
    
    // Reset form
    setNewProject({
      title: '',
      description: '',
      deadline: '',
      githubRepo: '',
      presentationLink: ''
    });
    
    setShowUploadForm(false);
    toast({
      title: "Success",
      description: "Project uploaded successfully!",
    });
  };

  const handleVote = (projectId: string) => {
    if (!currentUser || !currentUser.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to vote for projects",
        variant: "destructive"
      });
      return;
    }
    
    // Check if already voted
    const projectIndex = projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) return;
    
    const project = projects[projectIndex];
    
    // Check if user already voted for this project
    if (project.votes.includes(currentUser.id)) {
      // Remove vote
      const updatedVotes = project.votes.filter(id => id !== currentUser.id);
      const updatedProject = { ...project, votes: updatedVotes };
      const updatedProjects = [...projects];
      updatedProjects[projectIndex] = updatedProject;
      
      setProjects(updatedProjects);
      localStorage.setItem('student_projects', JSON.stringify(updatedProjects));
      
      toast({
        title: "Vote Removed",
        description: "Your vote has been removed",
      });
    } else {
      // Add vote
      const updatedVotes = [...project.votes, currentUser.id];
      const updatedProject = { ...project, votes: updatedVotes };
      const updatedProjects = [...projects];
      updatedProjects[projectIndex] = updatedProject;
      
      setProjects(updatedProjects);
      localStorage.setItem('student_projects', JSON.stringify(updatedProjects));
      
      toast({
        title: "Vote Added",
        description: "Your vote has been counted!",
      });
    }
    
    // Update user projects if needed
    const userProjIndex = userProjects.findIndex(p => p.id === projectId);
    if (userProjIndex !== -1) {
      const updatedUserProjects = [...userProjects];
      updatedUserProjects[userProjIndex] = projects[projectIndex];
      setUserProjects(updatedUserProjects);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Student Projects</h2>
          <p className="text-sm text-muted-foreground">Upload and vote for innovative projects</p>
        </div>
        <Button 
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="flex items-center gap-2"
        >
          <Upload size={16} />
          {showUploadForm ? 'Cancel' : 'Upload Project'}
        </Button>
      </div>
      
      {showUploadForm && (
        <Card>
          <CardHeader>
            <CardTitle>Upload New Project</CardTitle>
            <CardDescription>Share your project with other students</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProjectSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">Project Title *</label>
                <Input
                  id="title"
                  name="title"
                  value={newProject.title}
                  onChange={handleInputChange}
                  placeholder="Enter project title"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">Project Description *</label>
                <Textarea
                  id="description"
                  name="description"
                  value={newProject.description}
                  onChange={handleInputChange}
                  placeholder="Describe your project"
                  required
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="deadline" className="text-sm font-medium">Deadline *</label>
                <Input
                  id="deadline"
                  name="deadline"
                  type="date"
                  value={newProject.deadline}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="githubRepo" className="text-sm font-medium">GitHub Repository URL</label>
                <Input
                  id="githubRepo"
                  name="githubRepo"
                  value={newProject.githubRepo}
                  onChange={handleInputChange}
                  placeholder="https://github.com/username/repo"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="presentationLink" className="text-sm font-medium">Presentation Link</label>
                <Input
                  id="presentationLink"
                  name="presentationLink"
                  value={newProject.presentationLink}
                  onChange={handleInputChange}
                  placeholder="Link to your presentation"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowUploadForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">Submit Project</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {projects.length > 0 ? (
          projects.sort((a, b) => b.votes.length - a.votes.length).map((project) => (
            <Card key={project.id} className={`overflow-hidden ${project.votes.length > 0 ? 'border-primary/30' : ''}`}>
              <CardHeader className="relative">
                {project.votes.length > 0 && project.votes.length === Math.max(...projects.map(p => p.votes.length)) && (
                  <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground p-1 rounded-bl-md rounded-tr-md">
                    <Award size={16} />
                  </div>
                )}
                <CardTitle className="text-base truncate">{project.title}</CardTitle>
                <CardDescription>By {project.studentName}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm line-clamp-2">{project.description}</p>
                
                <div className="flex flex-wrap gap-2">
                  {project.githubRepo && (
                    <a 
                      href={project.githubRepo} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs bg-muted px-2 py-1 rounded-full"
                    >
                      <Github size={12} className="mr-1" />
                      GitHub
                    </a>
                  )}
                  
                  {project.presentationLink && (
                    <a 
                      href={project.presentationLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs bg-muted px-2 py-1 rounded-full"
                    >
                      <FileText size={12} className="mr-1" />
                      Presentation
                    </a>
                  )}
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-1" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center pt-1">
                <div className="text-xs text-muted-foreground">
                  Due: {formatDate(project.deadline)}
                </div>
                <Button 
                  variant={project.votes.includes(currentUser?.id) ? "default" : "outline"} 
                  size="sm"
                  className="gap-1"
                  onClick={() => handleVote(project.id)}
                >
                  <Vote size={14} />
                  <span>{project.votes.length}</span>
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center p-8 text-center">
            <div className="rounded-full bg-muted p-3">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No projects yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Be the first to upload a project and share your ideas with other students.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectManager;
