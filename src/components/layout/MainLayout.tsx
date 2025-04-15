
import React from "react";
import Navbar from "./Navbar";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-clari-darkBg text-clari-text">
      <Navbar />
      <main className="ml-64 p-6 pt-6">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
