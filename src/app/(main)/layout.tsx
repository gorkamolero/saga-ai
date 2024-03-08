import React from "react";
import Navbar from "@/components/navbar/Navbar";
import AuthComponent from "@/components/navbar/AuthComponent";

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
