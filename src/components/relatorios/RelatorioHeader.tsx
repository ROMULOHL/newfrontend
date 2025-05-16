
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Filter, Download, FileText, FileSpreadsheet } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface RelatorioHeaderProps {
  title: string;
}

export const RelatorioHeader: React.FC<RelatorioHeaderProps> = ({ title }) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleExportPDF = () => {
    console.log("Exportando para PDF");
    // Implementação da exportação em PDF
  };

  const handleExportExcel = () => {
    console.log("Exportando para Excel");
    // Implementação da exportação em Excel
  };

  const handleFilterToggle = () => {
    setShowFilters(!showFilters);
  };

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-church-button">{title}</h1>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Calendar size={18} />
            <span>Abril 2025</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleFilterToggle}
          >
            <Filter size={18} />
            <span>Filtrar</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-church-button hover:bg-church-button/90 flex items-center gap-2">
                <Download size={18} />
                <span>Exportar</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
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
