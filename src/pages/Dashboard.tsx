import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { CardChurch, CardContent, CardHeader, CardTitle } from "@/components/ui/card-church";
import { StatCard } from "@/components/dashboard/StatCard";
import { Users, DollarSign, FileText, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { useData } from "@/contexts/DataContext";

const COLORS = ["#2563EB", "#D946EF"];

const Dashboard: React.FC = () => {
  const { membros, dizimos, transacoes, loading } = useData();

  console.log("Membros:", membros);
  console.log("Dízimos:", dizimos);
  console.log("Transações:", transacoes);

  // Calcular total de membros
  const totalMembros = membros.length;

  // Calcular dízimos do mês (Maio 2025) a partir de transacoes
  const dizimosMes = transacoes
    .filter((transacao: any) => {
      const data = transacao.data instanceof Date ? transacao.data : (transacao.data && transacao.data.toDate ? transacao.data.toDate() : new Date(transacao.data));
      return transacao.categoria === "Dízimo" && data.getMonth() === 4 && data.getFullYear() === 2025;
    })
    .reduce((total: number, transacao: any) => total + (Number(transacao.valor) || 0), 0);

  // Calcular ofertas do mês (Maio 2025) a partir de transacoes
  const ofertasMes = transacoes
    .filter((transacao: any) => {
      const data = transacao.data instanceof Date ? transacao.data : (transacao.data && transacao.data.toDate ? transacao.data.toDate() : new Date(transacao.data));
      return transacao.categoria === "Oferta" && data.getMonth() === 4 && data.getFullYear() === 2025;
    })
    .reduce((total: number, transacao: any) => total + (Number(transacao.valor) || 0), 0);

  // Calcular saldo atual (entradas - saídas)
  const entradas = transacoes
    .filter((transacao: any) => transacao.tipo === "entrada")
    .reduce((total: number, transacao: any) => total + (Number(transacao.valor) || 0), 0);
  const saidas = transacoes
    .filter((transacao: any) => transacao.tipo === "saida")
    .reduce((total: number, transacao: any) => total + (Number(transacao.valor) || 0), 0);
  const saldoAtual = entradas - saidas;

  // Dados financeiros para o gráfico (agrupados por mês)
  const financialData = Array.from({ length: 6 }, (_, index) => {
    const month = new Date(2025, index, 1);
    const monthName = month.toLocaleString("pt-BR", { month: "short" });
    const receitas = transacoes
      .filter((t: any) => {
        const data = t.data instanceof Date ? t.data : (t.data && t.data.toDate ? t.data.toDate() : new Date(t.data));
        return t.tipo === "entrada" && data.getMonth() === index && data.getFullYear() === 2025;
      })
      .reduce((sum: number, t: any) => sum + (Number(t.valor) || 0), 0);
    const despesas = transacoes
      .filter((t: any) => {
        const data = t.data instanceof Date ? t.data : (t.data && t.data.toDate ? t.data.toDate() : new Date(t.data));
        return t.tipo === "saida" && data.getMonth() === index && data.getFullYear() === 2025;
      })
      .reduce((sum: number, t: any) => sum + (Number(t.valor) || 0), 0);
    return { name: monthName, receitas, despesas };
  });

  // Dados de distribuição de gênero
  const membersData = [
    { name: "Homens", value: membros.filter((m: any) => m.genero === "Masculino").length },
    { name: "Mulheres", value: membros.filter((m: any) => m.genero === "Feminino").length },
  ];

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando dados...</div>;
  }

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-church-button mb-6">Painel de Controle</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total de Membros"
          value={totalMembros.toString()}
          icon={<Users size={24} />}
          description="Membros ativos"
          trend="up"
          trendValue="12%"
        />
        <StatCard
          title="Dízimos do Mês"
          value={`R$ ${dizimosMes.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          icon={<DollarSign size={24} />}
          description="Maio 2025"
          trend="up"
          trendValue="8%"
          valueClass="text-church-income"
        />
        <StatCard
          title="Ofertas do Mês"
          value={`R$ ${ofertasMes.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          icon={<DollarSign size={24} />}
          description="Maio 2025"
          trend="neutral"
          trendValue="2%"
          valueClass="text-church-income"
        />
        <StatCard
          title="Saldo Atual"
          value={`R$ ${saldoAtual.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          icon={<DollarSign size={24} />}
          description="Atualizado hoje"
          trend="up"
          trendValue="15%"
          valueClass="text-church-income"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <CardChurch>
          <CardHeader>
            <CardTitle>Acesso Rápido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/membros">
                <Button className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-church-button hover:bg-church-button/90 shadow-md">
                  <Users size={24} />
                  <span>Cadastro de Membros</span>
                </Button>
              </Link>
              <Link to="/financeiro">
                <Button className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-church-button hover:bg-church-button/90 shadow-md">
                  <DollarSign size={24} />
                  <span>Financeiro</span>
                </Button>
              </Link>
              <Link to="/relatorios">
                <Button className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-church-button hover:bg-church-button/90 shadow-md">
                  <FileText size={24} />
                  <span>Relatórios</span>
                </Button>
              </Link>
              <Link to="/secretaria">
                <Button className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-church-button hover:bg-church-button/90 shadow-md">
                  <Settings size={24} />
                  <span>Painel Secretaria</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </CardChurch>
        
        <CardChurch>
          <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                <p className="text-sm font-medium text-church-text">Culto de Celebração</p>
                <p className="text-xs text-gray-500">Domingo, 18 de Maio - 19:00</p>
              </div>
              <div className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                <p className="text-sm font-medium text-church-text">Reunião de Líderes</p>
                <p className="text-xs text-gray-500">Segunda, 19 de Maio - 20:00</p>
              </div>
              <div className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                <p className="text-sm font-medium text-church-text">Culto de Oração</p>
                <p className="text-xs text-gray-500">Quarta, 21 de Maio - 19:30</p>
              </div>
            </div>
          </CardContent>
        </CardChurch>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CardChurch className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Resumo Financeiro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={financialData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-3 border shadow-md rounded-md">
                            <p className="text-sm font-medium">{payload[0].payload.name}</p>
                            <p className="text-xs text-church-income">
                              Receitas: R$ {payload[0].value.toLocaleString()}
                            </p>
                            <p className="text-xs text-church-expense">
                              Despesas: R$ {payload[1].value.toLocaleString()}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Bar dataKey="receitas" fill="#10B981" name="Receitas" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="despesas" fill="#EF4444" name="Despesas" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </CardChurch>
        
        <CardChurch>
          <CardHeader>
            <CardTitle>Aniversariantes do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {membros
                .filter((m: any) => {
                  const birthDate = m.dataNascimento instanceof Date ? m.dataNascimento : new Date(m.dataNascimento);
                  return birthDate.getMonth() === 4; // Mês de Maio
                })
                .slice(0, 4) // Limita a 4 aniversariantes
                .map((membro: any) => (
                  <div key={membro.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-church-button flex items-center justify-center text-white font-medium shadow-sm">
                      {membro.nome?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-church-text">{membro.nome}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(membro.dataNascimento).toLocaleString("pt-BR", { day: "2-digit", month: "long" })}
                      </p>
                    </div>
                  </div>
                ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <h4 className="text-sm font-medium text-church-text mb-3">Distribuição de Gênero</h4>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={membersData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      fill="#8884d8"
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {membersData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </CardChurch>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;