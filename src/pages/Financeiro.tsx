import React, { useState, useEffect, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { CardChurch, CardContent, CardHeader, CardTitle } from "@/components/ui/card-church";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/StatCard";
import { PlusCircle, MinusCircle, Download, DollarSign, Calendar, Edit, Eye, Trash2 } from "lucide-react"; // Adicionado Edit, Eye, Trash2
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFinancialData, Transacao, Entrada, Saida, TipoEntrada, FormaPagamento, TipoSaida } from "../contexts/FinancialContext"; // Ajuste o caminho se necessário
import { useData } from "@/contexts/DataContext"; // Para buscar nomes de membros
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Para dropdowns
import { useToast } from "@/components/ui/use-toast";
import { Timestamp } from "firebase/firestore";

// Helper para formatar moeda
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
};

// Helper para formatar data (dd/MM/yyyy)
const formatDate = (date: Date | Timestamp | undefined): string => {
  if (!date) return "-";
  const d = date instanceof Timestamp ? date.toDate() : date;
  return new Intl.DateTimeFormat("pt-BR").format(d);
};

// Componente Financeiro Principal
const Financeiro: React.FC = () => {
  const { 
    transacoes,
    saldos,
    loadingTransacoes,
    loadingSaldos,
    addEntrada,
    addSaida,
    getTransacoesPorMes,
    calcularSaldos: calcularSaldosDoContexto // Renomeado para evitar conflito
  } = useFinancialData();
  const { membros, loading: loadingMembros } = useData(); // Para buscar nomes de membros para dízimos
  const { toast } = useToast();

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const [filteredTransacoes, setFilteredTransacoes] = useState<Transacao[]>([]);
  const [currentSaldos, setCurrentSaldos] = useState(saldos); // Inicializa com os saldos gerais

  // Efeito para filtrar transações e calcular saldos quando o mês/ano ou transações gerais mudam
  useEffect(() => {
    const loadDataForMonth = async () => {
      // Filtra as transações do array geral 'transacoes' para o mês e ano selecionados
      const transacoesDoMes = transacoes.filter(t => {
        const dataTransacao = t.data instanceof Timestamp ? t.data.toDate() : t.data;
        return dataTransacao.getFullYear() === currentYear && dataTransacao.getMonth() + 1 === currentMonth;
      });
      setFilteredTransacoes(transacoesDoMes);
      
      // Calcula os saldos para o mês selecionado usando todas as transações para o saldo total
      const novosSaldos = calcularSaldosDoContexto(transacoesDoMes, transacoes);
      setCurrentSaldos(novosSaldos);
    };

    if (!loadingTransacoes) {
        loadDataForMonth();
    }
  }, [currentMonth, currentYear, transacoes, calcularSaldosDoContexto, loadingTransacoes]);

  // Dialogs para adicionar/editar transações
  const [isEntradaDialogOpen, setIsEntradaDialogOpen] = useState(false);
  const [isSaidaDialogOpen, setIsSaidaDialogOpen] = useState(false);
  // const [editingTransacao, setEditingTransacao] = useState<Transacao | null>(null); // Para edição futura

  // Estados para o formulário de Nova Entrada
  const [tipoEntrada, setTipoEntrada] = useState<TipoEntrada>("Oferta");
  const [valorEntrada, setValorEntrada] = useState<string>("");
  const [dataEntrada, setDataEntrada] = useState<string>(new Date().toISOString().split("T")[0]);
  const [descricaoEntrada, setDescricaoEntrada] = useState("");
  const [membroDizimo, setMembroDizimo] = useState<string | undefined>(undefined);
  const [formaPagamentoEntrada, setFormaPagamentoEntrada] = useState<FormaPagamento>("dinheiro");

  // Estados para o formulário de Nova Saída
  const [categoriaSaida, setCategoriaSaida] = useState<TipoSaida>("Outra Saída");
  const [valorSaida, setValorSaida] = useState<string>("");
  const [dataSaida, setDataSaida] = useState<string>(new Date().toISOString().split("T")[0]);
  const [descricaoSaida, setDescricaoSaida] = useState("");
  const [categoriaPrincipalSaida, setCategoriaPrincipalSaida] = useState<string | undefined>(undefined);

  const resetEntradaForm = () => {
    setTipoEntrada("Oferta");
    setValorEntrada("");
    setDataEntrada(new Date().toISOString().split("T")[0]);
    setDescricaoEntrada("");
    setMembroDizimo(undefined);
    setFormaPagamentoEntrada("dinheiro");
  };

  const resetSaidaForm = () => {
    setCategoriaSaida("Outra Saída");
    setValorSaida("");
    setDataSaida(new Date().toISOString().split("T")[0]);
    setDescricaoSaida("");
    setCategoriaPrincipalSaida(undefined);
  };

  const handleAddEntrada = async () => {
    if (!valorEntrada || isNaN(parseFloat(valorEntrada)) || !dataEntrada) {
      toast({ title: "Erro", description: "Valor e Data são obrigatórios.", variant: "destructive" });
      return;
    }
    const tiposEntradaNominal = ["Dizimo", "Campanha", "Doacao"]; // Adicione outros tipos se necessário
    if (tiposEntradaNominal.includes(tipoEntrada) && !membroDizimo) {
        toast({ title: "Erro", description: `Selecione o membro para ${tipoEntrada}.`, variant: "destructive" });
        return;
    }

    try {
      const entradaPayload: Omit<Entrada, "id" | "igrejaId" | "tipo" | "pago" | "dataCadastro" | "ultimaAtualizacao"> = {
        categoria: tipoEntrada,
        valor: parseFloat(valorEntrada),
        data: new Date(dataEntrada + "T00:00:00"), // Adiciona hora para evitar problemas de fuso
        descricao: descricaoEntrada,
        membroId: tiposEntradaNominal.includes(tipoEntrada) && membroDizimo ? membroDizimo : null,
        membroNome: tiposEntradaNominal.includes(tipoEntrada) && membroDizimo ? membros.find(m => m.id === membroDizimo)?.nome : null,
        formaPagamento: formaPagamentoEntrada,
      };
      await addEntrada(entradaPayload);
      toast({ title: "Sucesso", description: "Entrada adicionada com sucesso!" });
      setIsEntradaDialogOpen(false);
      resetEntradaForm();
    } catch (error) {
      console.error("Erro ao adicionar entrada:", error);
      toast({ title: "Erro", description: "Não foi possível adicionar a entrada.", variant: "destructive" });
    }
  };
  
  // Lista de categorias de saída (simplificada, idealmente viria do context ou config)
  const categoriasDeSaida: Array<{ principal: string; subcategorias: TipoSaida[] }> = [
    // ... (Estrutura de categorias do pasted_content.txt deve ser mapeada aqui)
    // Exemplo:
    { 
      principal: "Despesas Operacionais e Administrativas", 
      subcategorias: [
        "Aluguel do Templo/Salão", "Contas de Consumo - Água", "Contas de Consumo - Luz", 
        "Contas de Consumo - Gás", "Contas de Consumo - Internet", "Contas de Consumo - Telefone",
        "Materiais de Escritório e Papelaria", "Software e Assinaturas", 
        "Serviços de Contabilidade e Advocacia", "Seguros", "Manutenção e Reparos Prediais",
        "Limpeza e Conservação", "Segurança", "Transporte e Deslocamento", "Taxas e Impostos"
      ]
    },
    {
      principal: "Despesas com Pessoal e Liderança",
      subcategorias: [
        "Salário Pastoral (Prebenda, Côngrua)", "Ajudas de Custo para Pastores e Líderes",
        "Salários de Funcionários", "Encargos Sociais e Trabalhistas", "Benefícios",
        "Treinamento e Desenvolvimento de Líderes e Voluntários", 
        "Despesas com Viagens Missionárias e Ministeriais de Líderes"
      ]
    },
    // Adicionar todas as outras categorias principais e suas subcategorias aqui
    { principal: "Outras Despesas", subcategorias: ["Outra Saída"] }
  ];

  const handleAddSaida = async () => {
    if (!valorSaida || isNaN(parseFloat(valorSaida)) || !dataSaida || !categoriaSaida) {
      toast({ title: "Erro", description: "Categoria, Valor e Data são obrigatórios.", variant: "destructive" });
      return;
    }
    try {
      const saidaPayload: Omit<Saida, "id" | "igrejaId" | "tipo" | "pago" | "dataCadastro" | "ultimaAtualizacao"> = {
        categoria: categoriaSaida,
        valor: parseFloat(valorSaida),
        data: new Date(dataSaida + "T00:00:00"),
        descricao: descricaoSaida,
        categoriaPrincipal: categoriaPrincipalSaida, // Adicionar lógica para pegar a categoria principal
        subCategoria: categoriaSaida, // Pode ser a mesma que a categoria por enquanto
      };
      await addSaida(saidaPayload);
      toast({ title: "Sucesso", description: "Saída adicionada com sucesso!" });
      setIsSaidaDialogOpen(false);
      resetSaidaForm();
    } catch (error) {
      console.error("Erro ao adicionar saída:", error);
      toast({ title: "Erro", description: "Não foi possível adicionar a saída.", variant: "destructive" });
    }
  };

  const meses = [
    { valor: 1, nome: "Janeiro" }, { valor: 2, nome: "Fevereiro" }, { valor: 3, nome: "Março" },
    { valor: 4, nome: "Abril" }, { valor: 5, nome: "Maio" }, { valor: 6, nome: "Junho" },
    { valor: 7, nome: "Julho" }, { valor: 8, nome: "Agosto" }, { valor: 9, nome: "Setembro" },
    { valor: 10, nome: "Outubro" }, { valor: 11, nome: "Novembro" }, { valor: 12, nome: "Dezembro" },
  ];

  const anos = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i); // Últimos 5 anos + próximos 4

  if (loadingTransacoes || loadingSaldos || loadingMembros) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-screen">
          <p>Carregando dados financeiros...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-church-text">Financeiro</h1>
        <div className="flex gap-2">
          <Button 
            className="bg-church-income hover:bg-church-income/90 flex items-center gap-2"
            onClick={() => { resetEntradaForm(); setIsEntradaDialogOpen(true); }}
          >
            <PlusCircle size={18} />
            <span>Nova Entrada</span>
          </Button>
          <Button 
            className="bg-church-expense hover:bg-church-expense/90 flex items-center gap-2"
            onClick={() => { resetSaidaForm(); setIsSaidaDialogOpen(true); }}
          >
            <MinusCircle size={18} />
            <span>Nova Saída</span>
          </Button>
          {/* <Button variant="outline" className="flex items-center gap-2">
            <Download size={18} />
            <span>Exportar</span>
          </Button> */}
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Entradas do Mês"
          value={formatCurrency(currentSaldos.entradasMes)}
          icon={<PlusCircle size={24} className="text-church-income" />}
          description={`${meses.find(m => m.valor === currentMonth)?.nome} ${currentYear}`}
          trend="up"
          trendValue="8%" // Lógica de tendência a ser implementada
          className="border-l-4 border-church-income"
        />
        <StatCard
          title="Saídas do Mês"
          value={formatCurrency(currentSaldos.saidasMes)}
          icon={<MinusCircle size={24} className="text-church-expense" />}
          description={`${meses.find(m => m.valor === currentMonth)?.nome} ${currentYear}`}
          trend="down"
          trendValue="5%"
          className="border-l-4 border-church-expense"
        />
        <StatCard
          title="Saldo do Mês"
          value={formatCurrency(currentSaldos.saldoMes)}
          icon={<DollarSign size={24} />}
          description={`${meses.find(m => m.valor === currentMonth)?.nome} ${currentYear}`}
          trend="up"
          trendValue="15%"
        />
        <StatCard
          title="Saldo Total"
          value={formatCurrency(currentSaldos.saldoTotal)}
          icon={<DollarSign size={24} />}
          description="Atualizado em tempo real"
          trend="up"
          trendValue="7%"
        />
      </div>

      {/* Resumo Financeiro e Distribuição */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <CardChurch className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center w-full">
              <CardTitle>Resumo Financeiro</CardTitle>
              <div className="flex gap-2">
                <Select value={currentMonth.toString()} onValueChange={(value) => setCurrentMonth(parseInt(value))}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {meses.map(mes => <SelectItem key={mes.valor} value={mes.valor.toString()}>{mes.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={currentYear.toString()} onValueChange={(value) => setCurrentYear(parseInt(value))}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Ano" />
                  </SelectTrigger>
                  <SelectContent>
                    {anos.map(ano => <SelectItem key={ano} value={ano.toString()}>{ano}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
            <CardContent className="h-[350px] pt-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={[{
                    name: `${meses.find(m => m.valor === currentMonth)?.nome.substring(0,3)}/${currentYear.toString().substring(2)}`,
                    Entradas: currentSaldos.entradasMes,
                    Saídas: currentSaldos.saidasMes,
                    Saldo: currentSaldos.saldoMes
                  }]}
                  margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis 
                    stroke="#6b7280"
                    tickFormatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value)}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), null]}
                    cursor={{ fill: 'rgba(230, 230, 230, 0.3)' }}
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="Entradas" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={200} />
                  <Bar dataKey="Saídas" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={200} />
                  <Bar dataKey="Saldo" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={200} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
        </CardChurch>

        <CardChurch>
          <CardHeader>
            <CardTitle>Distribuição de Receitas ({meses.find(m => m.valor === currentMonth)?.nome} {currentYear})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentSaldos.distribuicaoReceitas.length > 0 ? currentSaldos.distribuicaoReceitas.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-church-text">{item.categoria}</span>
                    <span className="text-sm font-medium text-church-text">{item.percentual}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-church-income h-2.5 rounded-full" style={{ width: `${item.percentual}%` }}></div>
                  </div>
                </div>
              )) : <p className="text-sm text-gray-500">Nenhuma entrada neste mês para exibir distribuição.</p>}
            </div>
          </CardContent>
        </CardChurch>
      </div>

      {/* Abas de Entradas e Saídas Recentes */}
      <Tabs defaultValue="entradas" className="w-full mb-6">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="entradas" className="data-[state=active]:bg-church-income data-[state=active]:text-white">Entradas</TabsTrigger>
          <TabsTrigger value="saidas" className="data-[state=active]:bg-church-expense data-[state=active]:text-white">Saídas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="entradas">
          <CardChurch>
            <CardHeader>
              <CardTitle>Entradas de {meses.find(m => m.valor === currentMonth)?.nome} {currentYear}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  {/* ... Cabeçalho da tabela de entradas ... */}
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                      <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                      <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Membro</th>
                      <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Forma Pgto.</th>
                      <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                      <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                      {/* <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th> */}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredTransacoes.filter(t => t.tipo === 'entrada').map((transacao) => {
                      const entrada = transacao as Entrada;
                      return (
                        <tr key={entrada.id} className="hover:bg-gray-50">
                          <td className="p-3 text-sm whitespace-nowrap">
                            <span className="inline-flex rounded-full px-2 py-1 text-xs font-semibold bg-green-100 text-green-800">
                              {entrada.categoria}
                            </span>
                          </td>
                          <td className="p-3 text-sm whitespace-nowrap">{entrada.descricao || "-"}</td>
                          <td className="p-3 text-sm whitespace-nowrap">{entrada.membroNome || "-"}</td>
                          <td className="p-3 text-sm whitespace-nowrap capitalize">{entrada.formaPagamento || "-"}</td>
                          <td className="p-3 text-sm whitespace-nowrap font-medium text-church-income">{formatCurrency(entrada.valor)}</td>
                          <td className="p-3 text-sm whitespace-nowrap">{formatDate(entrada.data)}</td>
                          {/* Ações (editar/visualizar) podem ser adicionadas depois */}
                        </tr>
                      );
                    })}
                    {filteredTransacoes.filter(t => t.tipo === 'entrada').length === 0 && (
                        <tr><td colSpan={6} className="p-4 text-center text-gray-500">Nenhuma entrada registrada para este mês.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </CardChurch>
        </TabsContent>
        
        <TabsContent value="saidas">
          <CardChurch>
            <CardHeader>
              <CardTitle>Saídas de {meses.find(m => m.valor === currentMonth)?.nome} {currentYear}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  {/* ... Cabeçalho da tabela de saídas ... */}
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                      <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                      <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                      <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                      {/* <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th> */}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredTransacoes.filter(t => t.tipo === 'saida').map((transacao) => {
                      const saida = transacao as Saida;
                      return (
                        <tr key={saida.id} className="hover:bg-gray-50">
                          <td className="p-3 text-sm whitespace-nowrap">
                            <span className="inline-flex rounded-full px-2 py-1 text-xs font-semibold bg-red-100 text-red-800">
                              {saida.categoria}
                            </span>
                          </td>
                          <td className="p-3 text-sm whitespace-nowrap">{saida.descricao || "-"}</td>
                          <td className="p-3 text-sm whitespace-nowrap font-medium text-church-expense">{formatCurrency(saida.valor)}</td>
                          <td className="p-3 text-sm whitespace-nowrap">{formatDate(saida.data)}</td>
                          {/* Ações */}
                        </tr>
                      );
                    })}
                     {filteredTransacoes.filter(t => t.tipo === 'saida').length === 0 && (
                        <tr><td colSpan={4} className="p-4 text-center text-gray-500">Nenhuma saída registrada para este mês.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </CardChurch>
        </TabsContent>
      </Tabs>

      {/* Dialog Nova Entrada */}
      <Dialog open={isEntradaDialogOpen} onOpenChange={setIsEntradaDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Nova Entrada</DialogTitle>
            <DialogDescription>Registre uma nova entrada financeira.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tipo-entrada" className="text-right">Tipo</Label>
              <Select value={tipoEntrada} onValueChange={(value) => setTipoEntrada(value as TipoEntrada)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dizimo">Dízimo</SelectItem>
                  <SelectItem value="Oferta">Oferta</SelectItem>
                  <SelectItem value="Campanha">Campanha</SelectItem>
                  <SelectItem value="Doacao">Doação</SelectItem>
                  <SelectItem value="Outra Entrada">Outra Entrada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {tipoEntrada === "Dizimo" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="membro-dizimo" className="text-right">Membro</Label>
                <Select value={membroDizimo} onValueChange={setMembroDizimo}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione o membro" />
                  </SelectTrigger>
                  <SelectContent>
                    {membros.map(m => <SelectItem key={m.id} value={m.id!}>{m.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="valor-entrada" className="text-right">Valor (R$)</Label>
              <Input id="valor-entrada" type="number" value={valorEntrada} onChange={e => setValorEntrada(e.target.value)} className="col-span-3" placeholder="0.00" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="data-entrada" className="text-right">Data</Label>
              <Input id="data-entrada" type="date" value={dataEntrada} onChange={e => setDataEntrada(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="forma-pagamento-entrada" className="text-right">Forma Pgto.</Label>
              <Select value={formaPagamentoEntrada} onValueChange={(value) => setFormaPagamentoEntrada(value as FormaPagamento)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Forma de Pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="cartao">Cartão</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="transferencia">Transferência</SelectItem>
                  <SelectItem value="boleto">Boleto</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="descricao-entrada" className="text-right">Descrição</Label>
              <Input id="descricao-entrada" value={descricaoEntrada} onChange={e => setDescricaoEntrada(e.target.value)} className="col-span-3" placeholder="Opcional" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEntradaDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddEntrada} className="bg-church-income hover:bg-church-income/90">Salvar Entrada</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Nova Saída */}
      <Dialog open={isSaidaDialogOpen} onOpenChange={setIsSaidaDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Nova Saída</DialogTitle>
            <DialogDescription>Registre uma nova saída financeira.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="categoria-saida-principal" className="text-right">Cat. Principal</Label>
                <Select 
                    onValueChange={(value) => {
                        setCategoriaPrincipalSaida(value);
                        // Ao mudar a categoria principal, reseta a subcategoria (TipoSaida)
                        // e seleciona a primeira subcategoria da nova principal, se houver.
                        const principal = categoriasDeSaida.find(cat => cat.principal === value);
                        if (principal && principal.subcategorias.length > 0) {
                            setCategoriaSaida(principal.subcategorias[0]);
                        } else {
                            setCategoriaSaida("Outra Saída"); // Fallback
                        }
                    }}
                    value={categoriaPrincipalSaida}
                >
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Selecione a Categoria Principal" />
                    </SelectTrigger>
                    <SelectContent>
                        {categoriasDeSaida.map(cat => (
                            <SelectItem key={cat.principal} value={cat.principal}>{cat.principal}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            {categoriaPrincipalSaida && (
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="categoria-saida-sub" className="text-right">Subcategoria</Label>
                    <Select value={categoriaSaida} onValueChange={(value) => setCategoriaSaida(value as TipoSaida)}>
                        <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Selecione a Subcategoria" />
                        </SelectTrigger>
                        <SelectContent>
                        {(categoriasDeSaida.find(cat => cat.principal === categoriaPrincipalSaida)?.subcategorias || []).map(sub => (
                            <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="valor-saida" className="text-right">Valor (R$)</Label>
              <Input id="valor-saida" type="number" value={valorSaida} onChange={e => setValorSaida(e.target.value)} className="col-span-3" placeholder="0.00" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="data-saida" className="text-right">Data</Label>
              <Input id="data-saida" type="date" value={dataSaida} onChange={e => setDataSaida(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="descricao-saida" className="text-right">Descrição</Label>
              <Input id="descricao-saida" value={descricaoSaida} onChange={e => setDescricaoSaida(e.target.value)} className="col-span-3" placeholder="Opcional" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaidaDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddSaida} className="bg-church-expense hover:bg-church-expense/90">Salvar Saída</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </DashboardLayout>
  );
};

export default Financeiro;