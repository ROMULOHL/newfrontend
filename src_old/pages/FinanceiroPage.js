// src/pages/FinanceiroPage.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../../src/firebase';
import {
  collection, query, orderBy, getDocs, addDoc, Timestamp
} from 'firebase/firestore';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import MetricCard from '../components/MetricCard/MetricCard';
import './FinanceiroPage.css';

const categoriasDespesa = {
  "Manutenção e Despesas Operacionais": [
    "Aluguel do Templo/Salão", "Contas de Consumo - Água", "Contas de Consumo - Luz",
    "Contas de Consumo - Gás", "Contas de Consumo - Telefone/Internet", "Seguro do Prédio",
    "Manutenção e Reparos do Prédio", "Material de Limpeza", "Material de Escritório",
    "Serviços Contábeis/Jurídicos", "Taxas Bancárias"
  ],
  "Ministérios e Departamentos": [
    "Departamento Infantil", "Departamento de Jovens", "Departamento de Casais",
    "Departamento de Missões", "Outros Departamentos"
  ],
  "Eventos e Atividades": [
    "Eventos Especiais (Conferências, Retiros)", "Atividades Comunitárias", "Evangelismo"
  ],
  "Recursos Humanos e Pessoal": [
    "Salários e Encargos (Pastores, Funcionários)", "Benefícios (Plano de Saúde, etc.)",
    "Treinamento e Desenvolvimento"
  ],
  "Doações e Assistência Social": ["Ajuda a Necessitados", "Ofertas para Outras Organizações"],
  "Outras Despesas": ["Despesas Diversas"]
};

const subcategoriasEntrada = [
  "Dízimo", "Oferta", "Campanha", "Doação", "Outras Entradas"
];

const PIE_CHART_COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#E7E9ED', '#8A2BE2', '#5F9EA0', '#D2691E'];

const formatCurrency = (value) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function FinanceiroPage() {
  const { currentUser, igrejaId } = useAuth();

  const [transacoes, setTransacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [tipo, setTipo] = useState('saida');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [categoriaSaida, setCategoriaSaida] = useState('');
  const [subcategoriaEntrada, setSubcategoriaEntrada] = useState('');

  const fetchTransacoes = useCallback(async () => {
    if (!currentUser || !igrejaId) {
      setTransacoes([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const transacoesRef = collection(db, 'igrejas', igrejaId, 'transacoes');
      const q = query(transacoesRef, orderBy('data', 'desc'));
      const querySnapshot = await getDocs(q);
      const transacoesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        data: doc.data().data?.toDate ? doc.data().data.toDate() : new Date(doc.data().data)
      }));
      setTransacoes(transacoesData);
    } catch (err) {
      console.error("Erro ao buscar transações:", err);
      setError("Falha ao carregar transações.");
    } finally {
      setLoading(false);
    }
  }, [currentUser, igrejaId]);

  useEffect(() => {
    if (currentUser && igrejaId) {
      fetchTransacoes();
    } else if (!currentUser) {
      setLoading(false);
    }
  }, [currentUser, igrejaId, fetchTransacoes]);

  const handleAddTransacao = async (e) => {
    e.preventDefault();
    setError(null);

    if (!currentUser || !igrejaId) {
      setError("Usuário não autenticado ou ID da Igreja não encontrado.");
      return;
    }
    if (!descricao.trim() || !valor || !data) {
      setError("Descrição, valor e data são obrigatórios.");
      return;
    }

    const valorNumerico = parseFloat(valor);
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      setError("Valor inválido. Deve ser positivo.");
      return;
    }
    if (tipo === 'saida' && !categoriaSaida) {
      setError("Categoria é obrigatória para saídas.");
      return;
    }
    if (tipo === 'entrada' && !subcategoriaEntrada) {
      setError("Subcategoria é obrigatória para entradas.");
      return;
    }

    setLoading(true);
    try {
      const transacoesCollectionRef = collection(db, 'igrejas', igrejaId, 'transacoes');
      const novaTransacao = {
        tipo,
        descricao,
        valor: valorNumerico,
        data: Timestamp.fromDate(new Date(data + 'T00:00:00')),
        categoria: tipo === 'saida' ? categoriaSaida : subcategoriaEntrada,
        registradoPor: currentUser.uid,
        registradoEm: Timestamp.now()
      };

      const docRef = await addDoc(transacoesCollectionRef, novaTransacao);

      setDescricao('');
      setValor('');
      setData(new Date().toISOString().slice(0, 10));
      setCategoriaSaida('');
      setSubcategoriaEntrada('');
      setTipo('saida');

      setTransacoes(prev => [
        { id: docRef.id, ...novaTransacao, data: novaTransacao.data.toDate() },
        ...prev
      ].sort((a, b) => b.data - a.data));
    } catch (err) {
      console.error("Erro ao adicionar transação:", err);
      setError("Erro ao adicionar transação.");
    } finally {
      setLoading(false);
    }
  };

  const totalReceitas = useMemo(
    () => transacoes.reduce((acc, t) => t.tipo === 'entrada' ? acc + t.valor : acc, 0),
    [transacoes]
  );

  const totalDespesas = useMemo(
    () => transacoes.reduce((acc, t) => t.tipo === 'saida' ? acc + t.valor : acc, 0),
    [transacoes]
  );

  const saldo = useMemo(() => totalReceitas - totalDespesas, [totalReceitas, totalDespesas]);

  const despesasPorCategoriaData = useMemo(() => {
    const gastos = {};
    transacoes.forEach(t => {
      if (t.tipo === 'saida' && t.categoria) {
        gastos[t.categoria] = (gastos[t.categoria] || 0) + t.valor;
      }
    });
    return Object.entries(gastos).map(([name, value]) => ({ name, value }));
  }, [transacoes]);

  if (!currentUser) {
    return <div className="financeiro-page-container"><p className="loading-message">Carregando usuário...</p></div>;
  }

  if (!igrejaId) {
    return <div className="financeiro-page-container"><p className="loading-message">ID da Igreja não encontrado.</p></div>;
  }

  return (
    <div className="financeiro-page-container">
      <h1>Painel Financeiro</h1>

      <div className="metricas-container">
        <MetricCard
          titulo="Receitas do Período"
          valor={formatCurrency(totalReceitas)}
          tipo="entrada"
        />
        <MetricCard
          titulo="Despesas do Período"
          valor={formatCurrency(totalDespesas)}
          tipo="saida"
        />
        <MetricCard
          titulo="Saldo do Período"
          valor={formatCurrency(saldo)}
          tipo={saldo >= 0 ? 'entrada' : 'saida'}
        />
      </div>

      {despesasPorCategoriaData.length > 0 && (
        <div className="graficos-container card-style">
          <h2>Distribuição de Despesas por Categoria</h2>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={despesasPorCategoriaData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {despesasPorCategoriaData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={formatCurrency} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      <form onSubmit={handleAddTransacao} className="form-nova-transacao card-style">
        <h2>Nova Transação</h2>
        {error && <p className="error-message">{error}</p>}
        <div className="input-group">
          <label htmlFor="tipoTransacao">Tipo:</label>
          <select id="tipoTransacao" value={tipo} onChange={(e) => setTipo(e.target.value)} required>
            <option value="saida">Saída</option>
            <option value="entrada">Entrada</option>
          </select>
        </div>
        <div className="input-group">
          <label htmlFor="descricaoTransacao">Descrição:</label>
          <input id="descricaoTransacao" type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)} required />
        </div>
        <div className="input-group">
          <label htmlFor="valorTransacao">Valor (R$):</label>
          <input id="valorTransacao" type="number" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} required />
        </div>
        <div className="input-group">
          <label htmlFor="dataTransacao">Data:</label>
          <input id="dataTransacao" type="date" value={data} onChange={(e) => setData(e.target.value)} required />
        </div>
        {tipo === 'saida' && (
          <div className="input-group">
            <label htmlFor="categoriaSaida">Categoria:</label>
            <select id="categoriaSaida" value={categoriaSaida} onChange={(e) => setCategoriaSaida(e.target.value)} required>
              <option value="">Selecione uma categoria</option>
              {Object.keys(categoriasDespesa).map(grupo => (
                <optgroup label={grupo} key={grupo}>
                  {categoriasDespesa[grupo].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        )}
        {tipo === 'entrada' && (
          <div className="input-group">
            <label htmlFor="subcategoriaEntrada">Subcategoria:</label>
            <select id="subcategoriaEntrada" value={subcategoriaEntrada} onChange={(e) => setSubcategoriaEntrada(e.target.value)} required>
              <option value="">Selecione uma subcategoria</option>
              {subcategoriasEntrada.map(subcat => (
                <option key={subcat} value={subcat}>{subcat}</option>
              ))}
            </select>
          </div>
        )}
        <button type="submit" disabled={loading}>Adicionar Transação</button>
      </form>

      <h2>Histórico de Transações</h2>
      {loading && !transacoes.length && <p className="loading-message">Carregando transações...</p>}
      {!loading && transacoes.length === 0 && !error && (
        <p className="no-transacoes-message">Nenhuma transação encontrada.</p>
      )}
      {!loading && transacoes.length > 0 && (
        <div className="tabela-historico-wrapper">
          <table className="tabela-historico">
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Tipo</th>
                <th>Valor (R$)</th>
                <th>Categoria/Subcategoria</th>
              </tr>
            </thead>
            <tbody>
              {transacoes.map((t) => (
                <tr key={t.id}>
                  <td data-label="Data">{t.data instanceof Date ? t.data.toLocaleDateString('pt-BR') : 'Data inválida'}</td>
                  <td data-label="Descrição">{t.descricao}</td>
                  <td data-label="Tipo">{t.tipo.charAt(0).toUpperCase() + t.tipo.slice(1)}</td>
                  <td data-label="Valor (R$)" className={t.tipo === 'entrada' ? 'valor-entrada' : 'valor-saida'}>
                    {typeof t.valor === 'number' ? formatCurrency(t.valor) : 'N/A'}
                  </td>
                  <td data-label="Categoria/Subcategoria">{t.categoria || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default FinanceiroPage;
