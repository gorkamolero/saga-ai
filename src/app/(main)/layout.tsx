import React from 'react';
import Navbar from '@/components/navbar/navbar';
import AuthComponent from '@/components/navbar/auth-component';

const RootLayout: React.FC<{ children: React.ReactNode }> = async ({
  children,
}) => {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background pt-16">
      <Navbar>
        <AuthComponent />
      </Navbar>
      {children}
    </div>
  );
};

export default RootLayout;
