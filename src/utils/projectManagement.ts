
import { IStudentProject, ProjectVerificationStatus } from '@/models/StudentProject';
import { getStudentProjectStorageKey, normalizeUSN } from '@/utils/studentIdentification';

// Get all projects for a student
export const getStudentProjects = async (usn: string): Promise<IStudentProject[]> => {
  try {
    const normalizedUSN = normalizeUSN(usn);
    const storageKey = getStudentProjectStorageKey(normalizedUSN);
    const projectsJson = localStorage.getItem(storageKey);
    
    if (projectsJson) {
      return JSON.parse(projectsJson);
    }
    
    return [];
  } catch (error) {
    console.error('Error getting student projects:', error);
    return [];
  }
};

// Get project by ID
export const getProjectById = async (usn: string, projectId: string): Promise<IStudentProject | null> => {
  try {
    const projects = await getStudentProjects(usn);
    return projects.find(p => p.id === projectId) || null;
  } catch (error) {
    console.error('Error getting project by ID:', error);
    return null;
  }
};

// Update project verification status
export const updateProjectVerification = async (
  usn: string,
  projectId: string,
  status: ProjectVerificationStatus,
  teacherId: string,
  feedback?: string
): Promise<IStudentProject | null> => {
  try {
    const normalizedUSN = normalizeUSN(usn);
    const storageKey = getStudentProjectStorageKey(normalizedUSN);
    const projectsJson = localStorage.getItem(storageKey);
    
    if (!projectsJson) {
      return null;
    }
    
    const projects = JSON.parse(projectsJson);
    const projectIndex = projects.findIndex((p: IStudentProject) => p.id === projectId);
    
    if (projectIndex === -1) {
      return null;
    }
    
    // Update the project
    projects[projectIndex] = {
      ...projects[projectIndex],
      verificationStatus: status,
      verifiedBy: teacherId,
      verificationDate: new Date().toISOString(),
      feedback: feedback || projects[projectIndex].feedback
    };
    
    // Save back to localStorage
    localStorage.setItem(storageKey, JSON.stringify(projects));
    
    return projects[projectIndex];
  } catch (error) {
    console.error('Error updating project verification:', error);
    return null;
  }
};

// Get all pending projects for verification
export const getPendingProjects = async (): Promise<IStudentProject[]> => {
  try {
    // Get all users
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const students = users.filter((user: any) => user.role === 'student');
    
    // Collect all pending projects
    let pendingProjects: IStudentProject[] = [];
    
    for (const student of students) {
      if (!student.usn) continue;
      
      const normalizedUSN = normalizeUSN(student.usn);
      const storageKey = getStudentProjectStorageKey(normalizedUSN);
      const projectsJson = localStorage.getItem(storageKey);
      
      if (projectsJson) {
        const projects: IStudentProject[] = JSON.parse(projectsJson);
        const studentPendingProjects = projects.filter(p => p.verificationStatus === 'pending');
        
        // Add student information to each project
        studentPendingProjects.forEach(project => {
          project.studentName = student.name;
        });
        
        pendingProjects = [...pendingProjects, ...studentPendingProjects];
      }
    }
    
    return pendingProjects;
  } catch (error) {
    console.error('Error getting pending projects:', error);
    return [];
  }
};
