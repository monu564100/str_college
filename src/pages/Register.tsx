
import React from 'react';
import AuthLayout from '@/components/AuthLayout';
import RegisterForm from '@/components/RegisterForm';

const Register = () => {
  return (
    <AuthLayout 
      title="Create an Account" 
      description="Register to access the Academic Connectivity Space"
    >
      <RegisterForm />
    </AuthLayout>
  );
};

export default Register;
