// src/components/ui/StatCard.tsx
import React from "react";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
  trend: "up" | "down" | "neutral";
  trendValue: string;
  valueClass?: string; // <- adicionado aqui
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  description,
  trend,
  trendValue,
  valueClass = "",
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-lg font-semibold">{title}</div>
        <div className="text-gray-500">{icon}</div>
      </div>
      <div className={`text-2xl font-bold ${valueClass}`}>{value}</div>
      <div className="text-sm text-gray-500">{description}</div>
      <div className="text-sm">
        {trend === "up" && <span className="text-green-500">↑</span>}
        {trend === "down" && <span className="text-red-500">↓</span>}
        {trend === "neutral" && <span className="text-gray-500">→</span>}
        {trendValue}
      </div>
    </div>
  );
};

export default StatCard;
