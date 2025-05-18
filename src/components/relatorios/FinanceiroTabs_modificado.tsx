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
}

interface EntradasTabProps {
  entradas: Entrada[];
  saldosPeriodo: Saldos | null;
}

interface SaidasTabProps {
  saidas: Saida[];
  saldosPeriodo: Saldos | null;
}

// Interface para resumo por método de pagamento
interface ResumoPorMetodo {
  metodo: string;
  valor: number;
  percentual: number;
}

const EntradasTab: React.FC<EntradasTabProps> = ({ entradas, saldosPeriodo }) => {
  const [filtroMetodoPagamento, setFiltroMetodoPagamento] = useState<FormaPagamento | "todos">("todos");

  const entradasFiltradas = useMemo(() => {
    if (filtroMetodoPagamento === "todos") {
      return entradas;
    }
    return entradas.filter(e => e.formaPagamento === filtroMetodoPagamento);
  }, [entradas, filtroMetodoPagamento]);

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
    const totalEntradas = entradas.reduce((acc, e) => acc + e.valor, 0);
    
    // Agrupar por método de pagamento
    const agrupado: Record<string, number> = {};
    
    entradas.forEach(entrada => {
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
  }, [entradas]);

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
          <p className="text-3xl font-bold text-church-income">{formatCurrency(saldosPeriodo.entradasMes)}</p>
        </CardContent>
      </CardChurch>
    </div>
  );
};

const SaidasTab: React.FC<SaidasTabProps> = ({ saidas, saldosPeriodo }) => {
  if (!saldosPeriodo) {
    return <p>Calculando resumo de saídas...</p>;
  }

  const saidasAgrupadas = useMemo(() => {
    const agrupado: { [key: string]: Saida[] } = {};
    saidas.forEach(saida => {
      // Garantir que categoriaPrincipal nunca seja undefined
      const categoriaPrincipal = saida.categoriaPrincipal || "Outras Despesas";
      if (!agrupado[categoriaPrincipal]) {
        agrupado[categoriaPrincipal] = [];
      }
      agrupado[categoriaPrincipal].push(saida);
    });
    return agrupado;
  }, [saidas]);

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
      {saidas.length === 0 && (
         <CardChurch><CardContent><p className="text-center py-4">Nenhuma saída encontrada para o período selecionado.</p></CardContent></CardChurch>
      )}

      <CardChurch>
        <CardHeader>
          <CardTitle>Total de Saídas no Período</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-church-expense">{formatCurrency(saldosPeriodo.saidasMes)}</p>
        </CardContent>
      </CardChurch>
    </div>
  );
};

export const FinanceiroTabs: React.FC<FinanceiroTabsProps> = ({ dataInicio, dataFim }) => {
  const { 
    transacoes: todasTransacoesDoContexto, 
    loadingTransacoes: loadingTodasTransacoes, 
    calcularSaldos 
  } = useFinancialData(); 

  const [transacoesFiltradasPeriodo, setTransacoesFiltradasPeriodo] = useState<Transacao[]>([]);
  const [saldosCalculadosPeriodo, setSaldosCalculadosPeriodo] = useState<Saldos | null>(null);
  const [loadingDadosFiltrados, setLoadingDadosFiltrados] = useState<boolean>(true);

  useEffect(() => {
    if (loadingTodasTransacoes) {
      setLoadingDadosFiltrados(true);
      return;
    }
    
    setLoadingDadosFiltrados(true);
    // Garantir que todasTransacoesDoContexto é um array válido
    let transacoesParaFiltrar = Array.isArray(todasTransacoesDoContexto) ? todasTransacoesDoContexto : [];

    if (dataInicio && dataFim) {
      transacoesParaFiltrar = transacoesParaFiltrar.filter(t => {
        try {
          const dataTransacao = t.data instanceof Date ? t.data : new Date(t.data.seconds * 1000);
          return dataTransacao >= dataInicio && dataTransacao <= dataFim;
        } catch (error) {
          console.error("Erro ao processar data da transação:", error);
          return false;
        }
      });
    } else if (dataInicio) { 
      transacoesParaFiltrar = transacoesParaFiltrar.filter(t => {
        try {
          const dataTransacao = t.data instanceof Date ? t.data : new Date(t.data.seconds * 1000);
          return dataTransacao >= dataInicio;
        } catch (error) {
          console.error("Erro ao processar data da transação:", error);
          return false;
        }
      });
    } else if (dataFim) { 
      transacoesParaFiltrar = transacoesParaFiltrar.filter(t => {
        try {
          const dataTransacao = t.data instanceof Date ? t.data : new Date(t.data.seconds * 1000);
          return dataTransacao <= dataFim;
        } catch (error) {
          console.error("Erro ao processar data da transação:", error);
          return false;
        }
      });
    }

    setTransacoesFiltradasPeriodo(transacoesParaFiltrar);
    
    try {
      const saldos = calcularSaldos(transacoesParaFiltrar, todasTransacoesDoContexto);
      setSaldosCalculadosPeriodo(saldos);
    } catch (error) {
      console.error("Erro ao calcular saldos:", error);
      // Fornecer um objeto Saldos padrão em caso de erro
      setSaldosCalculadosPeriodo({
        entradasMes: 0,
        saidasMes: 0,
        saldoMes: 0,
        saldoTotal: 0,
        distribuicaoReceitas: []
      });
    }
    
    setLoadingDadosFiltrados(false);

  }, [dataInicio, dataFim, todasTransacoesDoContexto, calcularSaldos, loadingTodasTransacoes]);

  const entradasDoPeriodo = useMemo(() => {
    // Garantir que transacoesFiltradasPeriodo é um array válido e filtrar valores inválidos
    return (Array.isArray(transacoesFiltradasPeriodo) ? transacoesFiltradasPeriodo : [])
      .filter(t => t && t.tipo === "entrada") as Entrada[];
  }, [transacoesFiltradasPeriodo]);

  const saidasDoPeriodo = useMemo(() => {
    // Garantir que transacoesFiltradasPeriodo é um array válido e filtrar valores inválidos
    return (Array.isArray(transacoesFiltradasPeriodo) ? transacoesFiltradasPeriodo : [])
      .filter(t => t && t.tipo === "saida") as Saida[];
  }, [transacoesFiltradasPeriodo]);

  if (loadingDadosFiltrados || loadingTodasTransacoes) { // Adicionado loadingTodasTransacoes aqui também
    return <p className="text-center py-10">Carregando dados financeiros...</p>;
  }

  return (
    <Tabs defaultValue="entradas" className="w-full">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <TabsTrigger 
          value="entradas" 
          className="bg-green-100 hover:bg-green-200 data-[state=active]:bg-green-500 data-[state=active]:text-white"
        >
          Entradas
        </TabsTrigger>
        <TabsTrigger 
          value="saidas" 
          className="bg-red-100 hover:bg-red-200 data-[state=active]:bg-red-500 data-[state=active]:text-white"
        >
          Saídas
        </TabsTrigger>
        <TabsTrigger 
          value="resumo" 
          className="bg-blue-100 hover:bg-blue-200 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
        >
          Resumo do Período
        </TabsTrigger>
        <TabsTrigger 
          value="saldo_total" 
          className="bg-purple-100 hover:bg-purple-200 data-[state=active]:bg-purple-500 data-[state=active]:text-white"
        >
          Saldo Geral
        </TabsTrigger>
      </TabsList>

      <TabsContent value="entradas">
        <EntradasTab entradas={entradasDoPeriodo} saldosPeriodo={saldosCalculadosPeriodo} />
      </TabsContent>

      <TabsContent value="saidas">
        <SaidasTab saidas={saidasDoPeriodo} saldosPeriodo={saldosCalculadosPeriodo} />
      </TabsContent>

      <TabsContent value="resumo">
        {saldosCalculadosPeriodo ? (
          <CardChurch>
            <CardHeader><CardTitle>Resumo Financeiro do Período</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-4 border rounded-md bg-green-50">
                <span className="text-lg font-medium text-green-700">Total de Entradas no Período:</span>
                <span className="text-xl font-bold text-green-600">{formatCurrency(saldosCalculadosPeriodo.entradasMes)}</span>
              </div>
              <div className="flex justify-between items-center p-4 border rounded-md bg-red-50">
                <span className="text-lg font-medium text-red-700">Total de Saídas no Período:</span>
                <span className="text-xl font-bold text-red-600">{formatCurrency(saldosCalculadosPeriodo.saidasMes)}</span>
              </div>
              <div className="flex justify-between items-center p-4 border rounded-md bg-blue-50">
                <span className="text-lg font-medium text-blue-700">Saldo do Período:</span>
                <span className={`text-xl font-bold ${saldosCalculadosPeriodo.saldoMes >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(saldosCalculadosPeriodo.saldoMes)}
                </span>
              </div>
            </CardContent>
          </CardChurch>
        ) : (
          <p className="text-center py-4">Calculando resumo financeiro...</p>
        )}
      </TabsContent>

      <TabsContent value="saldo_total">
        {saldosCalculadosPeriodo ? (
          <CardChurch>
            <CardHeader><CardTitle>Saldo Geral da Igreja</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-4 border rounded-md bg-purple-50">
                <span className="text-lg font-medium text-purple-700">Saldo Total Acumulado:</span>
                <span className={`text-2xl font-bold ${saldosCalculadosPeriodo.saldoTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(saldosCalculadosPeriodo.saldoTotal)}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Este valor representa o saldo total acumulado da igreja, considerando todas as entradas e saídas registradas no sistema até o momento.
                </p>
              </div>
            </CardContent>
          </CardChurch>
        ) : (
          <p className="text-center py-4">Calculando saldo geral...</p>
        )}
      </TabsContent>
    </Tabs>
  );
};
