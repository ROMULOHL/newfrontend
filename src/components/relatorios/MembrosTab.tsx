import React, { useState, useEffect, useMemo } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CardChurch, CardContent, CardHeader, CardTitle } from "@/components/ui/card-church";
import { useData } from "@/contexts/DataContext";
import { Member } from "@/contexts/DataContextTypes";

interface MembrosTabProps {
  dataInicio?: Date | null;
  dataFim?: Date | null;
}

export const MembrosTab: React.FC<MembrosTabProps> = ({ dataInicio, dataFim }) => {
  // Estados para filtros
  const [filtroIdade, setFiltroIdade] = useState("todos");
  const [filtroEstadoCivil, setFiltroEstadoCivil] = useState("todos");
  const [filtroFuncao, setFiltroFuncao] = useState("todos");
  const [filtroBatizado, setFiltroBatizado] = useState(false);
  const [filtroDizimista, setFiltroDizimista] = useState(false);
  const [filtrosAplicados, setFiltrosAplicados] = useState(false);

  // Obter dados do contexto
  const { membros, loading } = useData();

  // Função para calcular a idade a partir da data de nascimento
  const calcularIdade = (dataNascimento: string | undefined): number => {
    if (!dataNascimento) return 0;
    
    try {
      const hoje = new Date();
      const nascimento = new Date(dataNascimento);
      let idade = hoje.getFullYear() - nascimento.getFullYear();
      const m = hoje.getMonth() - nascimento.getMonth();
      
      if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
      }
      
      return idade;
    } catch (error) {
      console.error("Erro ao calcular idade:", error);
      return 0;
    }
  };

  // Filtrar membros por período (novos no mês)
  const membrosFiltradosPorPeriodo = useMemo(() => {
    if (!membros || membros.length === 0) return [];
    
    let membrosFiltrados = [...membros];
    
    if (dataInicio && dataFim) {
      // Filtrar membros cadastrados no período selecionado
      membrosFiltrados = membrosFiltrados.filter(membro => {
        if (!membro.dataCadastro) return false;
        
        // Converter para string ISO se for Date
        const dataCadastroStr = typeof membro.dataCadastro === 'string' 
          ? membro.dataCadastro 
          : membro.dataCadastro.toISOString();
        
        const dataCadastro = new Date(dataCadastroStr);
        return dataCadastro >= dataInicio && dataCadastro <= dataFim;
      });
    }
    
    return membrosFiltrados;
  }, [membros, dataInicio, dataFim]);

  // Aplicar filtros de usuário (idade, estado civil, função, status)
  const membrosFiltrados = useMemo(() => {
    if (!membros || membros.length === 0) return [];
    
    let resultado = [...membros];
    
    if (filtrosAplicados) {
      // Filtro de faixa etária
      if (filtroIdade !== "todos") {
        resultado = resultado.filter(membro => {
          const idade = calcularIdade(membro.dataNascimento);
          
          switch (filtroIdade) {
            case "ate18": return idade <= 18;
            case "19a30": return idade >= 19 && idade <= 30;
            case "31a45": return idade >= 31 && idade <= 45;
            case "46a60": return idade >= 46 && idade <= 60;
            case "acima60": return idade > 60;
            default: return true;
          }
        });
      }
      
      // Filtro de estado civil
      if (filtroEstadoCivil !== "todos") {
        resultado = resultado.filter(membro => {
          const estadoCivil = membro.estadoCivil?.toLowerCase();
          return estadoCivil === filtroEstadoCivil;
        });
      }
      
      // Filtro de função
      if (filtroFuncao !== "todos") {
        resultado = resultado.filter(membro => {
          const funcao = membro.funcao?.toLowerCase();
          return funcao === filtroFuncao;
        });
      }
      
      // Filtro de batizado
      if (filtroBatizado) {
        resultado = resultado.filter(membro => membro.batizado === true);
      }
      
      // Filtro de dizimista
      if (filtroDizimista) {
        resultado = resultado.filter(membro => membro.dizimista === true);
      }
    }
    
    return resultado;
  }, [membros, filtroIdade, filtroEstadoCivil, filtroFuncao, filtroBatizado, filtroDizimista, filtrosAplicados]);

  // Calcular estatísticas
  const estatisticas = useMemo(() => {
    if (!membros || membros.length === 0) {
      return {
        total: 0,
        batizados: 0,
        dizimistas: 0,
        novosNoMes: 0,
        percentualBatizados: 0,
        percentualDizimistas: 0,
        percentualNovos: 0
      };
    }

    const total = membros.length;
    const batizados = membros.filter(m => m.batizado === true).length;
    const dizimistas = membros.filter(m => m.dizimista === true).length;
    const novosNoMes = membrosFiltradosPorPeriodo.length;
    
    return {
      total,
      batizados,
      dizimistas,
      novosNoMes,
      percentualBatizados: total > 0 ? Math.round((batizados / total) * 100) : 0,
      percentualDizimistas: total > 0 ? Math.round((dizimistas / total) * 100) : 0,
      percentualNovos: total > 0 ? Math.round((novosNoMes / total) * 100) : 0
    };
  }, [membros, membrosFiltradosPorPeriodo]);

  // Calcular distribuição por gênero (estimativa baseada no nome)
  const distribuicaoGenero = useMemo(() => {
    if (!membrosFiltrados || membrosFiltrados.length === 0) {
      return { masculino: 0, feminino: 0, percentualMasculino: 50, percentualFeminino: 50 };
    }

    // Como não temos campo de gênero, vamos usar uma estimativa padrão
    // Em uma implementação real, você pode adicionar um campo de gênero ao cadastro
    // ou usar uma API para estimar o gênero com base no nome
    const total = membrosFiltrados.length;
    
    // Valores padrão para demonstração
    const masculino = Math.round(total * 0.45);
    const feminino = total - masculino;
    
    return {
      masculino,
      feminino,
      percentualMasculino: total > 0 ? Math.round((masculino / total) * 100) : 50,
      percentualFeminino: total > 0 ? Math.round((feminino / total) * 100) : 50
    };
  }, [membrosFiltrados]);

  // Calcular distribuição por estado civil
  const distribuicaoEstadoCivil = useMemo(() => {
    if (!membrosFiltrados || membrosFiltrados.length === 0) {
      return {
        casados: 0, solteiros: 0, divorciados: 0, viuvos: 0,
        percentualCasados: 0, percentualSolteiros: 0, percentualDivorciados: 0, percentualViuvos: 0
      };
    }

    const total = membrosFiltrados.length;
    const casados = membrosFiltrados.filter(m => 
      m.estadoCivil?.toLowerCase() === 'casado' || 
      m.estadoCivil?.toLowerCase() === 'casada'
    ).length;
    
    const solteiros = membrosFiltrados.filter(m => 
      m.estadoCivil?.toLowerCase() === 'solteiro' || 
      m.estadoCivil?.toLowerCase() === 'solteira'
    ).length;
    
    const divorciados = membrosFiltrados.filter(m => 
      m.estadoCivil?.toLowerCase() === 'divorciado' || 
      m.estadoCivil?.toLowerCase() === 'divorciada' ||
      m.estadoCivil?.toLowerCase() === 'separado' || 
      m.estadoCivil?.toLowerCase() === 'separada'
    ).length;
    
    const viuvos = membrosFiltrados.filter(m => 
      m.estadoCivil?.toLowerCase() === 'viuvo' || 
      m.estadoCivil?.toLowerCase() === 'viuva'
    ).length;
    
    return {
      casados,
      solteiros,
      divorciados,
      viuvos,
      percentualCasados: total > 0 ? Math.round((casados / total) * 100) : 0,
      percentualSolteiros: total > 0 ? Math.round((solteiros / total) * 100) : 0,
      percentualDivorciados: total > 0 ? Math.round((divorciados / total) * 100) : 0,
      percentualViuvos: total > 0 ? Math.round((viuvos / total) * 100) : 0
    };
  }, [membrosFiltrados]);

  // Calcular distribuição por faixa etária
  const distribuicaoFaixaEtaria = useMemo(() => {
    if (!membrosFiltrados || membrosFiltrados.length === 0) {
      return {
        ate18: 0, de19a30: 0, de31a45: 0, de46a60: 0, acima60: 0,
        percentualAte18: 0, percentualDe19a30: 0, percentualDe31a45: 0, 
        percentualDe46a60: 0, percentualAcima60: 0
      };
    }

    const total = membrosFiltrados.length;
    
    // Calcular idades e agrupar por faixa etária
    const ate18 = membrosFiltrados.filter(m => {
      const idade = calcularIdade(m.dataNascimento);
      return idade <= 18;
    }).length;
    
    const de19a30 = membrosFiltrados.filter(m => {
      const idade = calcularIdade(m.dataNascimento);
      return idade >= 19 && idade <= 30;
    }).length;
    
    const de31a45 = membrosFiltrados.filter(m => {
      const idade = calcularIdade(m.dataNascimento);
      return idade >= 31 && idade <= 45;
    }).length;
    
    const de46a60 = membrosFiltrados.filter(m => {
      const idade = calcularIdade(m.dataNascimento);
      return idade >= 46 && idade <= 60;
    }).length;
    
    const acima60 = membrosFiltrados.filter(m => {
      const idade = calcularIdade(m.dataNascimento);
      return idade > 60;
    }).length;
    
    return {
      ate18,
      de19a30,
      de31a45,
      de46a60,
      acima60,
      percentualAte18: total > 0 ? Math.round((ate18 / total) * 100) : 0,
      percentualDe19a30: total > 0 ? Math.round((de19a30 / total) * 100) : 0,
      percentualDe31a45: total > 0 ? Math.round((de31a45 / total) * 100) : 0,
      percentualDe46a60: total > 0 ? Math.round((de46a60 / total) * 100) : 0,
      percentualAcima60: total > 0 ? Math.round((acima60 / total) * 100) : 0
    };
  }, [membrosFiltrados]);

  // Aplicar filtros
  const handleAplicarFiltros = () => {
    setFiltrosAplicados(true);
  };

  // Limpar filtros
  const handleLimparFiltros = () => {
    setFiltroIdade("todos");
    setFiltroEstadoCivil("todos");
    setFiltroFuncao("todos");
    setFiltroBatizado(false);
    setFiltroDizimista(false);
    setFiltrosAplicados(false);
  };

  if (loading) {
    return (
      <TabsContent value="membros">
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-gray-500">Carregando dados de membros...</p>
        </div>
      </TabsContent>
    );
  }

  return (
    <TabsContent value="membros">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <CardChurch>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Faixa Etária</label>
                <select 
                  className="w-full border rounded p-2 text-sm" 
                  value={filtroIdade} 
                  onChange={(e) => setFiltroIdade(e.target.value)}
                >
                  <option value="todos">Todas as idades</option>
                  <option value="ate18">Até 18 anos</option>
                  <option value="19a30">19 a 30 anos</option>
                  <option value="31a45">31 a 45 anos</option>
                  <option value="46a60">46 a 60 anos</option>
                  <option value="acima60">Acima de 60 anos</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado Civil</label>
                <select 
                  className="w-full border rounded p-2 text-sm" 
                  value={filtroEstadoCivil} 
                  onChange={(e) => setFiltroEstadoCivil(e.target.value)}
                >
                  <option value="todos">Todos</option>
                  <option value="solteiro">Solteiro(a)</option>
                  <option value="casado">Casado(a)</option>
                  <option value="divorciado">Divorciado(a)</option>
                  <option value="viuvo">Viúvo(a)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Função na Igreja</label>
                <select 
                  className="w-full border rounded p-2 text-sm"
                  value={filtroFuncao}
                  onChange={(e) => setFiltroFuncao(e.target.value)}
                >
                  <option value="todos">Todas</option>
                  <option value="pastor">Pastor</option>
                  <option value="diacono">Diácono</option>
                  <option value="lider">Líder de Ministério</option>
                  <option value="tesoureiro">Tesoureiro</option>
                  <option value="secretario">Secretário(a)</option>
                  <option value="musico">Músico</option>
                  <option value="membro">Membro Regular</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="batizado" 
                      className="mr-2" 
                      checked={filtroBatizado}
                      onChange={(e) => setFiltroBatizado(e.target.checked)}
                    />
                    <label htmlFor="batizado" className="text-sm">Batizado</label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="dizimista" 
                      className="mr-2" 
                      checked={filtroDizimista}
                      onChange={(e) => setFiltroDizimista(e.target.checked)}
                    />
                    <label htmlFor="dizimista" className="text-sm">Dizimista</label>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="w-1/2" 
                  onClick={handleLimparFiltros}
                >
                  Limpar
                </Button>
                <Button 
                  className="w-1/2 bg-church-button hover:bg-church-button/90" 
                  onClick={handleAplicarFiltros}
                >
                  Aplicar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </CardChurch>

        <CardChurch className="col-span-2">
          <CardHeader>
            <CardTitle>Estatísticas de Membros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <h3 className="text-gray-500 text-sm font-medium">Total de Membros</h3>
                <p className="text-3xl font-bold text-church-text mt-2">{estatisticas.total}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <h3 className="text-gray-500 text-sm font-medium">Membros Batizados</h3>
                <p className="text-3xl font-bold text-church-text mt-2">{estatisticas.batizados}</p>
                <p className="text-xs text-gray-500 mt-1">{estatisticas.percentualBatizados}% do total</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <h3 className="text-gray-500 text-sm font-medium">Dizimistas</h3>
                <p className="text-3xl font-bold text-church-text mt-2">{estatisticas.dizimistas}</p>
                <p className="text-xs text-gray-500 mt-1">{estatisticas.percentualDizimistas}% do total</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <h3 className="text-gray-500 text-sm font-medium">Novos no Mês</h3>
                <p className="text-3xl font-bold text-church-text mt-2">{estatisticas.novosNoMes}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {estatisticas.percentualNovos > 0 ? `+${estatisticas.percentualNovos}%` : `${estatisticas.percentualNovos}%`} no período
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-md font-semibold mb-3">Distribuição por Gênero</h3>
              <div className="flex items-center">
                <div className="w-2/3 bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-blue-500 h-4 rounded-full" 
                    style={{ width: `${distribuicaoGenero.percentualMasculino}%` }}
                  ></div>
                </div>
                <div className="ml-4 flex items-center text-sm">
                  <span className="inline-block w-3 h-3 bg-blue-500 mr-1 rounded-sm"></span>
                  <span className="mr-4">Masculino: {distribuicaoGenero.percentualMasculino}%</span>
                  <span className="inline-block w-3 h-3 bg-pink-500 mr-1 rounded-sm"></span>
                  <span>Feminino: {distribuicaoGenero.percentualFeminino}%</span>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-md font-semibold mb-3">Distribuição por Estado Civil</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-church-text">Casados</span>
                    <span className="text-sm font-medium text-church-text">{distribuicaoEstadoCivil.percentualCasados}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${distribuicaoEstadoCivil.percentualCasados}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-church-text">Solteiros</span>
                    <span className="text-sm font-medium text-church-text">{distribuicaoEstadoCivil.percentualSolteiros}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-purple-600 h-2.5 rounded-full" 
                      style={{ width: `${distribuicaoEstadoCivil.percentualSolteiros}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-church-text">Divorciados</span>
                    <span className="text-sm font-medium text-church-text">{distribuicaoEstadoCivil.percentualDivorciados}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-amber-600 h-2.5 rounded-full" 
                      style={{ width: `${distribuicaoEstadoCivil.percentualDivorciados}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-church-text">Viúvos</span>
                    <span className="text-sm font-medium text-church-text">{distribuicaoEstadoCivil.percentualViuvos}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-green-600 h-2.5 rounded-full" 
                      style={{ width: `${distribuicaoEstadoCivil.percentualViuvos}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </CardChurch>
      </div>

      <CardChurch>
        <CardHeader>
          <CardTitle>Distribuição por Faixa Etária</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mt-2">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-church-text">Até 18 anos</span>
                <span className="text-sm font-medium text-church-text">
                  {distribuicaoFaixaEtaria.ate18} membros ({distribuicaoFaixaEtaria.percentualAte18}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-church-button h-2.5 rounded-full" 
                  style={{ width: `${distribuicaoFaixaEtaria.percentualAte18}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-church-text">19 a 30 anos</span>
                <span className="text-sm font-medium text-church-text">
                  {distribuicaoFaixaEtaria.de19a30} membros ({distribuicaoFaixaEtaria.percentualDe19a30}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-church-button h-2.5 rounded-full" 
                  style={{ width: `${distribuicaoFaixaEtaria.percentualDe19a30}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-church-text">31 a 45 anos</span>
                <span className="text-sm font-medium text-church-text">
                  {distribuicaoFaixaEtaria.de31a45} membros ({distribuicaoFaixaEtaria.percentualDe31a45}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-church-button h-2.5 rounded-full" 
                  style={{ width: `${distribuicaoFaixaEtaria.percentualDe31a45}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-church-text">46 a 60 anos</span>
                <span className="text-sm font-medium text-church-text">
                  {distribuicaoFaixaEtaria.de46a60} membros ({distribuicaoFaixaEtaria.percentualDe46a60}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-church-button h-2.5 rounded-full" 
                  style={{ width: `${distribuicaoFaixaEtaria.percentualDe46a60}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-church-text">Acima de 60 anos</span>
                <span className="text-sm font-medium text-church-text">
                  {distribuicaoFaixaEtaria.acima60} membros ({distribuicaoFaixaEtaria.percentualAcima60}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-church-button h-2.5 rounded-full" 
                  style={{ width: `${distribuicaoFaixaEtaria.percentualAcima60}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </CardChurch>
    </TabsContent>
  );
};
