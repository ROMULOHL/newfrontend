import React, { useState, useMemo, useEffect } from "react"; // Adicionado useEffect
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { CardChurch, CardContent, CardHeader, CardTitle } from "@/components/ui/card-church";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFinancialData, Transacao, Entrada, Saida, Saldos, FormaPagamento } from "@/contexts/FinancialContext"; 
// Removido useData, pois usaremos tudo do FinancialContext para consistência de tipos de transação
import { format } from 'date-fns'; 
import { ptBR } from 'date-fns/locale'; 

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

// Função auxiliar para capitalizar a primeira letra de uma string
const capitalizeFirstLetter = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

interface FinanceiroTabsProps {
  dataInicio: Date | null; 
  dataFim: Date | null;
  categoriaFiltro?: string; // Adicionada a propriedade categoriaFiltro
}

interface EntradasTabProps {
  entradas: Entrada[];
  saldosPeriodo: Saldos | null;
  categoriaFiltro?: string; // Adicionada a propriedade categoriaFiltro
}

interface SaidasTabProps {
  saidas: Saida[];
  saldosPeriodo: Saldos | null;
  categoriaFiltro?: string; // Adicionada a propriedade categoriaFiltro
}

// Interface para resumo por método de pagamento
interface ResumoPorMetodo {
  metodo: string;
  valor: number;
  percentual: number;
}

// Interface para distribuição de despesas
interface DistribuicaoDespesa {
  categoria: string;
  valor: number;
  percentual: number;
}

// Função para verificar se uma entrada é dízimo
const isDizimo = (entrada: Entrada): boolean => {
  // Verificar no campo categoria
  if (entrada.categoria) {
    const categoriaLower = entrada.categoria.toLowerCase();
    if (categoriaLower === 'dízimo' || categoriaLower === 'dizimo' || 
        categoriaLower.includes('dízimo') || categoriaLower.includes('dizimo')) {
      return true;
    }
  }
  
  // Verificar na descrição
  if (entrada.descricao) {
    const descricaoLower = entrada.descricao.toLowerCase();
    if (descricaoLower.includes('dízimo') || descricaoLower.includes('dizimo')) {
      return true;
    }
  }
  
  return false;
};

// Função para verificar se uma entrada é oferta
const isOferta = (entrada: Entrada): boolean => {
  // Verificar no campo categoria
  if (entrada.categoria) {
    const categoriaLower = entrada.categoria.toLowerCase();
    if (categoriaLower === 'oferta' || categoriaLower === 'ofertas' || 
        categoriaLower.includes('oferta') || categoriaLower === 'culto' || 
        categoriaLower.includes('culto')) {
      return true;
    }
  }
  
  // Verificar na descrição
  if (entrada.descricao) {
    const descricaoLower = entrada.descricao.toLowerCase();
    if (descricaoLower.includes('oferta') || descricaoLower.includes('culto')) {
      return true;
    }
  }
  
  return false;
};

const EntradasTab: React.FC<EntradasTabProps> = ({ entradas, saldosPeriodo, categoriaFiltro }) => {
  const [filtroMetodoPagamento, setFiltroMetodoPagamento] = useState<FormaPagamento | "todos">("todos");

  // Filtrar entradas por categoria e método de pagamento
  const entradasFiltradas = useMemo(() => {
    let filtradas = entradas;
    
    // Filtrar por categoria se especificada
    if (categoriaFiltro && categoriaFiltro !== "todas") {
      filtradas = filtradas.filter(entrada => {
        switch (categoriaFiltro) {
          case "dizimo":
            return isDizimo(entrada);
          case "oferta":
            return isOferta(entrada);
          case "campanha":
            return (entrada.descricao || "").toLowerCase().includes("campanha") || 
                   (entrada.categoria || "").toLowerCase().includes("campanha");
          case "doacao":
            return (entrada.descricao || "").toLowerCase().includes("doação") || 
                   (entrada.descricao || "").toLowerCase().includes("doacao") || 
                   (entrada.categoria || "").toLowerCase().includes("doação") || 
                   (entrada.categoria || "").toLowerCase().includes("doacao");
          case "entradas":
            return true; // Já estamos na aba de entradas
          default:
            return true;
        }
      });
    }
    
    // Filtrar por método de pagamento
    if (filtroMetodoPagamento !== "todos") {
      filtradas = filtradas.filter(e => e.formaPagamento === filtroMetodoPagamento);
    }
    
    return filtradas;
  }, [entradas, filtroMetodoPagamento, categoriaFiltro]);

  // Modificado para filtrar valores undefined/null e garantir que todos os métodos são strings válidas
  const metodosDePagamentoUnicos = useMemo(() => {
    const metodos = new Set<string>();
    entradas.forEach(e => {
      if (e.formaPagamento) {
        metodos.add(e.formaPagamento);
      }
    });
    return Array.from(metodos).filter(Boolean);
  }, [entradas]);

  // Calcular resumo por método de pagamento
  const resumoPorMetodoPagamento = useMemo(() => {
    const resumo: ResumoPorMetodo[] = [];
    const totalEntradas = entradasFiltradas.reduce((acc, e) => acc + e.valor, 0);
    
    // Agrupar por método de pagamento
    const agrupado: Record<string, number> = {};
    
    entradasFiltradas.forEach(entrada => {
      const metodo = entrada.formaPagamento || 'Não informado';
      if (!agrupado[metodo]) {
        agrupado[metodo] = 0;
      }
      agrupado[metodo] += entrada.valor;
    });
    
    // Converter para array e calcular percentuais
    Object.entries(agrupado).forEach(([metodo, valor]) => {
      const percentual = totalEntradas > 0 ? Math.round((valor / totalEntradas) * 100) : 0;
      resumo.push({ metodo, valor, percentual });
    });
    
    // Ordenar por valor (decrescente)
    return resumo.sort((a, b) => b.valor - a.valor);
  }, [entradasFiltradas]);

  if (!saldosPeriodo) {
    return <p>Calculando resumo de entradas...</p>;
  }

  // Função para determinar a cor de fundo com base no método de pagamento
  const getMetodoBackgroundColor = (metodo: string) => {
    const metodoLower = metodo.toLowerCase();
    if (metodoLower.includes('pix')) return 'bg-blue-50';
    if (metodoLower.includes('cartão') || metodoLower.includes('cartao')) return 'bg-purple-50';
    if (metodoLower.includes('dinheiro')) return 'bg-amber-50';
    if (metodoLower.includes('não informado') || metodoLower.includes('nao informado')) return 'bg-gray-50';
    // Cores alternativas para outros métodos
    return ['bg-teal-50', 'bg-indigo-50', 'bg-rose-50'][Math.floor(Math.random() * 3)];
  };

  // Função para determinar a cor do texto com base no método de pagamento
  const getMetodoTextColor = (metodo: string) => {
    const metodoLower = metodo.toLowerCase();
    if (metodoLower.includes('pix')) return 'text-blue-600';
    if (metodoLower.includes('cartão') || metodoLower.includes('cartao')) return 'text-purple-600';
    if (metodoLower.includes('dinheiro')) return 'text-amber-600';
    if (metodoLower.includes('não informado') || metodoLower.includes('nao informado')) return 'text-gray-600';
    // Cores alternativas para outros métodos
    return ['text-teal-600', 'text-indigo-600', 'text-rose-600'][Math.floor(Math.random() * 3)];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Select value={filtroMetodoPagamento} onValueChange={(value) => setFiltroMetodoPagamento(value as FormaPagamento | "todos")}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por Método" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Métodos</SelectItem>
            {metodosDePagamentoUnicos.map(metodo => (
              <SelectItem key={metodo} value={metodo}>
                {capitalizeFirstLetter(metodo)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <CardChurch>
        <CardHeader>
          <CardTitle>Entradas por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="text-church-text font-medium">Tipo</TableHead>
                <TableHead className="text-church-text font-medium">Descrição</TableHead>
                <TableHead className="text-church-text font-medium">Membro</TableHead>
                <TableHead className="text-church-text font-medium">Método</TableHead>
                <TableHead className="text-church-text font-medium text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entradasFiltradas.length > 0 ? (
                entradasFiltradas.map((entrada) => (
                  <TableRow key={entrada.id ?? Math.random()}>
                    <TableCell>{entrada.categoria || "-"}</TableCell>
                    <TableCell>{entrada.descricao || "-"}</TableCell>
                    <TableCell>{entrada.membroNome || "Não nominal"}</TableCell>
                    <TableCell>{entrada.formaPagamento || "-"}</TableCell>
                    <TableCell className="text-right">{formatCurrency(entrada.valor)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">Nenhuma entrada encontrada para o período ou filtro selecionado.</TableCell>
                </TableRow>
              )}
            </TableBody>
            {entradasFiltradas.length > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={4} className="text-right font-bold">Total de Entradas (Filtrado)</TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(entradasFiltradas.reduce((acc, e) => acc + e.valor, 0))}</TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </CardContent>
      </CardChurch>

      <CardChurch>
        <CardHeader>
          <CardTitle>Resumo de Entradas por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {saldosPeriodo.distribuicaoReceitas && saldosPeriodo.distribuicaoReceitas.length > 0 ? 
              saldosPeriodo.distribuicaoReceitas.map((item, index) => {
                // Alternando cores para cada categoria
                const colors = [
                  { bg: 'bg-green-50', text: 'text-green-700', value: 'text-green-600' },
                  { bg: 'bg-blue-50', text: 'text-blue-700', value: 'text-blue-600' },
                  { bg: 'bg-amber-50', text: 'text-amber-700', value: 'text-amber-600' },
                  { bg: 'bg-purple-50', text: 'text-purple-700', value: 'text-purple-600' }
                ];
                const colorSet = colors[index % colors.length];
                
                return (
                  <div key={item.categoria || 'sem-categoria'} className={`p-4 border rounded-md ${colorSet.bg}`}>
                    <h3 className={`font-semibold ${colorSet.text}`}>{item.categoria || "Outras"}</h3>
                    <p className={`text-xl font-bold ${colorSet.value}`}>{formatCurrency(item.valor)}</p>
                    <p className="text-sm text-muted-foreground">{item.percentual}% do total</p>
                  </div>
                );
              })
              : <p>Sem dados de distribuição para o período.</p>
            }
          </div>
        </CardContent>
      </CardChurch>
      
      {/* Nova seção: Resumo por Método de Pagamento */}
      <CardChurch>
        <CardHeader>
          <CardTitle>Resumo por Método de Pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resumoPorMetodoPagamento.length > 0 ? 
              resumoPorMetodoPagamento.map((item) => {
                const bgColor = getMetodoBackgroundColor(item.metodo);
                const textColor = getMetodoTextColor(item.metodo);
                
                return (
                  <div key={item.metodo} className={`p-4 border rounded-md ${bgColor}`}>
                    <h3 className={`font-semibold ${textColor}`}>{capitalizeFirstLetter(item.metodo)}</h3>
                    <p className={`text-xl font-bold ${textColor}`}>{formatCurrency(item.valor)}</p>
                    <p className="text-sm text-muted-foreground">{item.percentual}% do total</p>
                  </div>
                );
              })
              : <p>Sem dados de métodos de pagamento para o período.</p>
            }
          </div>
        </CardContent>
      </CardChurch>
      
      <CardChurch>
        <CardHeader>
          <CardTitle>Total de Entradas no Período</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-church-income">{formatCurrency(entradasFiltradas.reduce((acc, e) => acc + e.valor, 0))}</p>
        </CardContent>
      </CardChurch>
    </div>
  );
};

const SaidasTab: React.FC<SaidasTabProps> = ({ saidas, saldosPeriodo, categoriaFiltro }) => {
  // Filtrar saídas por categoria
  const saidasFiltradas = useMemo(() => {
    if (categoriaFiltro && categoriaFiltro === "saidas") {
      return saidas; // Mostrar todas as saídas
    } else {
      return saidas; // Sem filtro adicional para saídas por enquanto
    }
  }, [saidas, categoriaFiltro]);

  // Calcular distribuição de despesas por categoria
  const distribuicaoDespesas = useMemo(() => {
    const distribuicao: DistribuicaoDespesa[] = [];
    const totalSaidas = saidasFiltradas.reduce((acc, s) => acc + s.valor, 0);
    
    // Agrupar por categoria principal
    const agrupado: Record<string, number> = {};
    
    saidasFiltradas.forEach(saida => {
      // Usar categoriaPrincipal, categoria ou "Outras Despesas" como fallback
      const categoria = saida.categoriaPrincipal || saida.categoria || "Outras Despesas";
      if (!agrupado[categoria]) {
        agrupado[categoria] = 0;
      }
      agrupado[categoria] += saida.valor;
    });
    
    // Converter para array e calcular percentuais
    Object.entries(agrupado).forEach(([categoria, valor]) => {
      const percentual = totalSaidas > 0 ? Math.round((valor / totalSaidas) * 100) : 0;
      distribuicao.push({ categoria, valor, percentual });
    });
    
    // Ordenar por valor (decrescente)
    return distribuicao.sort((a, b) => b.valor - a.valor);
  }, [saidasFiltradas]);

  if (!saldosPeriodo) {
    return <p>Calculando resumo de saídas...</p>;
  }

  const saidasAgrupadas = useMemo(() => {
    const agrupado: { [key: string]: Saida[] } = {};
    saidasFiltradas.forEach(saida => {
      // Garantir que categoriaPrincipal nunca seja undefined
      const categoriaPrincipal = saida.categoriaPrincipal || "Outras Despesas";
      if (!agrupado[categoriaPrincipal]) {
        agrupado[categoriaPrincipal] = [];
      }
      agrupado[categoriaPrincipal].push(saida);
    });
    return agrupado;
  }, [saidasFiltradas]);

  return (
    <div className="space-y-6">
      {Object.entries(saidasAgrupadas).map(([categoriaPrincipal, saidasDoGrupo]) => {
        const subtotalGrupo = saidasDoGrupo.reduce((acc, s) => acc + s.valor, 0);
        return (
          <CardChurch key={categoriaPrincipal}>
            <CardHeader>
              <CardTitle>{categoriaPrincipal}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="text-church-text font-medium">Subcategoria</TableHead>
                    <TableHead className="text-church-text font-medium">Descrição</TableHead>
                    <TableHead className="text-church-text font-medium text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {saidasDoGrupo.map((saida) => (
                    <TableRow key={saida.id ?? Math.random()}>
                      <TableCell>{saida.subCategoria || saida.categoria || "-"}</TableCell>
                      <TableCell>{saida.descricao || "-"}</TableCell>
                      <TableCell className="text-right text-church-expense">{formatCurrency(saida.valor)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={2} className="text-right font-bold">Subtotal {categoriaPrincipal}</TableCell>
                    <TableCell className="text-right font-bold text-church-expense">{formatCurrency(subtotalGrupo)}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </CardChurch>
        );
      })}
      {saidasFiltradas.length === 0 && (
         <CardChurch><CardContent><p className="text-center py-4">Nenhuma saída encontrada para o período selecionado.</p></CardContent></CardChurch>
      )}

      <CardChurch>
        <CardHeader>
          <CardTitle>Total de Saídas no Período</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-church-expense">{formatCurrency(saidasFiltradas.reduce((acc, s) => acc + s.valor, 0))}</p>
        </CardContent>
      </CardChurch>
    </div>
  );
};

export const FinanceiroTabs: React.FC<FinanceiroTabsProps> = ({ dataInicio, dataFim, categoriaFiltro = "todas" }) => {
  const { 
    transacoes: todasTransacoesDoContexto, 
    loadingTransacoes: loadingTodasTransacoes, 
    calcularSaldos 
  } = useFinancialData(); 

  const [transacoesFiltradasPeriodo, setTransacoesFiltradasPeriodo] = useState<Transacao[]>([]);
  const [saldosCalculadosPeriodo, setSaldosCalculadosPeriodo] = useState<Saldos | null>(null);
  const [loadingDadosFiltrados, setLoadingDadosFiltrados] = useState(true);
  const [activeTab, setActiveTab] = useState("entradas");

  // Calcular distribuição de despesas por categoria
  const distribuicaoDespesas = useMemo(() => {
    if (!transacoesFiltradasPeriodo) return [];
    
    const saidas = transacoesFiltradasPeriodo.filter(t => t.tipo === 'saida') as Saida[];
    const distribuicao: DistribuicaoDespesa[] = [];
    const totalSaidas = saidas.reduce((acc, s) => acc + s.valor, 0);
    
    // Agrupar por categoria principal
    const agrupado: Record<string, number> = {};
    
    saidas.forEach(saida => {
      // Usar categoriaPrincipal, categoria ou "Outras Despesas" como fallback
      const categoria = saida.categoriaPrincipal || saida.categoria || "Outras Despesas";
      if (!agrupado[categoria]) {
        agrupado[categoria] = 0;
      }
      agrupado[categoria] += saida.valor;
    });
    
    // Converter para array e calcular percentuais
    Object.entries(agrupado).forEach(([categoria, valor]) => {
      const percentual = totalSaidas > 0 ? Math.round((valor / totalSaidas) * 100) : 0;
      distribuicao.push({ categoria, valor, percentual });
    });
    
    // Ordenar por valor (decrescente)
    return distribuicao.sort((a, b) => b.valor - a.valor);
  }, [transacoesFiltradasPeriodo]);

  // Filtrar transações pelo período selecionado
  useEffect(() => {
    if (loadingTodasTransacoes) {
      setLoadingDadosFiltrados(true);
      return;
    }

    // Filtrar transações pelo período
    let transacoesFiltradas = todasTransacoesDoContexto;
    
    if (dataInicio && dataFim) {
      const dataInicioObj = new Date(dataInicio);
      dataInicioObj.setHours(0, 0, 0, 0);
      
      const dataFimObj = new Date(dataFim);
      dataFimObj.setHours(23, 59, 59, 999);
      
      transacoesFiltradas = todasTransacoesDoContexto.filter(t => {
        // Converter a data da transação para objeto Date
        let dataTransacao: Date;
        
        if (t.data instanceof Date) {
          dataTransacao = t.data;
        } else if (t.data && typeof t.data === 'object' && 'seconds' in t.data) {
          // Timestamp do Firestore
          dataTransacao = new Date((t.data as any).seconds * 1000);
        } else if (typeof t.data === 'string') {
          dataTransacao = new Date(t.data);
        } else {
          return false; // Data inválida
        }
        
        return dataTransacao >= dataInicioObj && dataTransacao <= dataFimObj;
      });
    }
    
    setTransacoesFiltradasPeriodo(transacoesFiltradas);
    
    // Calcular saldos para o período filtrado
    const saldos = calcularSaldos(transacoesFiltradas, todasTransacoesDoContexto);
    setSaldosCalculadosPeriodo(saldos);
    
    setLoadingDadosFiltrados(false);
  }, [todasTransacoesDoContexto, dataInicio, dataFim, loadingTodasTransacoes, calcularSaldos]);

  // Separar entradas e saídas
  const entradas = useMemo(() => {
    return transacoesFiltradasPeriodo.filter(t => t.tipo === "entrada") as Entrada[];
  }, [transacoesFiltradasPeriodo]);
  
  const saidas = useMemo(() => {
    return transacoesFiltradasPeriodo.filter(t => t.tipo === "saida") as Saida[];
  }, [transacoesFiltradasPeriodo]);

  if (loadingDadosFiltrados) {
    return <p className="text-center py-8">Carregando dados financeiros...</p>;
  }

  return (
    <Tabs defaultValue="entradas" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-3 mb-8">
        <TabsTrigger 
          value="entradas" 
          className="bg-blue-100 text-blue-700 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
        >
          Entradas
        </TabsTrigger>
        <TabsTrigger 
          value="saidas" 
          className="bg-red-100 text-red-700 data-[state=active]:bg-red-500 data-[state=active]:text-white"
        >
          Saídas
        </TabsTrigger>
        <TabsTrigger 
          value="resumo" 
          className="bg-green-100 text-green-700 data-[state=active]:bg-green-500 data-[state=active]:text-white"
        >
          Resumo
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="entradas">
        <EntradasTab 
          entradas={entradas} 
          saldosPeriodo={saldosCalculadosPeriodo} 
          categoriaFiltro={categoriaFiltro}
        />
      </TabsContent>
      
      <TabsContent value="saidas">
        <SaidasTab 
          saidas={saidas} 
          saldosPeriodo={saldosCalculadosPeriodo}
          categoriaFiltro={categoriaFiltro}
        />
      </TabsContent>
      
      <TabsContent value="resumo">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CardChurch>
              <CardHeader>
                <CardTitle>Resumo do Período</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg">Total de Entradas:</span>
                    <span className="text-xl font-bold text-church-income">
                      {formatCurrency(saldosCalculadosPeriodo?.entradasMes || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg">Total de Saídas:</span>
                    <span className="text-xl font-bold text-church-expense">
                      {formatCurrency(saldosCalculadosPeriodo?.saidasMes || 0)}
                    </span>
                  </div>
                  <div className="border-t pt-4 flex justify-between items-center">
                    <span className="text-lg font-bold">Saldo:</span>
                    <span className={`text-2xl font-bold ${(saldosCalculadosPeriodo?.saldoMes || 0) >= 0 ? 'text-church-income' : 'text-church-expense'}`}>
                      {formatCurrency(saldosCalculadosPeriodo?.saldoMes || 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </CardChurch>
            
            <CardChurch>
              <CardHeader>
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total de Transações:</span>
                    <span className="font-bold">{transacoesFiltradasPeriodo.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Entradas:</span>
                    <span className="font-bold">{entradas.length} ({entradas.length > 0 ? Math.round(entradas.length / transacoesFiltradasPeriodo.length * 100) : 0}%)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Saídas:</span>
                    <span className="font-bold">{saidas.length} ({saidas.length > 0 ? Math.round(saidas.length / transacoesFiltradasPeriodo.length * 100) : 0}%)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Média por Entrada:</span>
                    <span className="font-bold">{formatCurrency(entradas.length > 0 ? (saldosCalculadosPeriodo?.entradasMes || 0) / entradas.length : 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Média por Saída:</span>
                    <span className="font-bold">{formatCurrency(saidas.length > 0 ? (saldosCalculadosPeriodo?.saidasMes || 0) / saidas.length : 0)}</span>
                  </div>
                </div>
              </CardContent>
            </CardChurch>
          </div>
          
          {/* Distribuição de Receitas */}
          {saldosCalculadosPeriodo?.distribuicaoReceitas && saldosCalculadosPeriodo.distribuicaoReceitas.length > 0 && (
            <CardChurch>
              <CardHeader>
                <CardTitle>Distribuição de Receitas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {saldosCalculadosPeriodo.distribuicaoReceitas.map((item, index) => {
                    // Alternando cores para cada categoria
                    const colors = [
                      { bg: 'bg-green-50', text: 'text-green-700', value: 'text-green-600' },
                      { bg: 'bg-blue-50', text: 'text-blue-700', value: 'text-blue-600' },
                      { bg: 'bg-amber-50', text: 'text-amber-700', value: 'text-amber-600' },
                      { bg: 'bg-purple-50', text: 'text-purple-700', value: 'text-purple-600' }
                    ];
                    const colorSet = colors[index % colors.length];
                    
                    return (
                      <div key={item.categoria || 'sem-categoria'} className={`p-4 border rounded-md ${colorSet.bg}`}>
                        <h3 className={`font-semibold ${colorSet.text}`}>{item.categoria || "Outras"}</h3>
                        <p className={`text-xl font-bold ${colorSet.value}`}>{formatCurrency(item.valor)}</p>
                        <p className="text-sm text-muted-foreground">{item.percentual}% do total</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </CardChurch>
          )}
          
          {/* Distribuição de Despesas - Corrigido para usar o cálculo real de despesas */}
          {distribuicaoDespesas.length > 0 && (
            <CardChurch>
              <CardHeader>
                <CardTitle>Distribuição de Despesas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {distribuicaoDespesas.map((item, index) => {
                    // Alternando cores para cada categoria
                    const colors = [
                      { bg: 'bg-red-50', text: 'text-red-700', value: 'text-red-600' },
                      { bg: 'bg-orange-50', text: 'text-orange-700', value: 'text-orange-600' },
                      { bg: 'bg-pink-50', text: 'text-pink-700', value: 'text-pink-600' },
                      { bg: 'bg-indigo-50', text: 'text-indigo-700', value: 'text-indigo-600' }
                    ];
                    const colorSet = colors[index % colors.length];
                    
                    return (
                      <div key={item.categoria || 'sem-categoria'} className={`p-4 border rounded-md ${colorSet.bg}`}>
                        <h3 className={`font-semibold ${colorSet.text}`}>{item.categoria || "Outras"}</h3>
                        <p className={`text-xl font-bold ${colorSet.value}`}>{formatCurrency(item.valor)}</p>
                        <p className="text-sm text-muted-foreground">{item.percentual}% do total</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </CardChurch>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
};
