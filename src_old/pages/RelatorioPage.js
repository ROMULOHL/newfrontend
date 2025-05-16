// src/pages/RelatorioPage.js
import React, { useEffect, useState, useCallback } from 'react';
import Header from '../components/Header'; // Assumindo que Header não precisa de igrejaId
import GraficoResumoRelatorio from '../components/GraficoResumoRelatorio'; // Assumindo que este recebe dados como props
import { collection, getDocs, query, where, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '../../src/firebase';
import { useAuth } from '../contexts/AuthContext'; // Importa o hook de autenticação
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import './RelatorioPage.css'; // Mantém seu CSS

// Função auxiliar para formatar moeda
const formatCurrency = (value) => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// Função auxiliar para formatar data (dd/mm/yyyy)
const formatDate = (timestamp) => {
  if (!timestamp?.seconds) return '-';
  return new Date(timestamp.seconds * 1000).toLocaleDateString('pt-BR');
};

function RelatorioPage() {
  const { igrejaId, carregando } = useAuth(); // Obtém o igrejaId e o estado de carregamento do contexto
  const [transacoes, setTransacoes] = useState([]);
  const [membros, setMembros] = useState([]); 
  const [loading, setLoading] = useState(true); // Loading específico da página de relatório
  const [error, setError] = useState(null);

  // Estados dos Filtros
  const [nomeBusca, setNomeBusca] = useState('');
  const [tipoBusca, setTipoBusca] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  // Dados para o gráfico e totais
  const [entradasTotal, setEntradasTotal] = useState(0);
  const [saidasTotal, setSaidasTotal] = useState(0);
  const [saldoTotal, setSaldoTotal] = useState(0);
  const [transacoesFiltradas, setTransacoesFiltradas] = useState([]);

  useEffect(() => {
    if (carregando || !igrejaId) {
      setMembros([]); // Limpa membros se não estiver pronto
      return;
    }
    const fetchNomesMembros = async () => {
      try {
        const membrosRef = collection(db, 'igrejas', igrejaId, 'membros');
        const snapshot = await getDocs(query(membrosRef, orderBy('nome')));
        setMembros(snapshot.docs.map(doc => ({ id: doc.id, nome: doc.data().nome })));
      } catch (err) {
        console.error("Erro ao buscar nomes de membros:", err);
      }
    };
    fetchNomesMembros();
  }, [igrejaId, carregando]); // CORRETO: depende de igrejaId e carregando

  const fetchAndFilterTransacoes = useCallback(async () => {
    if (carregando || !igrejaId) {
      setLoading(false); 
      setTransacoes([]);
      setTransacoesFiltradas([]);
      setEntradasTotal(0);
      setSaidasTotal(0);
      setSaldoTotal(0);
      return;
    }

    setLoading(true);
    setError(null);
    console.log(`RelatorioPage: Buscando transações para igrejaId: ${igrejaId}`);

    try {
      const transacoesRef = collection(db, 'igrejas', igrejaId, 'transacoes');
      let q = query(transacoesRef, orderBy('data', 'desc'));

      if (dataInicio) {
        q = query(q, where('data', '>=', Timestamp.fromDate(new Date(dataInicio + 'T00:00:00'))));
      }
      if (dataFim) {
        q = query(q, where('data', '<=', Timestamp.fromDate(new Date(dataFim + 'T23:59:59'))));
      }
      if (tipoBusca) {
          q = query(q, where('tipo', '==', tipoBusca));
      }

      const snapshot = await getDocs(q);
      const todasTransacoes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransacoes(todasTransacoes);
      console.log(`RelatorioPage: ${todasTransacoes.length} transações carregadas.`);

      const filtradas = todasTransacoes.filter(t =>
        !nomeBusca || t.nomeMembro?.toLowerCase().includes(nomeBusca.toLowerCase())
      );
      setTransacoesFiltradas(filtradas);

      let entradasCalc = 0;
      let saidasCalc = 0;
      filtradas.forEach(t => {
        const valor = parseFloat(t.valor) || 0;
        if (t.tipo === 'entrada') {
          entradasCalc += valor;
        } else if (t.tipo === 'saida') {
          saidasCalc += valor;
        }
      });
      setEntradasTotal(entradasCalc);
      setSaidasTotal(saidasCalc);
      setSaldoTotal(entradasCalc - saidasCalc);

    } catch (err) {
      console.error("Erro ao buscar transações:", err);
      setError("Falha ao carregar dados financeiros.");
      setTransacoes([]);
      setTransacoesFiltradas([]);
    } finally {
      setLoading(false);
    }
  }, [igrejaId, dataInicio, dataFim, tipoBusca, nomeBusca, carregando]); // << CORRIGIDO AQUI: adicionado 'carregando'

  useEffect(() => {
    fetchAndFilterTransacoes();
  }, [fetchAndFilterTransacoes]);

  const exportarPDF = () => {
    if (!transacoesFiltradas.length) {
        alert("Nenhum dado financeiro para exportar com os filtros atuais.");
        return;
    }
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Relatório Financeiro - ${igrejaId}`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Período: ${dataInicio || 'Início'} a ${dataFim || 'Fim'} | Tipo: ${tipoBusca || 'Todos'} | Nome: ${nomeBusca || 'Todos'}`, 14, 26);

    doc.autoTable({
      startY: 35,
      head: [["Data", "Tipo", "Descrição", "Nome Membro", "Valor"]],
      body: transacoesFiltradas.map(t => [
        formatDate(t.data),
        t.tipo,
        t.descricao || '-',
        t.nomeMembro || '-',
        formatCurrency(parseFloat(t.valor) || 0)
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [22, 160, 133] },
      footStyles: { fillColor: [200, 200, 200] },
      showFoot: 'lastPage',
      foot: [[ "", "", "", `Entradas: ${formatCurrency(entradasTotal)}`, `Saídas: ${formatCurrency(saidasTotal)}`, `Saldo: ${formatCurrency(saldoTotal)}` ]]
    });

    doc.save(`relatorio-financeiro-${igrejaId}.pdf`);
  };

  const exportarExcel = () => {
     if (!transacoesFiltradas.length) {
        alert("Nenhum dado financeiro para exportar com os filtros atuais.");
        return;
    }
    const dadosParaPlanilha = transacoesFiltradas.map(t => ({
      Data: formatDate(t.data),
      Tipo: t.tipo,
      Descrição: t.descricao || '-',
      Nome_Membro: t.nomeMembro || '-',
      Valor: parseFloat(t.valor) || 0
    }));
    dadosParaPlanilha.push({}); 
    dadosParaPlanilha.push({ Descrição: 'TOTAL ENTRADAS', Valor: entradasTotal });
    dadosParaPlanilha.push({ Descrição: 'TOTAL SAÍDAS', Valor: saidasTotal });
    dadosParaPlanilha.push({ Descrição: 'SALDO', Valor: saldoTotal });

    const planilha = XLSX.utils.json_to_sheet(dadosParaPlanilha);
    planilha['!cols'] = [{ wch: 12 }, { wch: 10 }, { wch: 40 }, { wch: 25 }, { wch: 15 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, planilha, 'Financeiro');

    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const arquivo = new Blob([buffer], { type: 'application/octet-stream' });
    saveAs(arquivo, `relatorio-financeiro-${igrejaId}.xlsx`);
  };

  // Adiciona uma renderização de carregamento enquanto o AuthContext está carregando
  if (carregando) {
    return (
      <div className="painel-completo">
        <Header />
        <div className="conteudo-relatorio">
          <h1 className="titulo-relatorio">Relatório Financeiro</h1>
          <p>Carregando informações do usuário...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="painel-completo">
      <Header />
      <div className="conteudo-relatorio"> 
        <h1 className="titulo-relatorio">Relatório Financeiro</h1>
        {igrejaId ? <p className="id-igreja-info">Igreja: {igrejaId}</p> : <p>ID da Igreja não disponível.</p>} {/* Mensagem mais clara se igrejaId for null após carregamento */}

        <div className="filtros-container">
          <input
            type="text"
            placeholder="Filtrar por nome (associado à transação)"
            value={nomeBusca}
            onChange={(e) => setNomeBusca(e.target.value)}
            className="filtro-input"
            disabled={!igrejaId} // Desabilita se não houver igrejaId
          />
          <select value={tipoBusca} onChange={(e) => setTipoBusca(e.target.value)} className="filtro-select" disabled={!igrejaId}>
            <option value="">Todos os Tipos</option>
            <option value="entrada">Entrada</option>
            <option value="saida">Saída</option>
          </select>
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="filtro-input"
            title="Data Início"
            disabled={!igrejaId}
          />
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="filtro-input"
            title="Data Fim"
            disabled={!igrejaId}
          />
        </div>

        <div className="botoes-relatorio">
          <button className="botao-exportar pdf" onClick={exportarPDF} disabled={loading || !transacoesFiltradas.length || !igrejaId}>
            📄 Exportar PDF
          </button>
          <button className="botao-exportar excel" onClick={exportarExcel} disabled={loading || !transacoesFiltradas.length || !igrejaId}>
            📊 Exportar Excel
          </button>
        </div>

        <div className="resumo-financeiro">
            <div className="grafico-container">
                 {(loading && igrejaId) ? <p>Carregando gráfico...</p> : 
                    <GraficoResumoRelatorio 
                        entradas={entradasTotal} 
                        saidas={saidasTotal} 
                        saldo={saldoTotal} 
                    />
                 }
            </div>
            <div className="totais-container">
                <div className="total-item">Entradas: <span>{formatCurrency(entradasTotal)}</span></div>
                <div className="total-item">Saídas: <span>{formatCurrency(saidasTotal)}</span></div>
                <div className="total-item saldo">Saldo: <span>{formatCurrency(saldoTotal)}</span></div>
            </div>
        </div>

        <div className="tabela-container">
          <h2>Transações Detalhadas</h2>
          {(loading && igrejaId) ? (
            <p>Carregando transações...</p>
          ) : error ? (
            <p style={{ color: 'red' }}>Erro: {error}</p>
          ) : !igrejaId ? (
            <p>ID da Igreja não carregado. Verifique o login ou associação à igreja.</p> // Mensagem mais específica
          ) : transacoesFiltradas.length === 0 ? (
            <p>Nenhuma transação encontrada com os filtros aplicados.</p>
          ) : (
            <table className="tabela-relatorio"> 
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Tipo</th>
                  <th>Descrição</th>
                  <th>Nome Associado</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {transacoesFiltradas.map(t => (
                  <tr key={t.id}>
                    <td>{formatDate(t.data)}</td>
                    <td className={`tipo-${t.tipo}`}>{t.tipo}</td> 
                    <td>{t.descricao || '-'}</td>
                    <td>{t.nomeMembro || '-'}</td>
                    <td className={`valor-${t.tipo}`}>{formatCurrency(parseFloat(t.valor) || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}

export default RelatorioPage;

