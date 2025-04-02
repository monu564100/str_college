
import { toast } from 'sonner';

// User type definitions
export interface UserRegistrationData {
  name: string;
  email: string;
  password: string;
  role: string;
  department: string;
  usn?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  department: string;
  usn?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  joinDate: string;
}

// Register a new user
export const registerUser = async (userData: UserRegistrationData) => {
  return new Promise<{ user: User, token: string }>((resolve, reject) => {
    setTimeout(() => {
      try {
        // Check if user already exists
        const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const userExists = existingUsers.find((u: User) => u.email === userData.email);
        
        if (userExists) {
          reject(new Error('User with this email already exists'));
          return;
        }
        
        // If student, check if USN already exists
        if (userData.role === 'student' && userData.usn) {
          const usnExists = existingUsers.find((u: User) => u.usn === userData.usn);
          if (usnExists) {
            reject(new Error('Student with this USN already exists'));
            return;
          }
        }
        
        // Create new user
        const newUser: User = {
          id: userData.role === 'student' && userData.usn ? userData.usn : `user_${Math.random().toString(36).substr(2, 9)}`,
          name: userData.name,
          email: userData.email,
          role: userData.role as 'student' | 'teacher' | 'admin',
          department: userData.department,
          verificationStatus: 'pending',
          usn: userData.usn,
          joinDate: new Date().toISOString().split('T')[0]
        };
        
        // Store user in localStorage
        existingUsers.push(newUser);
        localStorage.setItem('users', JSON.stringify(existingUsers));
        
        // Store user's password separately (in a real app this would be hashed)
        const userPasswords = JSON.parse(localStorage.getItem('user_passwords') || '{}');
        userPasswords[newUser.id] = userData.password;
        localStorage.setItem('user_passwords', JSON.stringify(userPasswords));
        
        // Generate token
        const token = `token_${Math.random().toString(36).substr(2, 16)}`;
        
        resolve({
          user: newUser,
          token
        });
      } catch (error) {
        reject(error);
      }
    }, 500);
  });
};

// Get pending users for verification
export const getPendingUsers = async (role?: string): Promise<User[]> => {
  return new Promise<User[]>((resolve) => {
    setTimeout(() => {
      // Get stored users from localStorage
      const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Filter for pending users, optionally by role
      const pendingUsers = allUsers.filter((user: User) => {
        if (role) {
          return user.verificationStatus === 'pending' && user.role === role;
        }
        return user.verificationStatus === 'pending';
      });
      
      resolve(pendingUsers);
    }, 500);
  });
};

// Verify or reject a pending user
export const verifyUserById = async (userId: string, status: 'verified' | 'rejected') => {
  return new Promise<boolean>((resolve) => {
    setTimeout(() => {
      try {
        // Get stored users
        const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Find the user to update
        const userIndex = allUsers.findIndex((user: User) => user.id === userId);
        
        if (userIndex !== -1) {
          // Update user verification status
          allUsers[userIndex].verificationStatus = status;
          
          // Save updated users array back to localStorage
          localStorage.setItem('users', JSON.stringify(allUsers));
          console.log(`User ${userId} ${status} successfully`);
          resolve(true);
        } else {
          console.error(`User ${userId} not found`);
          resolve(false);
        }
      } catch (error) {
        console.error('Error updating user verification status:', error);
        resolve(false);
      }
    }, 500);
  });
};

// Get user counts
export const getUserCounts = async () => {
  return new Promise<{
    totalUsers: number;
    activeStudents: number;
    facultyMembers: number;
    activeCourses: number;
  }>((resolve) => {
    setTimeout(() => {
      const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
      
      const totalUsers = allUsers.length;
      const activeStudents = allUsers.filter((user: User) => 
        user.role === 'student' && user.verificationStatus === 'verified'
      ).length;
      const facultyMembers = allUsers.filter((user: User) => 
        user.role === 'teacher' && user.verificationStatus === 'verified'
      ).length;
      
      // For courses, we'll estimate based on faculty members
      const activeCourses = facultyMembers > 0 ? facultyMembers * 2 : 0;
      
      resolve({
        totalUsers,
        activeStudents,
        facultyMembers,
        activeCourses
      });
    }, 300);
  });
};

// Login user
export const loginUser = async (email: string, password: string, role: string) => {
  return new Promise<{ user: User, token: string }>((resolve, reject) => {
    setTimeout(() => {
      try {
        // For admin account only
        if (email === 'admin@example.com' && password === 'password' && role === 'admin') {
          const adminUser: User = {
            id: 'admin_1',
            name: 'Admin User',
            email: 'admin@example.com',
            role: 'admin',
            department: 'IT Administration',
            verificationStatus: 'verified',
            joinDate: '2023-01-01'
          };
          
          const token = `token_${Math.random().toString(36).substr(2, 16)}`;
          resolve({ user: adminUser, token });
          return;
        }
        
        // Check if this is a USN-based login (for students)
        const isUSN = email.match(/^[a-zA-Z0-9]+$/i) && !email.includes('@');
        
        if (isUSN) {
          // Handle USN login (for student accounts)
          const users = JSON.parse(localStorage.getItem('users') || '[]');
          const userPasswords = JSON.parse(localStorage.getItem('user_passwords') || '{}');
          
          // Find student by USN
          const student = users.find((u: any) => u.usn === email.toUpperCase() && u.role === 'student');
          
          if (student) {
            // Check if student is verified
            if (student.verificationStatus !== 'verified') {
              reject(new Error('Your account is pending approval. Please contact administrator.'));
              return;
            }
            
            // Check password
            if (userPasswords[student.id] === password) {
              // User is authenticated
              const token = `token_${Math.random().toString(36).substr(2, 16)}`;
              
              resolve({
                user: student,
                token
              });
              return;
            } else {
              reject(new Error('Invalid credentials'));
              return;
            }
          }
          
          reject(new Error('Student not found with this USN'));
          return;
        }
        
        // Handle regular email login
        if (!email || !role) {
          reject(new Error('Invalid email or role'));
          return;
        }
        
        // Check registered users
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userPasswords = JSON.parse(localStorage.getItem('user_passwords') || '{}');
        
        const user = users.find((u: any) => u.email === email && u.role === role);
        
        if (user) {
          // Check if user is verified
          if (user.verificationStatus !== 'verified') {
            reject(new Error('Your account is pending approval. Please contact administrator.'));
            return;
          }
          
          // Check password
          if (userPasswords[user.id] === password) {
            // User is authenticated
            const token = `token_${Math.random().toString(36).substr(2, 16)}`;
            
            resolve({
              user,
              token
            });
          } else {
            reject(new Error('Invalid credentials'));
          }
        } else {
          reject(new Error('Invalid credentials'));
        }
      } catch (error) {
        reject(error);
      }
    }, 500);
  });
};
