import React, { useState, useMemo, useEffect } from "react"; // Adicionado useEffect
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

      <Card>
        <CardHeader>
          <CardTitle>Entradas por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Membro</TableHead>
                <TableHead>Método</TableHead>
                <TableHead className="text-right">Valor</TableHead>
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
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resumo de Entradas por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {saldosPeriodo.distribuicaoReceitas && saldosPeriodo.distribuicaoReceitas.length > 0 ? 
              saldosPeriodo.distribuicaoReceitas.map((item) => (
                <div key={item.categoria || 'sem-categoria'} className="p-4 border rounded-md bg-green-50">
                  <h3 className="font-semibold text-green-700">{item.categoria || "Outras"}</h3>
                  <p className="text-xl font-bold text-green-900">{formatCurrency(item.valor)}</p>
                  <p className="text-sm text-muted-foreground">{item.percentual}% do total</p>
                </div>
              ))
              : <p>Sem dados de distribuição para o período.</p>
            }
          </div>
        </CardContent>
      </Card>
      
      {/* Nova seção: Resumo por Método de Pagamento */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo por Método de Pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resumoPorMetodoPagamento.length > 0 ? 
              resumoPorMetodoPagamento.map((item) => (
                <div key={item.metodo} className="p-4 border rounded-md bg-blue-50">
                  <h3 className="font-semibold text-blue-700">{capitalizeFirstLetter(item.metodo)}</h3>
                  <p className="text-xl font-bold text-blue-900">{formatCurrency(item.valor)}</p>
                  <p className="text-sm text-muted-foreground">{item.percentual}% do total</p>
                </div>
              ))
              : <p>Sem dados de métodos de pagamento para o período.</p>
            }
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Total de Entradas no Período</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-green-600">{formatCurrency(saldosPeriodo.entradasMes)}</p>
        </CardContent>
      </Card>
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
          <Card key={categoriaPrincipal}>
            <CardHeader>
              <CardTitle>{categoriaPrincipal}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subcategoria</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {saidasDoGrupo.map((saida) => (
                    <TableRow key={saida.id ?? Math.random()}>
                      <TableCell>{saida.subCategoria || saida.categoria || "-"}</TableCell>
                      <TableCell>{saida.descricao || "-"}</TableCell>
                      <TableCell className="text-right text-red-600">{formatCurrency(saida.valor)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={2} className="text-right font-bold">Subtotal {categoriaPrincipal}</TableCell>
                    <TableCell className="text-right font-bold text-red-700">{formatCurrency(subtotalGrupo)}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>
        );
      })}
      {saidas.length === 0 && (
         <Card><CardContent><p className="text-center py-4">Nenhuma saída encontrada para o período selecionado.</p></CardContent></Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Total de Saídas no Período</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-red-600">{formatCurrency(saldosPeriodo.saidasMes)}</p>
        </CardContent>
      </Card>
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
        <TabsTrigger value="entradas">Entradas</TabsTrigger>
        <TabsTrigger value="saidas">Saídas</TabsTrigger>
        <TabsTrigger value="resumo">Resumo do Período</TabsTrigger>
        <TabsTrigger value="saldo_total">Saldo Geral</TabsTrigger>
      </TabsList>

      <TabsContent value="entradas">
        <EntradasTab entradas={entradasDoPeriodo} saldosPeriodo={saldosCalculadosPeriodo} />
      </TabsContent>

      <TabsContent value="saidas">
        <SaidasTab saidas={saidasDoPeriodo} saldosPeriodo={saldosCalculadosPeriodo} />
      </TabsContent>

      <TabsContent value="resumo">
        {saldosCalculadosPeriodo ? (
          <Card>
            <CardHeader><CardTitle>Resumo Financeiro do Período</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-4 border rounded-md bg-blue-50">
                <span className="text-lg font-medium text-blue-700">Total de Entradas no Período:</span>
                <span className="text-xl font-bold text-green-600">{formatCurrency(saldosCalculadosPeriodo.entradasMes)}</span>
              </div>
              <div className="flex justify-between items-center p-4 border rounded-md bg-red-50">
                <span className="text-lg font-medium text-red-700">Total de Saídas no Período:</span>
                <span className="text-xl font-bold text-red-600">{formatCurrency(saldosCalculadosPeriodo.saidasMes)}</span>
              </div>
              <div className="flex justify-between items-center p-4 border rounded-md bg-indigo-50">
                <span className="text-lg font-medium text-indigo-700">Saldo do Período:</span>
                <span className={`text-xl font-bold ${saldosCalculadosPeriodo.saldoMes >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
                  {formatCurrency(saldosCalculadosPeriodo.saldoMes)}
                </span>
              </div>
            </CardContent>
          </Card>
        ) : <p>Calculando resumo...</p>}
      </TabsContent>
      
      <TabsContent value="saldo_total">
        {saldosCalculadosPeriodo ? (
            <Card>
                <CardHeader><CardTitle>Saldo Geral Acumulado</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold text-purple-600">{formatCurrency(saldosCalculadosPeriodo.saldoTotal)}</p>
                    <p className="text-sm text-muted-foreground">Este é o saldo considerando todas as transações registradas.</p>
                </CardContent>
            </Card>
        ) : <p>Calculando saldo total...</p>}
      </TabsContent>
    </Tabs>
  );
};
