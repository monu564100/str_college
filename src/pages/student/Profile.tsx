
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProfileForm from '@/components/student/ProfileForm';

const StudentProfile = () => {
  return (
    <DashboardLayout userRole="student" pageTitle="Student Profile">
      <ProfileForm />
    </DashboardLayout>
  );
};

export default StudentProfile;
