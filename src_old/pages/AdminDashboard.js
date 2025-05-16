import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../../src/firebase'; // Certifique-se que este caminho está correto
import { useAuth } from '../contexts/AuthContext'; // Importa o hook de autenticação

// Componentes de Card (exemplo, ajuste conforme seu design)
const Card = ({ title, value, loading }) => (
  <div style={{ border: '1px solid #ccc', padding: '15px', margin: '10px', minWidth: '150px', textAlign: 'center' }}>
    <h4>{title}</h4>
    {loading ? <p>Carregando...</p> : <h2>{value}</h2>}
  </div>
);

function AdminDashboard() {
  const { usuario, igrejaId } = useAuth(); // Obtém o usuário e o igrejaId do contexto
  const [totalMembros, setTotalMembros] = useState(0);
  const [totalEntradas, setTotalEntradas] = useState(0);
  const [totalSaidas, setTotalSaidas] = useState(0);
  const [saldo, setSaldo] = useState(0);
  const [loadingMembros, setLoadingMembros] = useState(true);
  const [loadingFinanceiro, setLoadingFinanceiro] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Só busca os dados se tivermos um igrejaId
    if (!igrejaId) {
      console.log('AdminDashboard: Aguardando igrejaId...');
      // Pode definir loading como false aqui se quiser mostrar uma mensagem específica
      // ou manter true até que igrejaId esteja disponível.
      setLoadingMembros(false);
      setLoadingFinanceiro(false);
      // Se não houver igrejaId após um tempo, pode ser um erro de configuração
      if (usuario && !igrejaId) {
          console.error("Erro: Usuário logado, mas igrejaId não encontrado no Firestore em 'usuarios_auth'. Verifique o mapeamento.");
          setError("Não foi possível carregar os dados da igreja. Verifique a configuração.");
      }
      return; // Sai do useEffect se não houver igrejaId
    }

    console.log(`AdminDashboard: Carregando dados para igrejaId: ${igrejaId}`);
    setError(null); // Limpa erros anteriores
    setLoadingMembros(true);
    setLoadingFinanceiro(true);

    // --- Busca Total de Membros --- 
    const fetchMembros = async () => {
      try {
        const membrosCollectionRef = collection(db, 'igrejas', igrejaId, 'membros');
        const snapshot = await getDocs(membrosCollectionRef);
        setTotalMembros(snapshot.size); // .size dá o número de documentos na coleção
        console.log(`AdminDashboard: Total de membros carregados: ${snapshot.size}`);
      } catch (err) {
        console.error('Erro ao buscar total de membros:', err);
        setError('Erro ao carregar número de membros.');
      } finally {
        setLoadingMembros(false);
      }
    };

    // --- Busca Dados Financeiros (Entradas, Saídas) --- 
    const fetchFinanceiro = async () => {
      try {
        const transacoesCollectionRef = collection(db, 'igrejas', igrejaId, 'transacoes');
        const snapshot = await getDocs(transacoesCollectionRef);
        
        let entradas = 0;
        let saidas = 0;

        snapshot.forEach(doc => {
          const data = doc.data();
          // Verifica se o valor é numérico antes de somar
          const valorNumerico = parseFloat(data.valor);
          if (!isNaN(valorNumerico)) {
              if (data.tipo === 'entrada') {
                  entradas += valorNumerico;
              } else if (data.tipo === 'saida') {
                  saidas += valorNumerico;
              }
          } else {
              console.warn(`Valor não numérico encontrado na transação ${doc.id}:`, data.valor);
          }
        });

        setTotalEntradas(entradas);
        setTotalSaidas(saidas);
        setSaldo(entradas - saidas);
        console.log(`AdminDashboard: Dados financeiros carregados - Entradas: ${entradas}, Saídas: ${saidas}, Saldo: ${entradas - saidas}`);

      } catch (err) {
        console.error('Erro ao buscar dados financeiros:', err);
        setError('Erro ao carregar dados financeiros.');
      } finally {
        setLoadingFinanceiro(false);
      }
    };

    fetchMembros();
    fetchFinanceiro();

  }, [igrejaId, usuario]); // Re-executa quando igrejaId ou usuario mudarem

  // Formata valores como moeda (exemplo simples)
  const formatCurrency = (value) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  if (error) {
      return <div style={{ color: 'red', padding: '20px' }}>Erro: {error}</div>;
  }

  // Renderiza o dashboard
  return (
    <div>
      <h2>Painel da Igreja</h2>
      {/* Mostra o ID da igreja para depuração (remover em produção) */} 
      {igrejaId ? <p style={{fontSize: '0.8em', color: 'grey'}}>ID da Igreja: {igrejaId}</p> : <p>Carregando informações da igreja...</p>}
      
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        <Card title="Total de Membros" value={totalMembros} loading={loadingMembros} />
        <Card title="Entradas" value={formatCurrency(totalEntradas)} loading={loadingFinanceiro} />
        <Card title="Saídas" value={formatCurrency(totalSaidas)} loading={loadingFinanceiro} />
        <Card title="Saldo" value={formatCurrency(saldo)} loading={loadingFinanceiro} />
        {/* Adicione mais cards ou componentes conforme necessário */} 
      </div>

      {/* Aqui você pode adicionar outros componentes do dashboard, 
          passando o igrejaId como prop se eles precisarem buscar dados específicos */} 
      {/* Exemplo: <ListaMembros igrejaId={igrejaId} /> */} 
      {/* Exemplo: <RelatorioFinanceiro igrejaId={igrejaId} /> */} 
    </div>
  );
}

export default AdminDashboard;

