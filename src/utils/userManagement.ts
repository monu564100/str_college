
import { User } from './auth';

// Enhanced user type with more fields
export interface EnhancedUser extends User {
  // Basic information
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  department: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  
  // Additional fields
  usn?: string;
  phoneNumber?: string;
  address?: string;
  profileImage?: string;
  bio?: string;
  
  // Academic information
  semester?: number;
  batch?: string;
  joinDate: string;
  
  // System information
  lastLogin?: string;
  isActive: boolean;
  accountLocked: boolean;
}

// Get all users with optional filtering
export const getAllUsers = async (filters?: {
  role?: string;
  department?: string;
  verificationStatus?: string;
  isActive?: boolean;
  searchQuery?: string;
}): Promise<EnhancedUser[]> => {
  return new Promise<EnhancedUser[]>((resolve) => {
    setTimeout(() => {
      let users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Convert basic users to enhanced users with defaults
      users = users.map((user: any) => ({
        ...user,
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        profileImage: user.profileImage || '',
        bio: user.bio || '',
        lastLogin: user.lastLogin || null,
        isActive: user.isActive !== undefined ? user.isActive : true,
        accountLocked: user.accountLocked || false,
        semester: user.semester || (user.role === 'student' ? 1 : undefined),
        batch: user.batch || (user.role === 'student' ? 'Default Batch' : undefined),
      }));
      
      // Apply filters if provided
      if (filters) {
        if (filters.role) {
          users = users.filter((user: EnhancedUser) => user.role === filters.role);
        }
        
        if (filters.department) {
          users = users.filter((user: EnhancedUser) => user.department === filters.department);
        }
        
        if (filters.verificationStatus) {
          users = users.filter((user: EnhancedUser) => user.verificationStatus === filters.verificationStatus);
        }
        
        if (filters.isActive !== undefined) {
          users = users.filter((user: EnhancedUser) => user.isActive === filters.isActive);
        }
        
        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase();
          users = users.filter((user: EnhancedUser) => 
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            (user.usn && user.usn.toLowerCase().includes(query)) ||
            user.department.toLowerCase().includes(query)
          );
        }
      }
      
      resolve(users);
    }, 500);
  });
};

// Get a specific user by ID
export const getUserById = async (userId: string): Promise<EnhancedUser | null> => {
  return new Promise<EnhancedUser | null>((resolve) => {
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((u: any) => u.id === userId);
      
      if (!user) {
        resolve(null);
        return;
      }
      
      // Convert to enhanced user
      const enhancedUser: EnhancedUser = {
        ...user,
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        profileImage: user.profileImage || '',
        bio: user.bio || '',
        lastLogin: user.lastLogin || null,
        isActive: user.isActive !== undefined ? user.isActive : true,
        accountLocked: user.accountLocked || false,
        semester: user.semester || (user.role === 'student' ? 1 : undefined),
        batch: user.batch || (user.role === 'student' ? 'Default Batch' : undefined),
      };
      
      resolve(enhancedUser);
    }, 500);
  });
};

// Update user information
export const updateUser = async (userId: string, updates: Partial<EnhancedUser>): Promise<EnhancedUser | null> => {
  return new Promise<EnhancedUser | null>((resolve) => {
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex((u: User) => u.id === userId);
      
      if (userIndex === -1) {
        resolve(null);
        return;
      }
      
      // Update user
      users[userIndex] = {
        ...users[userIndex],
        ...updates
      };
      
      localStorage.setItem('users', JSON.stringify(users));
      resolve(users[userIndex] as EnhancedUser);
    }, 500);
  });
};

// Delete a user
export const deleteUser = async (userId: string): Promise<boolean> => {
  return new Promise<boolean>((resolve) => {
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex((u: User) => u.id === userId);
      
      if (userIndex === -1) {
        resolve(false);
        return;
      }
      
      // Remove user
      users.splice(userIndex, 1);
      localStorage.setItem('users', JSON.stringify(users));
      
      // Also remove their password
      const userPasswords = JSON.parse(localStorage.getItem('user_passwords') || '{}');
      if (userPasswords[userId]) {
        delete userPasswords[userId];
        localStorage.setItem('user_passwords', JSON.stringify(userPasswords));
      }
      
      resolve(true);
    }, 500);
  });
};

// Get user statistics
export const getUserStats = async (): Promise<{
  totalUsers: number;
  activeStudents: number;
  pendingStudents: number;
  activeTeachers: number;
  pendingTeachers: number;
  adminUsers: number;
}> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      const stats = {
        totalUsers: users.length,
        activeStudents: users.filter((u: User) => 
          u.role === 'student' && u.verificationStatus === 'verified'
        ).length,
        pendingStudents: users.filter((u: User) => 
          u.role === 'student' && u.verificationStatus === 'pending'
        ).length,
        activeTeachers: users.filter((u: User) => 
          u.role === 'teacher' && u.verificationStatus === 'verified'
        ).length,
        pendingTeachers: users.filter((u: User) => 
          u.role === 'teacher' && u.verificationStatus === 'pending'
        ).length,
        adminUsers: users.filter((u: User) => u.role === 'admin').length
      };
      
      resolve(stats);
    }, 500);
  });
};

// Change user role (admin only)
export const changeUserRole = async (userId: string, newRole: 'student' | 'teacher' | 'admin'): Promise<boolean> => {
  return new Promise<boolean>((resolve) => {
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex((u: User) => u.id === userId);
      
      if (userIndex === -1) {
        resolve(false);
        return;
      }
      
      // Change role
      users[userIndex].role = newRole;
      
      // If changing to admin, automatically verify
      if (newRole === 'admin') {
        users[userIndex].verificationStatus = 'verified';
      }
      
      localStorage.setItem('users', JSON.stringify(users));
      resolve(true);
    }, 500);
  });
};

// Bulk user actions
export const bulkUpdateUsers = async (
  userIds: string[], 
  updates: Partial<EnhancedUser>
): Promise<number> => {
  return new Promise<number>((resolve) => {
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      let updatedCount = 0;
      
      for (const userId of userIds) {
        const userIndex = users.findIndex((u: User) => u.id === userId);
        if (userIndex !== -1) {
          users[userIndex] = {
            ...users[userIndex],
            ...updates
          };
          updatedCount++;
        }
      }
      
      localStorage.setItem('users', JSON.stringify(users));
      resolve(updatedCount);
    }, 500);
  });
};
