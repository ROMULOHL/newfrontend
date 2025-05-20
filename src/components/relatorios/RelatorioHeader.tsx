import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Filter, Download, FileText, FileSpreadsheet } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  exportarFinanceiroPDF, 
  exportarFinanceiroExcel,
  exportarMembrosPDF,
  exportarMembrosExcel,
  TransacaoExport
} from "@/lib/exportUtils";
import { useFinancialData } from "@/contexts/FinancialContext";
import { useData } from "@/contexts/DataContext";

interface RelatorioHeaderProps {
  title: string;
  onFilterToggle: () => void;
  showFilterButton: boolean;
  dataInicio: Date | null;
  dataFim: Date | null;
  tipoRelatorio: "financeiro" | "membros";
  categoriaFiltro?: string;
}

export const RelatorioHeader: React.FC<RelatorioHeaderProps> = ({ 
  title, 
  onFilterToggle, 
  showFilterButton, 
  dataInicio, 
  dataFim,
  tipoRelatorio,
  categoriaFiltro = "todas"
}) => {
  const [showExportOptions, setShowExportOptions] = useState(false);
  const { transacoes } = useFinancialData();
  const { membros } = useData();

  // Função para converter Transacao para TransacaoExport
  const converterTransacoesParaExport = (): TransacaoExport[] => {
    return transacoes.map(t => ({
      id: t.id || "",
      tipo: t.tipo,
      valor: t.valor,
      data: t.data,
      descricao: t.descricao
    }));
  };

  const handleExportPDF = () => {
    console.log("Exportando para PDF", { dataInicio, dataFim, categoriaFiltro });
    
    // Implementação da exportação em PDF
    if (tipoRelatorio === "financeiro") {
      const transacoesExport = converterTransacoesParaExport();
      exportarFinanceiroPDF(transacoesExport, dataInicio, dataFim, categoriaFiltro);
    } else if (tipoRelatorio === "membros") {
      exportarMembrosPDF(membros);
    }
  };

  const handleExportExcel = () => {
    console.log("Exportando para Excel", { dataInicio, dataFim, categoriaFiltro });
    
    // Implementação da exportação em Excel
    if (tipoRelatorio === "financeiro") {
      const transacoesExport = converterTransacoesParaExport();
      exportarFinanceiroExcel(transacoesExport, dataInicio, dataFim, categoriaFiltro);
    } else if (tipoRelatorio === "membros") {
      exportarMembrosExcel(membros);
    }
  };

  // Formatar o mês atual para exibição
  const mesAtual = new Date();
  const mesFormatado = format(mesAtual, "MMMM yyyy", { locale: ptBR });

  // Formatar datas de início e fim se existirem
  const dataInicioFormatada = dataInicio ? format(dataInicio, "dd/MM/yyyy") : "";
  const dataFimFormatada = dataFim ? format(dataFim, "dd/MM/yyyy") : "";
  const periodoFormatado = dataInicio && dataFim ? `${dataInicioFormatada} - ${dataFimFormatada}` : mesFormatado;

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-church-button">{title}</h1>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Calendar size={18} />
            <span>{periodoFormatado}</span>
          </Button>
          
          {showFilterButton && (
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={onFilterToggle}
            >
              <Filter size={18} />
              <span>Filtrar</span>
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-church-button hover:bg-church-button/90 flex items-center gap-2">
                <Download size={18} />
                <span>Exportar</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white">
              <DropdownMenuItem onClick={handleExportPDF} className="flex items-center gap-2 cursor-pointer">
                <FileText size={18} />
                <span>Exportar como PDF</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportExcel} className="flex items-center gap-2 cursor-pointer">
                <FileSpreadsheet size={18} />
                <span>Exportar como Excel</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
