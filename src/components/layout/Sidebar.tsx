import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Users, DollarSign, FileText, Settings, Menu, X, LayoutDashboard } from "lucide-react";

type NavItemProps = {
  to: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick?: () => void;
};

const NavItem = ({ to, icon: Icon, label, isActive, onClick }: NavItemProps) => {
  return (
    <Link to={to} onClick={onClick}>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-2 px-3 py-6 text-left h-auto",
          isActive
            ? "bg-church-text text-white hover:bg-church-text/90 hover:text-white"
            : "text-church-text hover:bg-gray-100"
        )}
      >
        <Icon size={20} />
        <span className="font-medium">{label}</span>
      </Button>
    </Link>
  );
};

export const Sidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const navItems = [
    {
      to: "/",
      icon: LayoutDashboard,
      label: "Painel de Controle",
    },
    {
      to: "/membros",
      icon: Users,
      label: "Cadastro de Membros",
    },
    {
      to: "/financeiro",
      icon: DollarSign,
      label: "Financeiro",
    },
    {
      to: "/relatorios",
      icon: FileText,
      label: "Relatórios",
    },
    {
      to: "/secretaria",
      icon: Settings,
      label: "Painel Secretaria",
    },
  ];

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300 shadow-md",
        isCollapsed ? "w-[70px]" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <h2 className="text-xl font-bold text-church-button">CHURCH Assistent</h2>
        )}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="text-church-text hover:bg-gray-100"
          >
            {isCollapsed ? <Menu size={20} /> : <X size={20} />}
          </Button>
        </div>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => (
          <NavItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={isCollapsed ? "" : item.label}
            isActive={location.pathname === item.to}
            onClick={isCollapsed ? toggleSidebar : undefined}
          />
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        {!isCollapsed && (
          <p className="text-xs text-gray-500 text-center">
            Sistema de Gestão - Church Academy © 2025
          </p>
        )}
      </div>
    </div>
  );
};