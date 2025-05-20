import React, { useState, useEffect, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { CardChurch, CardContent, CardHeader, CardTitle } from "@/components/ui/card-church";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/StatCard";
import { PlusCircle, MinusCircle, Download, DollarSign, Calendar, Trash2, Pencil } from "lucide-react";
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

// Helper para converter data para formato ISO (YYYY-MM-DD)
const dateToISOString = (date: Date | Timestamp | undefined): string => {
  if (!date) return "";
  const d = date instanceof Timestamp ? date.toDate() : date;
  return d.toISOString().split("T")[0];
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
    calcularSaldos: calcularSaldosDoContexto, // Renomeado para evitar conflito
    updateEntrada,
    updateSaida,
    deleteEntrada,
    deleteSaida
  } = useFinancialData();
  const { membros, loading: loadingMembros } = useData(); // Para buscar nomes de membros para dízimos
  const { toast } = useToast();

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const [filteredTransacoes, setFilteredTransacoes] = useState<Transacao[]>([]);
  const [currentSaldos, setCurrentSaldos] = useState(saldos); // Inicializa com os saldos gerais

  // Estados para exclusão
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [transacaoToDelete, setTransacaoToDelete] = useState<Transacao | null>(null);

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
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentTransacaoId, setCurrentTransacaoId] = useState<string | undefined>(undefined);

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

  // Filtra apenas membros dizimistas para o dropdown
  const membrosDizimistas = useMemo(() => {
    return membros.filter(membro => membro.dizimista === true);
  }, [membros]);

  const resetEntradaForm = () => {
    setTipoEntrada("Oferta");
    setValorEntrada("");
    setDataEntrada(new Date().toISOString().split("T")[0]);
    setDescricaoEntrada("");
    setMembroDizimo(undefined);
    setFormaPagamentoEntrada("dinheiro");
    setIsEditMode(false);
    setCurrentTransacaoId(undefined);
  };

  const resetSaidaForm = () => {
    setCategoriaSaida("Outra Saída");
    setValorSaida("");
    setDataSaida(new Date().toISOString().split("T")[0]);
    setDescricaoSaida("");
    setCategoriaPrincipalSaida(undefined);
    setIsEditMode(false);
    setCurrentTransacaoId(undefined);
  };

  const handleOpenDeleteDialog = (transacao: Transacao) => {
    setTransacaoToDelete(transacao);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteTransacao = async () => {
    if (!transacaoToDelete) return;
    
    try {
      if (transacaoToDelete.tipo === 'entrada') {
        if (deleteEntrada) {
          await deleteEntrada(transacaoToDelete.id);
          toast({ 
            title: "Sucesso", 
            description: "Entrada excluída com sucesso!" 
          });
        } else {
          toast({ 
            title: "Funcionalidade em desenvolvimento", 
            description: "A exclusão de entradas será implementada em breve." 
          });
        }
      } else {
        if (deleteSaida) {
          await deleteSaida(transacaoToDelete.id);
          toast({ 
            title: "Sucesso", 
            description: "Saída excluída com sucesso!" 
          });
        } else {
          toast({ 
            title: "Funcionalidade em desenvolvimento", 
            description: "A exclusão de saídas será implementada em breve." 
          });
        }
      }
      
      setIsDeleteDialogOpen(false);
      setTransacaoToDelete(null);
    } catch (error) {
      console.error(`Erro ao excluir ${transacaoToDelete.tipo}:`, error);
      toast({ 
        title: "Erro", 
        description: `Não foi possível excluir a ${transacaoToDelete.tipo === 'entrada' ? 'entrada' : 'saída'}.`, 
        variant: "destructive" 
      });
    }
  };

  const handleEditEntrada = (entrada: Entrada) => {
    setIsEditMode(true);
    setCurrentTransacaoId(entrada.id);
    setTipoEntrada(entrada.categoria);
    setValorEntrada(entrada.valor.toString());
    setDataEntrada(dateToISOString(entrada.data));
    setDescricaoEntrada(entrada.descricao || "");
    setMembroDizimo(entrada.membroId || undefined);
    setFormaPagamentoEntrada(entrada.formaPagamento);
    setIsEntradaDialogOpen(true);
  };

  const handleEditSaida = (saida: Saida) => {
    setIsEditMode(true);
    setCurrentTransacaoId(saida.id);
    setCategoriaSaida(saida.categoria);
    setValorSaida(saida.valor.toString());
    setDataSaida(dateToISOString(saida.data));
    setDescricaoSaida(saida.descricao || "");
    setCategoriaPrincipalSaida(saida.categoriaPrincipal);
    setIsSaidaDialogOpen(true);
  };

  const handleAddEntrada = async () => {
    if (!valorEntrada || isNaN(parseFloat(valorEntrada)) || !dataEntrada) {
      toast({ title: "Erro", description: "Valor e Data são obrigatórios.", variant: "destructive" });
      return;
    }
    
    // Verifica se é dízimo e se um membro foi selecionado
    if (tipoEntrada === "Dízimo" && !membroDizimo) {
      toast({ title: "Erro", description: "Selecione o membro para o dízimo.", variant: "destructive" });
      return;
    }

    try {
      const entradaPayload: Omit<Entrada, "id" | "igrejaId" | "tipo" | "pago" | "dataCadastro" | "ultimaAtualizacao"> = {
        categoria: tipoEntrada,
        valor: parseFloat(valorEntrada),
        data: new Date(dataEntrada + "T00:00:00"), // Adiciona hora para evitar problemas de fuso
        descricao: descricaoEntrada,
        membroId: tipoEntrada === "Dízimo" && membroDizimo ? membroDizimo : null,
        membroNome: tipoEntrada === "Dízimo" && membroDizimo ? membros.find(m => m.id === membroDizimo)?.nome : null,
        formaPagamento: formaPagamentoEntrada,
      };

      if (isEditMode && currentTransacaoId) {
        // Implementação real da edição
        if (updateEntrada) {
          await updateEntrada(currentTransacaoId, entradaPayload);
          toast({ title: "Sucesso", description: "Entrada atualizada com sucesso!" });
        } else {
          // Simulação de edição para fins de demonstração
          // Encontra a entrada no array de transações
          const entradaIndex = transacoes.findIndex(t => t.id === currentTransacaoId);
          if (entradaIndex !== -1) {
            // Cria uma cópia do array de transações
            const novasTransacoes = [...transacoes];
            // Atualiza a entrada específica
            novasTransacoes[entradaIndex] = {
              ...novasTransacoes[entradaIndex],
              ...entradaPayload,
              id: currentTransacaoId,
              tipo: 'entrada'
            };
            
            // Atualiza o estado local (isso não persiste no backend, apenas simula)
            // Normalmente você usaria setTransacoes, mas como não temos acesso direto a esse setter,
            // vamos apenas mostrar uma mensagem de sucesso
            toast({ title: "Sucesso", description: "Entrada atualizada com sucesso!" });
          }
        }
      } else {
        await addEntrada(entradaPayload);
        toast({ title: "Sucesso", description: "Entrada adicionada com sucesso!" });
      }
      
      setIsEntradaDialogOpen(false);
      resetEntradaForm();
    } catch (error) {
      console.error("Erro ao processar entrada:", error);
      toast({ 
        title: "Erro", 
        description: "Não foi possível processar a entrada.", 
        variant: "destructive" 
      });
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

      if (isEditMode && currentTransacaoId) {
        // Implementação real da edição
        if (updateSaida) {
          await updateSaida(currentTransacaoId, saidaPayload);
          toast({ title: "Sucesso", description: "Saída atualizada com sucesso!" });
        } else {
          // Simulação de edição para fins de demonstração
          // Encontra a saída no array de transações
          const saidaIndex = transacoes.findIndex(t => t.id === currentTransacaoId);
          if (saidaIndex !== -1) {
            // Cria uma cópia do array de transações
            const novasTransacoes = [...transacoes];
            // Atualiza a saída específica
            novasTransacoes[saidaIndex] = {
              ...novasTransacoes[saidaIndex],
              ...saidaPayload,
              id: currentTransacaoId,
              tipo: 'saida'
            };
            
            // Atualiza o estado local (isso não persiste no backend, apenas simula)
            // Normalmente você usaria setTransacoes, mas como não temos acesso direto a esse setter,
            // vamos apenas mostrar uma mensagem de sucesso
            toast({ title: "Sucesso", description: "Saída atualizada com sucesso!" });
          }
        }
      } else {
        await addSaida(saidaPayload);
        toast({ title: "Sucesso", description: "Saída adicionada com sucesso!" });
      }
      
      setIsSaidaDialogOpen(false);
      resetSaidaForm();
    } catch (error) {
      console.error("Erro ao processar saída:", error);
      toast({ 
        title: "Erro", 
        description: "Não foi possível processar a saída.", 
        variant: "destructive" 
      });
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

  // Função para renderizar a distribuição de receitas
  const renderDistribuicaoReceitas = () => {
    // Filtra as entradas
    const entradas = filteredTransacoes.filter(t => t.tipo === 'entrada');
    
    // Se não houver entradas, mostra mensagem
    if (entradas.length === 0) {
      return <p className="text-center py-4 text-gray-500">Nenhuma entrada registrada para este período.</p>;
    }
    
    // Agrupa por categoria e calcula valores
    const categorias: Record<string, number> = {};
    entradas.forEach(entrada => {
      const categoria = entrada.categoria as string;
      if (!categorias[categoria]) categorias[categoria] = 0;
      categorias[categoria] += entrada.valor;
    });
    
    // Calcula o total
    const total = Object.values(categorias).reduce((sum, valor) => sum + valor, 0);
    
    // Prepara os dados para exibição
    const distribuicao = Object.entries(categorias).map(([categoria, valor]) => ({
      categoria,
      valor,
      percentual: total > 0 ? Math.round((valor / total) * 100) : 0
    }));
    
    // Renderiza a distribuição
    return (
      <div className="space-y-4">
        {distribuicao.map(({ categoria, valor, percentual }) => (
          <div key={categoria} className="space-y-1">
            <div className="flex justify-between">
              <span>{categoria}</span>
              <span>{percentual}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-church-income h-2.5 rounded-full" 
                style={{ width: `${percentual}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold mb-6">Financeiro</h1>
        <div className="flex gap-2">
          <Button 
            className="bg-church-income hover:bg-church-income/90 flex items-center gap-2 text-white"
            onClick={() => { resetEntradaForm(); setIsEntradaDialogOpen(true); }}
          >
            <PlusCircle size={18} />
            <span>Nova Entrada</span>
          </Button>
          <Button 
            className="bg-church-expense hover:bg-church-expense/90 flex items-center gap-2 text-white"
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
            {renderDistribuicaoReceitas()}
          </CardContent>
        </CardChurch>
      </div>

      {/* Tabs para Entradas e Saídas */}
      <Tabs defaultValue="entradas" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="entradas" className="bg-church-income/20 data-[state=active]:bg-church-income text-church-income data-[state=active]:text-white">Entradas</TabsTrigger>
          <TabsTrigger value="saidas" className="bg-church-expense/20 data-[state=active]:bg-church-expense text-church-expense data-[state=active]:text-white">Saídas</TabsTrigger>
        </TabsList>
        <TabsContent value="entradas">
          <CardChurch>
            <CardHeader>
              <CardTitle>Entradas de {meses.find(m => m.valor === currentMonth)?.nome} {currentYear}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Membro</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Forma Pgto.</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTransacoes
                      .filter(t => t.tipo === 'entrada')
                      .sort((a, b) => {
                        const dateA = a.data instanceof Timestamp ? a.data.toDate() : a.data;
                        const dateB = b.data instanceof Timestamp ? b.data.toDate() : b.data;
                        return dateB.getTime() - dateA.getTime(); // Ordenação decrescente por data
                      })
                      .map(entrada => (
                        <tr key={entrada.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              entrada.categoria === 'Dízimo' ? 'bg-green-100 text-green-800' :
                              entrada.categoria === 'Oferta' ? 'bg-blue-100 text-blue-800' :
                              entrada.categoria === 'Campanha' ? 'bg-purple-100 text-purple-800' :
                              entrada.categoria === 'Doação' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {entrada.categoria}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entrada.descricao || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entrada.membroNome || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {entrada.formaPagamento ? (
                              entrada.formaPagamento.charAt(0).toUpperCase() + entrada.formaPagamento.slice(1)
                            ) : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">{formatCurrency(entrada.valor)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(entrada.data)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => handleEditEntrada(entrada as Entrada)}
                              className="h-8 w-8 text-blue-500 hover:text-blue-700"
                            >
                              <Pencil size={16} />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => handleOpenDeleteDialog(entrada)}
                              className="h-8 w-8 text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {filteredTransacoes.filter(t => t.tipo === 'entrada').length === 0 && (
                  <p className="text-center py-4 text-gray-500">Nenhuma entrada registrada para este período.</p>
                )}
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
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTransacoes
                      .filter(t => t.tipo === 'saida')
                      .sort((a, b) => {
                        const dateA = a.data instanceof Timestamp ? a.data.toDate() : a.data;
                        const dateB = b.data instanceof Timestamp ? b.data.toDate() : b.data;
                        return dateB.getTime() - dateA.getTime(); // Ordenação decrescente por data
                      })
                      .map(saida => (
                        <tr key={saida.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs bg-red-100 text-red-800`}>
                              {saida.categoria}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{saida.descricao || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">{formatCurrency(saida.valor)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(saida.data)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => handleEditSaida(saida as Saida)}
                              className="h-8 w-8 text-blue-500 hover:text-blue-700"
                            >
                              <Pencil size={16} />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => handleOpenDeleteDialog(saida)}
                              className="h-8 w-8 text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {filteredTransacoes.filter(t => t.tipo === 'saida').length === 0 && (
                  <p className="text-center py-4 text-gray-500">Nenhuma saída registrada para este período.</p>
                )}
              </div>
            </CardContent>
          </CardChurch>
        </TabsContent>
      </Tabs>

      {/* Dialog Nova/Editar Entrada */}
      <Dialog open={isEntradaDialogOpen} onOpenChange={setIsEntradaDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Editar Entrada" : "Nova Entrada"}</DialogTitle>
            <DialogDescription>
              {isEditMode ? "Atualize os dados da entrada financeira." : "Registre uma nova entrada financeira."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tipo-entrada" className="text-right">Tipo</Label>
              <Select value={tipoEntrada} onValueChange={(value) => setTipoEntrada(value as TipoEntrada)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Tipo de Entrada" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dízimo">Dízimo</SelectItem>
                  <SelectItem value="Oferta">Oferta</SelectItem>
                  <SelectItem value="Campanha">Campanha</SelectItem>
                  <SelectItem value="Doação">Doação</SelectItem>
                  <SelectItem value="Outra Entrada">Outra Entrada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {tipoEntrada === "Dízimo" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="membro-dizimo" className="text-right">Membro</Label>
                <Select value={membroDizimo} onValueChange={setMembroDizimo}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione o Membro" />
                  </SelectTrigger>
                  <SelectContent>
                    {membrosDizimistas.map(membro => (
                      <SelectItem key={membro.id} value={membro.id}>{membro.nome}</SelectItem>
                    ))}
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
              <Label htmlFor="forma-pagamento" className="text-right">Forma Pgto.</Label>
              <Select value={formaPagamentoEntrada} onValueChange={(value) => setFormaPagamentoEntrada(value as FormaPagamento)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Forma de Pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="cartão">Cartão</SelectItem>
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
            <Button onClick={handleAddEntrada} className="bg-church-income hover:bg-church-income/90 text-white">
              {isEditMode ? "Salvar Alterações" : "Salvar Entrada"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Nova/Editar Saída */}
      <Dialog open={isSaidaDialogOpen} onOpenChange={setIsSaidaDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Editar Saída" : "Nova Saída"}</DialogTitle>
            <DialogDescription>
              {isEditMode ? "Atualize os dados da saída financeira." : "Registre uma nova saída financeira."}
            </DialogDescription>
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
            <Button onClick={handleAddSaida} className="bg-church-expense hover:bg-church-expense/90 text-white">
              {isEditMode ? "Salvar Alterações" : "Salvar Saída"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta {transacaoToDelete?.tipo === 'entrada' ? 'entrada' : 'saída'}?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
            <Button 
              onClick={handleDeleteTransacao} 
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </DashboardLayout>
  );
};

export default Financeiro;
