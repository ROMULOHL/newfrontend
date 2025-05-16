import React from "react";
import {
  CardChurch,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card-church";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
  trend: "up" | "down" | "neutral";
  trendValue: string;
  valueClass?: string; // <- permite customizar a cor do valor principal
  className?: string;  // ✅ necessário para aceitar className no componente pai
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  description,
  trend,
  trendValue,
  className,
  valueClass, // também estava sendo usado no Dashboard
}) => {
  return (
    <CardChurch className={className}>
      <CardHeader>
        <div className="flex justify-between items-center w-full">
          <CardTitle>{title}</CardTitle>
          <div className="text-gray-500">{icon}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn("text-3xl font-bold", valueClass ?? "text-church-text")}>
          {value}
        </div>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}

        {trend && trendValue && (
          <div className="flex items-center mt-2">
            <span
              className={cn(
                "text-xs font-medium mr-1",
                trend === "up" && "text-church-income",
                trend === "down" && "text-church-expense",
                trend === "neutral" && "text-gray-500"
              )}
            >
              {trend === "up" && "↑"}
              {trend === "down" && "↓"}
              {trendValue}
            </span>
            <span className="text-xs text-gray-500">
              comparado ao mês anterior
            </span>
          </div>
        )}
      </CardContent>
    </CardChurch>
  );
};