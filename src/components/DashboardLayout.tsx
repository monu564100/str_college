
import React from 'react';
import MainNavbar from './MainNavbar';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: 'student' | 'teacher' | 'admin';
  pageTitle?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  userRole,
  pageTitle
}) => {
  const navigate = useNavigate();
  
  // Simple auth check
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
    } else {
      const parsedUser = JSON.parse(user);
      if (parsedUser.role !== userRole) {
        // Redirect to the appropriate dashboard
        navigate(`/${parsedUser.role}/dashboard`);
      }
    }
  }, [navigate, userRole]);
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <MainNavbar userRole={userRole} />
      <main className="flex-1 container mx-auto px-4 py-6">
        {pageTitle && (
          <h1 className="text-2xl font-semibold mb-6">{pageTitle}</h1>
        )}
        {children}
      </main>
      <footer className="bg-white border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Academic Connectivity Space. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;
