import React, { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

type DashboardLayoutProps = {
  children: ReactNode;
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-church-background">
      <Sidebar />
      <main className="flex-1 p-5 overflow-y-auto">
        <div className="max-w-7xl mx-auto relative">
          <Button
            onClick={logout}
            className="absolute top-1 right-3 bg-church-expense text-white hover:bg-red-600"
          >
            Sair
          </Button>
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;