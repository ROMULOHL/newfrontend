import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";

// Definindo a tipagem para os dados
interface FinancialData {
  name: string;
  receitas: number;
  despesas: number;
}

const financialData: FinancialData[] = [
  { name: "Jan", receitas: 12500, despesas: 10200 },
  { name: "Fev", receitas: 13200, despesas: 11000 },
  { name: "Mar", receitas: 14800, despesas: 12300 },
  { name: "Abr", receitas: 15350, despesas: 10630 },
  { name: "Mai", receitas: 16100, despesas: 11400 },
  { name: "Jun", receitas: 14700, despesas: 12500 },
];

// Tipagem para o payload do Tooltip
interface CustomTooltipProps extends TooltipProps<number, string> {}

const FinancialChart = () => {
  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border shadow-md rounded-md">
          <p className="text-sm font-medium">{payload[0].payload.name}</p>
          <p className="text-xs text-church-income">
            Receitas: R$ {payload[0].value?.toLocaleString()}
          </p>
          <p className="text-xs text-church-expense">
            Despesas: R$ {payload[1].value?.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={financialData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="receitas" fill="#10B981" name="Receitas" radius={[4, 4, 0, 0]} />
          <Bar dataKey="despesas" fill="#EF4444" name="Despesas" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FinancialChart;