
import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardChurchProps {
  children: ReactNode;
  className?: string;
}

export const CardChurch: React.FC<CardChurchProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        "bg-white rounded-xl shadow-lg border border-gray-100 p-6 transition-all hover:shadow-xl",
        className
      )}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardChurchProps> = ({ children, className }) => {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<CardChurchProps> = ({ children, className }) => {
  return (
    <h3 className={cn("text-lg font-semibold text-church-button", className)}>
      {children}
    </h3>
  );
};

export const CardContent: React.FC<CardChurchProps> = ({ children, className }) => {
  return <div className={cn("", className)}>{children}</div>;
};

export const CardFooter: React.FC<CardChurchProps> = ({ children, className }) => {
  return (
    <div className={cn("mt-4 pt-4 border-t border-gray-100", className)}>
      {children}
    </div>
  );
};
