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
import { useFinancialData } from "@/contexts/FinancialContext";

// Tipagem para o payload do Tooltip
interface CustomTooltipProps extends TooltipProps<number, string> {}

const FinancialChart = () => {
  const { transacoes, calcularSaldos } = useFinancialData();
  
  // Função para converter qualquer formato de data para Date
  const toDate = (date: any): Date | null => {
    if (!date) return null;
    
    // Se já for Date, retorna
    if (date instanceof Date) return date;
    
    // Se for string, converte para Date
    if (typeof date === 'string') return new Date(date);
    
    // Se for objeto Timestamp do Firestore
    if (date && typeof date === 'object') {
      // Com método toDate()
      if (typeof date.toDate === 'function') {
        return date.toDate();
      }
      // Com seconds e nanoseconds
      if ('seconds' in date && 'nanoseconds' in date) {
        return new Date(date.seconds * 1000);
      }
    }
    
    return null;
  };
  
  // Filtra transações do mês específico
  const filtrarTransacoesMes = (mes: number) => {
    const anoAtual = new Date().getFullYear();
    
    return transacoes.filter(transacao => {
      const data = toDate(transacao.data);
      return data && data.getMonth() === mes && data.getFullYear() === anoAtual;
    });
  };
  
  // Calcula saldos financeiros para um mês específico
  const calcularSaldosFinanceirosMes = (mes: number) => {
    const transacoesMes = filtrarTransacoesMes(mes);
    
    if (transacoesMes.length === 0) {
      return { entradas: 0, saidas: 0 };
    }
    
    const saldos = calcularSaldos(transacoesMes, transacoes);
    
    return {
      entradas: saldos.entradasMes,
      saidas: saldos.saidasMes
    };
  };
  
  // Obter nome do mês abreviado
  const obterNomeMes = (mes: number) => {
    const meses = [
      "jan.", "fev.", "mar.", "abr.", "mai.", "jun.",
      "jul.", "ago.", "set.", "out.", "nov.", "dez."
    ];
    
    return meses[mes];
  };
  
  // Criar dados para todos os meses do primeiro semestre
  const data = Array.from({ length: 6 }, (_, i) => {
    const { entradas, saidas } = calcularSaldosFinanceirosMes(i);
    
    return { 
      name: obterNomeMes(i), 
      receitas: entradas, 
      despesas: saidas 
    };
  });

  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      // Só mostra o tooltip se houver valores maiores que zero
      if (payload[0].value === 0 && payload[1].value === 0) {
        return null;
      }
      
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
          data={data}
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
