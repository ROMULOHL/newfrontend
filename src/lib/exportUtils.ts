// Arquivo para implementar a exportação de relatórios em PDF e Excel
import jspdf from "jspdf";
import * as XLSX from "xlsx";

// Interface para os dados de transação que serão exportados
export interface TransacaoExport {
  id: string;
  tipo: string;
  valor: number;
  data: Date | any; // Aceita Date ou FirestoreTimestamp
  descricao?: string;
  categoria?: string; // Adicionado campo categoria para melhorar a filtragem
  membroNome?: string; // Adicionado para melhorar a exibição nos relatórios
  formaPagamento?: string; // Adicionado para incluir método de pagamento nos relatórios
  membroId?: string; // Adicionado para identificar entradas associadas a membros
}

// Interface para os dados de membro que serão exportados
interface MembroExport {
  id: string;
  nome: string;
  telefone?: string;
  idade?: string;
  dataNascimento?: Date | any;
  funcao?: string;
  profissao?: string;
  estadoCivil?: string;
  genero?: string;
  batizado: boolean;
  dizimista: boolean;
}

/**
 * Converte qualquer tipo de data para objeto Date
 */
function toDate(date: Date | any): Date {
  if (!date) return new Date();
  
  if (date instanceof Date) {
    return date;
  }
  
  // Se for um timestamp do Firestore
  if (date.seconds !== undefined && date.nanoseconds !== undefined) {
    return new Date(date.seconds * 1000);
  }
  
  // Se for uma string
  if (typeof date === 'string') {
    return new Date(date);
  }
  
  // Se for um número (timestamp em milissegundos)
  if (typeof date === 'number') {
    return new Date(date);
  }
  
  return new Date();
}

/**
 * Verifica se uma transação é do tipo dízimo - ABORDAGEM SUPER ABRANGENTE
 */
function isDizimo(transacao: TransacaoExport): boolean {
  // ABORDAGEM SUPER ABRANGENTE: Considerar QUALQUER critério que possa indicar um dízimo
  
  // 1. Verificar no campo tipo
  if (transacao.tipo && 
      (transacao.tipo.toLowerCase() === 'dízimo' || 
       transacao.tipo.toLowerCase() === 'dizimo')) {
    return true;
  }
  
  // 2. Verificar no campo categoria
  if (transacao.categoria) {
    const categoriaLower = transacao.categoria.toLowerCase();
    if (categoriaLower === 'dízimo' || 
        categoriaLower === 'dizimo' || 
        categoriaLower.includes('dízimo') || 
        categoriaLower.includes('dizimo')) {
      return true;
    }
  }
  
  // 3. Verificar na descrição
  if (transacao.descricao) {
    const descricaoLower = transacao.descricao.toLowerCase();
    if (descricaoLower.includes('dízimo') || 
        descricaoLower.includes('dizimo')) {
      return true;
    }
  }
  
  // 4. Se for uma entrada e tiver um membro associado (caso de dízimos sem descrição)
  if (transacao.tipo === 'entrada' && transacao.membroNome) {
    return true;
  }
  
  return false;
}

/**
 * Verifica se uma transação é do tipo oferta
 */
function isOferta(transacao: TransacaoExport): boolean {
  // Verificar no campo tipo
  if (transacao.tipo && transacao.tipo.toLowerCase() === 'oferta') {
    return true;
  }
  
  // Verificar no campo categoria
  if (transacao.categoria) {
    const categoriaLower = transacao.categoria.toLowerCase();
    if (categoriaLower === 'oferta' || categoriaLower === 'ofertas' || 
        categoriaLower.includes('oferta') || categoriaLower === 'culto' || 
        categoriaLower.includes('culto')) {
      return true;
    }
  }
  
  // Verificar na descrição
  if (transacao.descricao) {
    const descricaoLower = transacao.descricao.toLowerCase();
    if (descricaoLower.includes('oferta') || descricaoLower.includes('culto')) {
      return true;
    }
  }
  
  return false;
}

/**
 * Exporta relatório financeiro em PDF
 * @param transacoes Lista de transações a serem exportadas
 * @param dataInicio Data inicial do período
 * @param dataFim Data final do período
 * @param categoria Categoria para filtrar (opcional)
 */
export const exportarFinanceiroPDF = (
  transacoes: TransacaoExport[],
  dataInicio: Date | null, 
  dataFim: Date | null, 
  categoria: string = "todas"
) => {
  // Filtrar transações pelo período
  let transacoesFiltradas = transacoes.filter((transacao: TransacaoExport) => {
    // Filtro de data
    if (dataInicio && dataFim) {
      const data = toDate(transacao.data);
      if (!(data >= toDate(dataInicio) && data <= toDate(dataFim))) {
        return false;
      }
    }
    return true;
  });
  
  // Filtrar por categoria - ABORDAGEM SUPER ABRANGENTE
  if (categoria !== "todas") {
    if (categoria.toLowerCase() === "dizimo") {
      // Para dízimos, usar a função abrangente
      transacoesFiltradas = transacoesFiltradas.filter(isDizimo);
    } else if (categoria.toLowerCase() === "oferta") {
      transacoesFiltradas = transacoesFiltradas.filter(isOferta);
    } else if (categoria.toLowerCase() === "campanha") {
      transacoesFiltradas = transacoesFiltradas.filter(t => 
        (t.descricao && t.descricao.toLowerCase().includes("campanha")) || 
        (t.categoria && t.categoria.toLowerCase().includes("campanha"))
      );
    } else if (categoria.toLowerCase() === "doacao") {
      transacoesFiltradas = transacoesFiltradas.filter(t => 
        (t.descricao && (t.descricao.toLowerCase().includes("doação") || t.descricao.toLowerCase().includes("doacao"))) || 
        (t.categoria && (t.categoria.toLowerCase().includes("doação") || t.categoria.toLowerCase().includes("doacao")))
      );
    } else if (categoria.toLowerCase() === "entradas") {
      transacoesFiltradas = transacoesFiltradas.filter(t => t.tipo.toLowerCase() === "entrada");
    } else if (categoria.toLowerCase() === "saidas") {
      transacoesFiltradas = transacoesFiltradas.filter(t => t.tipo.toLowerCase() === "saida");
    }
  }
  
  // Criar novo documento PDF
  const doc = new jspdf();
  
  // Adicionar título
  doc.setFontSize(18);
  doc.text("Relatório Financeiro", 105, 20, { align: "center" });
  
  // Adicionar período
  doc.setFontSize(12);
  if (dataInicio && dataFim) {
    const dataInicioStr = toDate(dataInicio).toLocaleDateString();
    const dataFimStr = toDate(dataFim).toLocaleDateString();
    doc.text(`Período: ${dataInicioStr} a ${dataFimStr}`, 105, 30, { align: "center" });
  } else {
    doc.text("Período: Todos os registros", 105, 30, { align: "center" });
  }
  
  // Adicionar categoria se filtrada
  if (categoria !== "todas") {
    doc.text(`Categoria: ${categoria}`, 105, 40, { align: "center" });
  }
  
  // Calcular totais
  const totalEntradas = transacoesFiltradas
    .filter((t: TransacaoExport) => t.tipo === "entrada")
    .reduce((sum: number, t: TransacaoExport) => sum + t.valor, 0);
  
  const totalSaidas = transacoesFiltradas
    .filter((t: TransacaoExport) => t.tipo === "saida")
    .reduce((sum: number, t: TransacaoExport) => sum + t.valor, 0);
  
  const saldo = totalEntradas - totalSaidas;
  
  // Adicionar resumo
  doc.setFontSize(14);
  doc.text("Resumo", 20, 50);
  
  doc.setFontSize(12);
  doc.text(`Total de Entradas: R$ ${totalEntradas.toFixed(2)}`, 20, 60);
  doc.text(`Total de Saídas: R$ ${totalSaidas.toFixed(2)}`, 20, 70);
  doc.text(`Saldo: R$ ${saldo.toFixed(2)}`, 20, 80);
  
  // Adicionar tabela de entradas
  if (transacoesFiltradas.filter((t: TransacaoExport) => t.tipo === "entrada").length > 0) {
    doc.setFontSize(14);
    doc.text("Entradas", 20, 100);
    
    doc.setFontSize(10);
    doc.text("Descrição", 20, 110);
    doc.text("Data", 100, 110);
    doc.text("Valor (R$)", 150, 110);
    
    let y = 120;
    transacoesFiltradas
      .filter((t: TransacaoExport) => t.tipo === "entrada")
      .forEach((transacao: TransacaoExport) => {
        const dataStr = toDate(transacao.data).toLocaleDateString();
        doc.text(transacao.descricao || "-", 20, y);
        doc.text(dataStr, 100, y);
        doc.text(transacao.valor.toFixed(2), 150, y);
        y += 10;
        
        // Se a página estiver cheia, adicionar nova página
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
      });
  }
  
  // Adicionar tabela de saídas
  if (transacoesFiltradas.filter((t: TransacaoExport) => t.tipo === "saida").length > 0) {
    // Se a última posição Y for muito baixa, adicionar nova página
    let y = 120;
    if (transacoesFiltradas.filter((t: TransacaoExport) => t.tipo === "entrada").length > 0) {
      y = Math.min(280, 120 + transacoesFiltradas.filter((t: TransacaoExport) => t.tipo === "entrada").length * 10);
      if (y > 240) {
        doc.addPage();
        y = 20;
      }
    }
    
    doc.setFontSize(14);
    doc.text("Saídas", 20, y);
    
    doc.setFontSize(10);
    y += 10;
    doc.text("Descrição", 20, y);
    doc.text("Data", 100, y);
    doc.text("Valor (R$)", 150, y);
    
    y += 10;
    transacoesFiltradas
      .filter((t: TransacaoExport) => t.tipo === "saida")
      .forEach((transacao: TransacaoExport) => {
        const dataStr = toDate(transacao.data).toLocaleDateString();
        doc.text(transacao.descricao || "-", 20, y);
        doc.text(dataStr, 100, y);
        doc.text(transacao.valor.toFixed(2), 150, y);
        y += 10;
        
        // Se a página estiver cheia, adicionar nova página
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
      });
  }
  
  // Salvar o PDF
  doc.save("relatorio-financeiro.pdf");
};

/**
 * Exporta relatório financeiro em Excel
 * @param transacoes Lista de transações a serem exportadas
 * @param dataInicio Data inicial do período
 * @param dataFim Data final do período
 * @param categoria Categoria para filtrar (opcional)
 */
export const exportarFinanceiroExcel = (
  transacoes: TransacaoExport[],
  dataInicio: Date | null, 
  dataFim: Date | null, 
  categoria: string = "todas"
) => {
  // Filtrar transações pelo período
  let transacoesFiltradas = transacoes.filter((transacao: TransacaoExport) => {
    // Filtro de data
    if (dataInicio && dataFim) {
      const data = toDate(transacao.data);
      if (!(data >= toDate(dataInicio) && data <= toDate(dataFim))) {
        return false;
      }
    }
    return true;
  });
  
  // Filtrar por categoria - ABORDAGEM SUPER ABRANGENTE
  if (categoria !== "todas") {
    if (categoria.toLowerCase() === "dizimo") {
      // Para dízimos, usar a função abrangente
      transacoesFiltradas = transacoesFiltradas.filter(isDizimo);
    } else if (categoria.toLowerCase() === "oferta") {
      transacoesFiltradas = transacoesFiltradas.filter(isOferta);
    } else if (categoria.toLowerCase() === "campanha") {
      transacoesFiltradas = transacoesFiltradas.filter(t => 
        (t.descricao && t.descricao.toLowerCase().includes("campanha")) || 
        (t.categoria && t.categoria.toLowerCase().includes("campanha"))
      );
    } else if (categoria.toLowerCase() === "doacao") {
      transacoesFiltradas = transacoesFiltradas.filter(t => 
        (t.descricao && (t.descricao.toLowerCase().includes("doação") || t.descricao.toLowerCase().includes("doacao"))) || 
        (t.categoria && (t.categoria.toLowerCase().includes("doação") || t.categoria.toLowerCase().includes("doacao")))
      );
    } else if (categoria.toLowerCase() === "entradas") {
      transacoesFiltradas = transacoesFiltradas.filter(t => t.tipo.toLowerCase() === "entrada");
    } else if (categoria.toLowerCase() === "saidas") {
      transacoesFiltradas = transacoesFiltradas.filter(t => t.tipo.toLowerCase() === "saida");
    }
  }
  
  // Preparar dados para Excel
  const entradasData = transacoesFiltradas
    .filter((t: TransacaoExport) => t.tipo === "entrada")
    .map((t: TransacaoExport) => ({
      Tipo: t.categoria || "Entrada",
      Descrição: t.descricao || "-",
      Membro: t.membroNome || "Não nominal",
      Método: t.formaPagamento || "-",
      Data: toDate(t.data).toLocaleDateString(),
      Valor: t.valor.toFixed(2)
    }));
  
  const saidasData = transacoesFiltradas
    .filter((t: TransacaoExport) => t.tipo === "saida")
    .map((t: TransacaoExport) => ({
      Tipo: t.categoria || "Saída",
      Descrição: t.descricao || "-",
      Data: toDate(t.data).toLocaleDateString(),
      Valor: t.valor.toFixed(2)
    }));
  
  // Calcular totais
  const totalEntradas = transacoesFiltradas
    .filter((t: TransacaoExport) => t.tipo === "entrada")
    .reduce((sum: number, t: TransacaoExport) => sum + t.valor, 0);
  
  const totalSaidas = transacoesFiltradas
    .filter((t: TransacaoExport) => t.tipo === "saida")
    .reduce((sum: number, t: TransacaoExport) => sum + t.valor, 0);
  
  // Dados de resumo
  const resumoData = [
    { Item: "Total de Entradas", Valor: totalEntradas.toFixed(2) },
    { Item: "Total de Saídas", Valor: totalSaidas.toFixed(2) },
    { Item: "Saldo", Valor: (totalEntradas - totalSaidas).toFixed(2) }
  ];
  
  // Criar workbook
  const wb = XLSX.utils.book_new();
  
  // Adicionar planilha de resumo
  const wsResumo = XLSX.utils.json_to_sheet(resumoData);
  XLSX.utils.book_append_sheet(wb, wsResumo, "Resumo");
  
  // Adicionar planilha de entradas
  if (entradasData.length > 0) {
    const wsEntradas = XLSX.utils.json_to_sheet(entradasData);
    XLSX.utils.book_append_sheet(wb, wsEntradas, "Entradas");
  }
  
  // Adicionar planilha de saídas
  if (saidasData.length > 0) {
    const wsSaidas = XLSX.utils.json_to_sheet(saidasData);
    XLSX.utils.book_append_sheet(wb, wsSaidas, "Saídas");
  }
  
  // Adicionar planilha com todas as transações
  const allData = [
    ...entradasData.map(e => ({...e, Categoria: "Entrada"})),
    ...saidasData.map(s => ({...s, Categoria: "Saída"}))
  ];
  if (allData.length > 0) {
    const wsAll = XLSX.utils.json_to_sheet(allData);
    XLSX.utils.book_append_sheet(wb, wsAll, "Todas Transações");
  }
  
  // Salvar arquivo
  XLSX.writeFile(wb, "relatorio-financeiro.xlsx");
};

/**
 * Exporta relatório de membros em PDF
 * @param membros Lista de membros a serem exportados
 */
export const exportarMembrosPDF = (membros: MembroExport[]) => {
  // Criar novo documento PDF
  const doc = new jspdf();
  
  // Adicionar título
  doc.setFontSize(18);
  doc.text("Relatório de Membros", 105, 20, { align: "center" });
  
  // Adicionar data atual
  doc.setFontSize(12);
  doc.text(`Data: ${new Date().toLocaleDateString()}`, 105, 30, { align: "center" });
  
  // Adicionar estatísticas
  doc.setFontSize(14);
  doc.text("Estatísticas", 20, 50);
  
  doc.setFontSize(12);
  doc.text(`Total de Membros: ${membros.length}`, 20, 60);
  
  const membrosBatizados = membros.filter((m: MembroExport) => m.batizado).length;
  const percentualBatizados = membros.length > 0 ? Math.round(membrosBatizados / membros.length * 100) : 0;
  doc.text(`Membros Batizados: ${membrosBatizados} (${percentualBatizados}%)`, 20, 70);
  
  const membrosDizimistas = membros.filter((m: MembroExport) => m.dizimista).length;
  const percentualDizimistas = membros.length > 0 ? Math.round(membrosDizimistas / membros.length * 100) : 0;
  doc.text(`Dizimistas: ${membrosDizimistas} (${percentualDizimistas}%)`, 20, 80);
  
  // Adicionar distribuição por gênero
  const masculino = membros.filter((m: MembroExport) => m.genero === "masculino").length;
  const feminino = membros.filter((m: MembroExport) => m.genero === "feminino").length;
  const percentualMasculino = membros.length > 0 ? Math.round(masculino / membros.length * 100) : 0;
  const percentualFeminino = membros.length > 0 ? Math.round(feminino / membros.length * 100) : 0;
  
  doc.setFontSize(14);
  doc.text("Distribuição por Gênero", 20, 100);
  
  doc.setFontSize(12);
  doc.text(`Masculino: ${masculino} (${percentualMasculino}%)`, 20, 110);
  doc.text(`Feminino: ${feminino} (${percentualFeminino}%)`, 20, 120);
  
  // Adicionar lista de membros
  doc.setFontSize(14);
  doc.text("Lista de Membros", 20, 140);
  
  doc.setFontSize(10);
  doc.text("Nome", 20, 150);
  doc.text("Telefone", 80, 150);
  doc.text("Função", 130, 150);
  doc.text("Status", 170, 150);
  
  let y = 160;
  membros.forEach((membro: MembroExport) => {
    doc.text(membro.nome || "-", 20, y);
    doc.text(membro.telefone || "-", 80, y);
    doc.text(membro.funcao || "-", 130, y);
    
    let status = [];
    if (membro.batizado) status.push("Batizado");
    if (membro.dizimista) status.push("Dizimista");
    doc.text(status.join(", ") || "-", 170, y);
    
    y += 10;
    
    // Se a página estiver cheia, adicionar nova página
    if (y > 280) {
      doc.addPage();
      
      // Adicionar cabeçalho na nova página
      doc.setFontSize(10);
      doc.text("Nome", 20, 20);
      doc.text("Telefone", 80, 20);
      doc.text("Função", 130, 20);
      doc.text("Status", 170, 20);
      
      y = 30;
    }
  });
  
  // Salvar o PDF
  doc.save("relatorio-membros.pdf");
};

/**
 * Exporta relatório de membros em Excel
 * @param membros Lista de membros a serem exportados
 */
export const exportarMembrosExcel = (membros: MembroExport[]) => {
  // Preparar dados para Excel
  const membrosData = membros.map((m: MembroExport) => ({
    Nome: m.nome || "-",
    Telefone: m.telefone || "-",
    Idade: m.idade || "-",
    "Data de Nascimento": m.dataNascimento ? toDate(m.dataNascimento).toLocaleDateString() : "-",
    Função: m.funcao || "-",
    Profissão: m.profissao || "-",
    "Estado Civil": m.estadoCivil || "-",
    Gênero: m.genero || "-",
    Batizado: m.batizado ? "Sim" : "Não",
    Dizimista: m.dizimista ? "Sim" : "Não"
  }));
  
  // Estatísticas
  const membrosBatizados = membros.filter((m: MembroExport) => m.batizado).length;
  const percentualBatizados = membros.length > 0 ? Math.round(membrosBatizados / membros.length * 100) : 0;
  
  const membrosDizimistas = membros.filter((m: MembroExport) => m.dizimista).length;
  const percentualDizimistas = membros.length > 0 ? Math.round(membrosDizimistas / membros.length * 100) : 0;
  
  const masculino = membros.filter((m: MembroExport) => m.genero === "masculino").length;
  const feminino = membros.filter((m: MembroExport) => m.genero === "feminino").length;
  const percentualMasculino = membros.length > 0 ? Math.round(masculino / membros.length * 100) : 0;
  const percentualFeminino = membros.length > 0 ? Math.round(feminino / membros.length * 100) : 0;
  
  const estatisticasData = [
    ["Total de Membros", membros.length.toString()],
    ["Membros Batizados", membrosBatizados.toString(), `${percentualBatizados.toString()}%`],
    ["Dizimistas", membrosDizimistas.toString(), `${percentualDizimistas.toString()}%`],
    [],
    ["Distribuição por Gênero"],
    ["Masculino", masculino.toString(), `${percentualMasculino.toString()}%`],
    ["Feminino", feminino.toString(), `${percentualFeminino.toString()}%`]
  ];
  
  // Criar workbook
  const wb = XLSX.utils.book_new();
  
  // Adicionar planilha de estatísticas
  const wsEstatisticas = XLSX.utils.aoa_to_sheet(estatisticasData);
  XLSX.utils.book_append_sheet(wb, wsEstatisticas, "Estatísticas");
  
  // Adicionar planilha com lista de membros
  if (membrosData.length > 0) {
    const wsMembros = XLSX.utils.json_to_sheet(membrosData);
    XLSX.utils.book_append_sheet(wb, wsMembros, "Lista de Membros");
  }
  
  // Salvar arquivo
  XLSX.writeFile(wb, "relatorio-membros.xlsx");
};
