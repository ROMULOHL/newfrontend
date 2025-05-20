import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RelatorioHeader } from "@/components/relatorios/RelatorioHeader";
// Ajustado para importar o nome do arquivo que você provavelmente usará (substituindo o original)
import { FinanceiroTabs } from "@/components/relatorios/FinanceiroTabs_modificado"; 
import { MembrosTab } from "@/components/relatorios/MembrosTab";
import { CardChurch, CardContent } from "@/components/ui/card-church";
import { Button } from "@/components/ui/button";

const Relatorios: React.FC = () => {
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  
  const [dataInicioFiltro, setDataInicioFiltro] = useState<Date | null>(null);
  const [dataFimFiltro, setDataFimFiltro] = useState<Date | null>(null);
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("todas");

  const [tempDataInicio, setTempDataInicio] = useState<string>("");
  const [tempDataFim, setTempDataFim] = useState<string>("");
  const [tempCategoria, setTempCategoria] = useState<string>("todas");
  
  // Estado para controlar a aba ativa
  const [activeTab, setActiveTab] = useState<"financeiro" | "membros">("financeiro");

  const toggleFilterPanel = () => {
    setShowFilterPanel(!showFilterPanel);
  };

  const handleApplyDateFilter = () => {
    const inicio = tempDataInicio ? new Date(tempDataInicio + "T00:00:00") : null;
    const fim = tempDataFim ? new Date(tempDataFim + "T23:59:59") : null;
    
    setDataInicioFiltro(inicio);
    setDataFimFiltro(fim);
    setCategoriaFiltro(tempCategoria);
    setShowFilterPanel(false);
  };

  const handleClearDateFilter = () => {
    setTempDataInicio("");
    setTempDataFim("");
    setTempCategoria("todas");
    setDataInicioFiltro(null);
    setDataFimFiltro(null);
    setCategoriaFiltro("todas");
  };

  useEffect(() => {
    // Define um filtro padrão para o mês atual ao carregar a página inicialmente
    const hoje = new Date();
    const primeiroDiaDoMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const ultimoDiaDoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59);

    setDataInicioFiltro(primeiroDiaDoMes);
    setDataFimFiltro(ultimoDiaDoMes);

    // Preenche os inputs temporários também, para que apareçam no painel
    setTempDataInicio(primeiroDiaDoMes.toISOString().split('T')[0]);
    setTempDataFim(ultimoDiaDoMes.toISOString().split('T')[0]);

  }, []); // Executa apenas uma vez ao montar o componente


  return (
    <DashboardLayout>
      <RelatorioHeader 
        title="Relatórios" 
        onFilterToggle={toggleFilterPanel}
        showFilterButton={activeTab === "financeiro"}
        dataInicio={dataInicioFiltro}
        dataFim={dataFimFiltro}
        tipoRelatorio={activeTab}
        categoriaFiltro={categoriaFiltro}
      />

      {showFilterPanel && activeTab === "financeiro" && (
        <CardChurch className="mb-6 animate-fade-in">
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="dataInicioInput" className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
                <input 
                  id="dataInicioInput"
                  type="date" 
                  className="w-full p-2 border rounded" 
                  value={tempDataInicio} 
                  onChange={(e) => setTempDataInicio(e.target.value)} 
                />
              </div>
              <div>
                <label htmlFor="dataFimInput" className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
                <input 
                  id="dataFimInput"
                  type="date" 
                  className="w-full p-2 border rounded" 
                  value={tempDataFim} 
                  onChange={(e) => setTempDataFim(e.target.value)} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria (Exemplo)</label>
                <select 
                  className="w-full border rounded p-2"
                  value={tempCategoria}
                  onChange={(e) => setTempCategoria(e.target.value)}
                >
                  <option value="todas">Todas</option>
                  <option value="dizimo">Dízimo</option>
                  <option value="oferta">Oferta</option>
                  <option value="campanha">Campanha</option>
                  <option value="doacao">Doação</option>
                  <option value="entradas">Total Entradas</option>
                  <option value="saidas">Total Saídas</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={handleClearDateFilter}>Limpar Datas</Button>
                <Button onClick={handleApplyDateFilter} className="bg-church-button hover:bg-church-button-hover">Aplicar Filtros</Button>
            </div>
          </CardContent>
        </CardChurch>
      )}

      <Tabs 
        defaultValue="financeiro" 
        className="w-full mb-6"
        onValueChange={(value) => {
          setActiveTab(value as "financeiro" | "membros");
          // Esconde o painel de filtro ao trocar de aba
          if (value !== "financeiro") {
            setShowFilterPanel(false);
          }
        }}
      >
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger 
            value="financeiro" 
            className="data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=inactive]:bg-blue-200"
          >
            Financeiro
          </TabsTrigger>
          <TabsTrigger 
            value="membros" 
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=inactive]:bg-purple-200"
          >
            Membros
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="financeiro" className="mt-0 border-0 p-0">
            <FinanceiroTabs dataInicio={dataInicioFiltro} dataFim={dataFimFiltro} categoriaFiltro={categoriaFiltro} />
        </TabsContent>
        
        <TabsContent value="membros" className="mt-0 border-0 p-0">
            {/* Props dataInicio e dataFim removidas temporariamente de MembrosTab para evitar erro de compilação */}
            {/* Serão adicionadas quando formos implementar a lógica de filtro de data em MembrosTab */}
            <MembrosTab />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Relatorios;
