import React, { useState, useEffect } from "react";
import { useData } from "@/contexts/DataContext";
import { useFinancialData } from "@/contexts/FinancialContext";
import { useAuth } from "@/contexts/AuthContext";
import { StatCard } from "@/components/dashboard/StatCard";
import FinancialChart from "@/components/dashboard/FinancialChart";
import { CardChurch, CardContent, CardHeader, CardTitle } from "@/components/ui/card-church";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Users, DollarSign, ArrowDown, ArrowUp, Cake, LogOut } from "lucide-react";
import { cn, inferirGeneroPorNome } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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

const Dashboard = () => {
  const { membros, loading: loadingMembros } = useData();
  const { transacoes, calcularSaldos, loadingTransacoes } = useFinancialData();
  const { logout } = useAuth();
  const [mesAtual] = useState(new Date().getMonth());
  const [anoAtual] = useState(new Date().getFullYear());
  
  // Normaliza o gênero para garantir consistência
  const normalizeGender = (gender: string | undefined): string => {
    if (!gender) return "";
    
    const normalized = gender.toLowerCase().trim();
    
    if (normalized === "m" || normalized === "masculino" || normalized === "homem") {
      return "masculino";
    }
    
    if (normalized === "f" || normalized === "feminino" || normalized === "mulher") {
      return "feminino";
    }
    
    return normalized;
  };
  
  // Calcula a distribuição de gênero usando a mesma lógica do MembrosTab
  const calcularDistribuicaoGenero = () => {
    if (!membros || membros.length === 0) {
      return { masculino: 0, feminino: 0, percentualMasculino: 0, percentualFeminino: 0 };
    }
    
    const total = membros.length;
    
    // Usar a função de inferência para determinar o gênero
    const masculino = membros.filter(m => {
      // Primeiro verifica se já existe o campo genero
      if (m.genero) {
        return normalizeGender(m.genero) === 'masculino';
      }
      // Se não existir, infere pelo nome
      return inferirGeneroPorNome(m.nome) === 'masculino';
    }).length;
    
    const feminino = membros.filter(m => {
      // Primeiro verifica se já existe o campo genero
      if (m.genero) {
        return normalizeGender(m.genero) === 'feminino';
      }
      // Se não existir, infere pelo nome
      return inferirGeneroPorNome(m.nome) === 'feminino';
    }).length;
    
    // Casos não detectados (se houver)
    const naoDetectados = total - masculino - feminino;
    
    // Distribuir os não detectados proporcionalmente
    const masculinoFinal = masculino + Math.round(naoDetectados * (masculino / (masculino + feminino || 1)));
    const femininoFinal = total - masculinoFinal;
    
    return {
      masculino: masculinoFinal,
      feminino: femininoFinal,
      percentualMasculino: total > 0 ? Math.round((masculinoFinal / total) * 100) : 0,
      percentualFeminino: total > 0 ? Math.round((femininoFinal / total) * 100) : 0
    };
  };
  
  // Filtra transações do mês atual
  const filtrarTransacoesMes = () => {
    return transacoes.filter(transacao => {
      const data = toDate(transacao.data);
      return data && data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
    });
  };
  
  // Calcula saldos financeiros
  const calcularSaldosFinanceiros = () => {
    const transacoesMes = filtrarTransacoesMes();
    const saldos = calcularSaldos(transacoesMes, transacoes);
    
    return {
      entradas: saldos.entradasMes,
      saidas: saldos.saidasMes,
      saldo: saldos.saldoMes
    };
  };
  
  // Filtra aniversariantes do mês atual
  const filtrarAniversariantesMes = () => {
    return membros.filter(membro => {
      if (!membro.dataNascimento) return false;
      
      const dataNascimento = toDate(membro.dataNascimento);
      return dataNascimento && dataNascimento.getMonth() === mesAtual;
    }).sort((a, b) => {
      const dataA = toDate(a.dataNascimento);
      const dataB = toDate(b.dataNascimento);
      
      if (!dataA || !dataB) return 0;
      
      return dataA.getDate() - dataB.getDate();
    });
  };
  
  // Dados financeiros
  const { entradas, saidas, saldo } = calcularSaldosFinanceiros();
  
  // Aniversariantes
  const aniversariantes = filtrarAniversariantesMes();
  
  // Distribuição de gênero
  const distribuicaoGenero = calcularDistribuicaoGenero();
  
  // Dados para o gráfico de pizza de gênero
  const dadosGenero = [
    { name: "Homens", value: distribuicaoGenero.masculino, percentual: distribuicaoGenero.percentualMasculino },
    { name: "Mulheres", value: distribuicaoGenero.feminino, percentual: distribuicaoGenero.percentualFeminino }
  ];
  
  // Cores para o gráfico de pizza
  const COLORS = ["#4F46E5", "#D946EF"];
  
  // Formatação de valores monetários
  const formatarMoeda = (valor: number) => {
    return `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  
  // Formatação de data
const formatarData = (data: Date | null) => {
  if (!data) return "";
  
  // Usar UTC para evitar problemas de fuso horário
  const dia = String(data.getUTCDate()).padStart(2, '0');
  
  return `${dia} de ${obterNomeMes(data.getMonth())}`;
};
  
  // Obter nome do mês
  const obterNomeMes = (mes: number) => {
    const meses = [
      "janeiro", "fevereiro", "março", "abril", "maio", "junho",
      "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
    ];
    
    return meses[mes];
  };
  
  // Calcular tendência
  const calcularTendencia = (atual: number, anterior: number) => {
    if (anterior === 0) return { valor: "0%", tipo: "neutral" };
    
    const diferenca = atual - anterior;
    const percentual = Math.round((diferenca / Math.abs(anterior)) * 100);
    
    return {
      valor: `${Math.abs(percentual)}%`,
      tipo: percentual > 0 ? "up" : percentual < 0 ? "down" : "neutral"
    };
  };
  
  // Tendências simuladas (em um sistema real, seriam calculadas com dados históricos)
  const tendenciaEntradas = { valor: "8%", tipo: "up" as "up" | "down" | "neutral" };
  const tendenciaSaidas = { valor: "5%", tipo: "up" as "up" | "down" | "neutral" };
  const tendenciaSaldo = { valor: "37%", tipo: "up" as "up" | "down" | "neutral" };
  const tendenciaMembros = { valor: "12%", tipo: "up" as "up" | "down" | "neutral" };
  
  // Renderizador de label personalizado para o gráfico de pizza
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={14}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  
  if (loadingMembros || loadingTransacoes) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-4xl font-bold mb-6">Painel de Controle</h1>
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-gray-500">Carregando dados...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 relative">
      {/* Botão Sair no canto superior direito com mais espaço */}
      <div className="absolute top-4 right-4">
        <Button
          onClick={logout}
          className="bg-church-expense text-white hover:bg-red-600 flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
      
      <h1 className="text-4xl font-bold mb-6">Painel de Controle</h1>
      
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total de Membros"
          value={membros.length.toString()}
          icon={<Users className="h-5 w-5" />}
          description="Membros ativos"
          trend={tendenciaMembros.tipo}
          trendValue={tendenciaMembros.valor}
        />
        
        <StatCard
          title="Entradas do Mês"
          value={formatarMoeda(entradas)}
          icon={<ArrowUp className="h-5 w-5" />}
          description={`Maio ${anoAtual}`}
          trend={tendenciaEntradas.tipo}
          trendValue={tendenciaEntradas.valor}
          valueClass="text-church-income"
        />
        
        <StatCard
          title="Saídas do Mês"
          value={formatarMoeda(saidas)}
          icon={<ArrowDown className="h-5 w-5" />}
          description={`Maio ${anoAtual}`}
          trend={tendenciaSaidas.tipo}
          trendValue={tendenciaSaidas.valor}
          valueClass="text-church-expense"
        />
        
        <StatCard
          title="Saldo Atual"
          value={formatarMoeda(saldo)}
          icon={<DollarSign className="h-5 w-5" />}
          description="Atualizado hoje"
          trend={tendenciaSaldo.tipo}
          trendValue={tendenciaSaldo.valor}
          valueClass={saldo >= 0 ? "text-church-income" : "text-church-expense"}
        />
      </div>
      
      {/* Acesso Rápido */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
        <CardChurch className="col-span-2 md:col-span-2">
          <CardHeader>
            <CardTitle>Acesso Rápido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <a href="/membros" className="flex flex-col items-center justify-center p-13 border rounded-lg hover:bg-gray-50 transition-colors">
                <Users className="h-8 w-8 text-church-text mb-2" />
                <span className="text-sm font-medium">Cadastro de Membros</span>
              </a>
              
              <a href="/financeiro" className="flex flex-col items-center justify-center p-10 border rounded-lg hover:bg-gray-50 transition-colors">
                <DollarSign className="h-8 w-8 text-church-text mb-2" />
                <span className="text-sm font-medium">Financeiro</span>
              </a>
              
              <a href="/relatorios" className="flex flex-col items-center justify-center p-13 border rounded-lg hover:bg-gray-50 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-church-text mb-2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <span className="text-sm font-medium">Relatórios</span>
              </a>
              
              <a href="/secretaria" className="flex flex-col items-center justify-center p-10 border rounded-lg hover:bg-gray-50 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-church-text mb-2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
                <span className="text-sm font-medium">Painel Secretaria</span>
              </a>
            </div>
          </CardContent>
        </CardChurch>
        
        <CardChurch>
          <CardHeader>
            <CardTitle>Aniversariantes do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            {aniversariantes.length > 0 ? (
              <div className="space-y-4">
                {aniversariantes.map((aniversariante) => (
                  <div key={aniversariante.id} className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center mr-3">
                      <Cake className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-church-text">{aniversariante.nome}</h4>
                      <p className="text-xs text-gray-500">
                        {formatarData(toDate(aniversariante.dataNascimento))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Nenhum aniversariante este mês.</p>
            )}
            
            {/* Distribuição de Gênero */}
            <div className="mt-6">
              <CardHeader className="px-0 pt-4 pb-2">
                <CardTitle>Distribuição de Gênero</CardTitle>
              </CardHeader>
              
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dadosGenero}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      label={renderCustomizedLabel}
                    >
                      {dadosGenero.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="flex justify-center mt-2 space-x-6">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-600 mr-2"></div>
                  <span className="text-sm">Homens: {distribuicaoGenero.masculino}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                  <span className="text-sm">Mulheres: {distribuicaoGenero.feminino}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </CardChurch>
      </div>
      
      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <CardChurch className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Resumo Financeiro</CardTitle>
          </CardHeader>
          <CardContent>
            <FinancialChart />
          </CardContent>
        </CardChurch>
      </div>
    </div>
  );
};

export default Dashboard;
