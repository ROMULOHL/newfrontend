import Header from './Header';
import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { db } from '../../src/firebase';
import { useAuth } from '../contexts/AuthContext';
import useAutoLogout from '../hooks/useAutoLogout';

import FiltroFinanceiro from './FiltroFinanceiro';
import ResumoFinanceiro from './ResumoFinanceiro';
import GraficoFinanceiro from './GraficoFinanceiro';
import CadastroMembro from './CadastroMembro';
import CardDestaque from './CardDestaque';

function PainelIgreja() {
  useAutoLogout(5 * 60 * 1000);

  const [usuarios, setUsuarios] = useState([]);
  const [entradas, setEntradas] = useState(0);
  const [saidas, setSaidas] = useState(0);
  const [saldoAtual, setSaldoAtual] = useState(0);
  const [mesSelecionado, setMesSelecionado] = useState('');
  const [anoSelecionado, setAnoSelecionado] = useState('');
  const [dadosFinanceiros, setDadosFinanceiros] = useState([]);
  const [carregandoPainel, setCarregandoPainel] = useState(true);

  const { igrejaId, carregando: carregandoAuth } = useAuth();

  useEffect(() => {
    if (!carregandoAuth && igrejaId) {
      const fetchUsuarios = async () => {
        try {
          console.log(`PainelIgreja: Buscando membros em /igrejas/${igrejaId}/membros`);
          const usuariosRef = collection(db, 'igrejas', igrejaId, 'membros');
          const snapshot = await getDocs(usuariosRef);
          const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setUsuarios(lista);
          console.log("PainelIgreja: Membros carregados:", lista);
        } catch (error) {
          console.error('PainelIgreja: Erro ao buscar usuários/membros:', error);
          setUsuarios([]);
        }
      };
      fetchUsuarios();
    } else if (!carregandoAuth && !igrejaId) {
      console.warn("PainelIgreja: igrejaId não disponível no contexto para buscar membros.");
      setUsuarios([]);
    }
  }, [igrejaId, carregandoAuth]);

  useEffect(() => {
    if (!carregandoAuth && igrejaId) {
      const fetchFinanceiro = async () => {
        setCarregandoPainel(true);
        try {
          console.log(`PainelIgreja: Buscando transações em /igrejas/${igrejaId}/transacoes`);
          const financeiroRef = collection(db, 'igrejas', igrejaId, 'transacoes');
          const snapshot = await getDocs(financeiroRef);

          let totalEntradas = 0;
          let totalSaidas = 0;
          let listaFiltrada = [];

          snapshot.forEach(doc => {
            const data = doc.data();
            const tipo = data.tipo?.toLowerCase().trim();
            const valor = Number(data.valor) || 0;
            const dataMov = data.data?.seconds ? new Date(data.data.seconds * 1000) : new Date();
            const mes = dataMov.getMonth() + 1;
            const ano = dataMov.getFullYear();

            const filtroMes = mesSelecionado === '' || parseInt(mesSelecionado) === mes;
            const filtroAno = anoSelecionado === '' || parseInt(anoSelecionado) === ano;

            if (filtroMes && filtroAno) {
              listaFiltrada.push({ ...data, id: doc.id, dataFormatada: dataMov.toLocaleDateString('pt-BR') });

              if (["entrada", "dizimo", "dízimo", "oferta"].includes(tipo)) {
                totalEntradas += valor;
              } else if (["saida", "saída"].includes(tipo)) {
                totalSaidas += valor;
              }
            }
          });

          setEntradas(totalEntradas);
          setSaidas(totalSaidas);
          setSaldoAtual(totalEntradas - totalSaidas);
          setDadosFinanceiros(listaFiltrada);
          console.log("PainelIgreja: Dados financeiros carregados e processados.");
        } catch (error) {
          console.error("PainelIgreja: Erro ao buscar financeiro:", error);
          setDadosFinanceiros([]);
          setEntradas(0);
          setSaidas(0);
          setSaldoAtual(0);
        } finally {
          setCarregandoPainel(false);
        }
      };
      fetchFinanceiro();
    } else if (!carregandoAuth && !igrejaId) {
      console.warn("PainelIgreja: igrejaId não disponível no contexto para buscar finanças.");
      setCarregandoPainel(false);
      setDadosFinanceiros([]);
      setEntradas(0);
      setSaidas(0);
      setSaldoAtual(0);
    }
  }, [igrejaId, carregandoAuth, mesSelecionado, anoSelecionado]);

  const exportarFinanceiroPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Relatório Financeiro da Igreja", 14, 20);
    doc.setFontSize(12);
    doc.text(`Mês: ${mesSelecionado || 'Todos'}`, 14, 30);
    doc.text(`Ano: ${anoSelecionado || 'Todos'}`, 14, 38);
    doc.text(`Total de Entradas: R$ ${entradas.toFixed(2)}`, 14, 50);
    doc.text(`Total de Saídas: R$ ${saidas.toFixed(2)}`, 14, 58);
    doc.text(`Saldo Atual: R$ ${saldoAtual.toFixed(2)}`, 14, 66);
    const rows = dadosFinanceiros.map(item => [
      item.tipo,
      `R$ ${Number(item.valor).toFixed(2)}`,
      item.descricao || '-',
      item.dataFormatada
    ]);
    doc.autoTable({
      startY: 75,
      head: [['Tipo', 'Valor', 'Descrição', 'Data']],
      body: rows
    });
    doc.save("relatorio-financeiro.pdf");
  };

  const exportarFinanceiroExcel = () => {
    const dadosParaExportar = dadosFinanceiros.map(item => ({
      Tipo: item.tipo || '',
      Valor: Number(item.valor).toFixed(2) || '0.00',
      Descrição: item.descricao || '',
      Data: item.dataFormatada || ''
    }));
    const ws = XLSX.utils.json_to_sheet(dadosParaExportar);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Financeiro');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const arquivo = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(arquivo, 'financeiro_igreja.xlsx');
  };

  if (carregandoAuth) {
    return (
      <div className="painel-completo">
        <Header />
        <div className="conteudo-painel" style={{ textAlign: 'center', marginTop: '50px' }}>
          <p>Carregando dados de autenticação...</p>
        </div>
      </div>
    );
  }

  if (!igrejaId) {
    return (
      <div className="painel-completo">
        <Header />
        <div className="conteudo-painel" style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>
          <p>Erro: Igreja ID não encontrado para o usuário.</p>
          <p>Verifique se o usuário está corretamente associado a uma igreja no sistema.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="painel-completo">
      <Header />
      <div className="conteudo-painel">
        <h1>Painel da Igreja (ID: {igrejaId})</h1>
        <div className="card-container">
          <CardDestaque titulo="Total de Membros" valor={usuarios.length} />
          <CardDestaque titulo="Total de Dizimistas" valor={usuarios.filter(u => u.dizimista).length} />
          <CardDestaque titulo="Batizados" valor={usuarios.filter(u => u.batizado).length} />
          <CardDestaque titulo="Entradas" valor={`R$ ${entradas.toFixed(2)}`} corTitulo="#27ae60" corValor="#27ae60" />
          <CardDestaque titulo="Saídas" valor={`R$ ${saidas.toFixed(2)}`} corTitulo="#c0392b" corValor="#c0392b" />
          <CardDestaque titulo="Saldo Atual" valor={`R$ ${saldoAtual.toFixed(2)}`} corTitulo="#2980b9" corValor="#2980b9" />
        </div>
        <CadastroMembro />
        <FiltroFinanceiro
          mesSelecionado={mesSelecionado}
          setMesSelecionado={setMesSelecionado}
          anoSelecionado={anoSelecionado}
          setAnoSelecionado={setAnoSelecionado}
        />
        {carregandoPainel ? (
          <p style={{ textAlign: 'center', margin: '20px' }}>Carregando dados financeiros...</p>
        ) : dadosFinanceiros.length > 0 ? (
          <>
            <ResumoFinanceiro entradas={entradas} saidas={saidas} saldoAtual={saldoAtual} />
            <GraficoFinanceiro entradas={entradas} saidas={saidas} />
            <div style={{ marginTop: '20px', marginBottom: '20px', textAlign: 'center' }}>
              <button onClick={exportarFinanceiroPDF} style={{ marginRight: '10px', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                Exportar PDF
              </button>
              <button onClick={exportarFinanceiroExcel} style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                Exportar Excel
              </button>
            </div>
            <div style={{ marginTop: '30px', overflowX: 'auto' }}>
              <h3>Detalhes das Transações</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ddd', backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Tipo</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Valor (R$)</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Descrição</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {dadosFinanceiros.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px' }}>{item.tipo}</td>
                      <td style={{ padding: '12px' }}>{Number(item.valor).toFixed(2)}</td>
                      <td style={{ padding: '12px' }}>{item.descricao || '-'}</td>
                      <td style={{ padding: '12px' }}>{item.dataFormatada}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p style={{ textAlign: 'center', margin: '20px' }}>Nenhuma transação encontrada para o período selecionado.</p>
        )}
      </div>
    </div>
  );
}

export default PainelIgreja;