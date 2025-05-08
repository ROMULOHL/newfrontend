// src/components/RelatorioMembro.js
import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext'; // Importa o hook de autenticação

// Estilos (mantidos, mas considere CSS externo)
const cardStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  padding: '20px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  marginBottom: '20px',
};

const labelStyle = {
  fontWeight: 'bold',
  color: '#555',
  marginBottom: '4px',
  display: 'block',
  fontSize: '0.85em',
};

const valueStyle = {
  marginBottom: '10px',
  color: '#333',
  fontSize: '0.95em',
};

// Função auxiliar para formatar data (dd/mm/yyyy)
const formatDate = (timestamp) => {
  if (!timestamp?.seconds) {
    // Se não for um timestamp do Firestore, tenta tratar como string de data se já estiver formatada
    if (typeof timestamp === 'string' && (timestamp.includes('/') || timestamp.includes('-'))) {
        try {
            // Tenta normalizar e formatar datas como YYYY-MM-DD ou DD/MM/YYYY
            const date = new Date(timestamp.split('/').reverse().join('-')); // Converte DD/MM/YYYY para YYYY-MM-DD para o construtor Date
            if (!isNaN(date.getTime())) return date.toLocaleDateString('pt-BR');
        } catch (e) { /* ignora erro e continua */ }
    }
    return typeof timestamp === 'string' ? timestamp : '-'; // Retorna a string original se não puder formatar ou se não for timestamp
  }
  try {
    return new Date(timestamp.seconds * 1000).toLocaleDateString('pt-BR');
  } catch (e) {
    console.warn("Formato de data inesperado:", timestamp, e);
    return '-';
  }
};

function RelatorioMembro() {
  const authData = useAuth(); // Obtém o objeto de autenticação completo
  const [membros, setMembros] = useState([]);
  const [loadingMembros, setLoadingMembros] = useState(true); // Renomeado para clareza
  const [error, setError] = useState(null);

  useEffect(() => {
    // Verifica se authData e igrejaId estão disponíveis e se não está carregando
    if (authData && !authData.carregando && authData.igrejaId) {
      console.log(`RelatorioMembro: Carregando membros para igrejaId: ${authData.igrejaId}`);
      setLoadingMembros(true);
      setError(null);
      setMembros([]); // Limpa antes de buscar

      const fetchMembros = async () => {
        try {
          const membrosCollectionRef = collection(db, 'igrejas', authData.igrejaId, 'membros');
          const q = query(membrosCollectionRef, orderBy('nome'));
          const snapshot = await getDocs(q);
          const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setMembros(lista);
          console.log(`RelatorioMembro: ${lista.length} membros carregados.`);
        } catch (err) {
          console.error("RelatorioMembro: Erro ao buscar membros para relatório:", err);
          setError("Falha ao carregar dados dos membros.");
        } finally {
          setLoadingMembros(false);
        }
      };
      fetchMembros();
    } else if (authData && !authData.carregando && !authData.igrejaId) {
      console.warn("RelatorioMembro: igrejaId não disponível no contexto.");
      setLoadingMembros(false);
      setMembros([]);
      // setError("Informações da igreja não disponíveis para carregar membros."); // Opcional: definir erro específico
    } else if (!authData || authData.carregando) {
      console.log('RelatorioMembro: Aguardando dados de autenticação...');
      setLoadingMembros(true); // Mantém carregando enquanto authData não está pronto
      setMembros([]);
    }
  }, [authData]); // Re-executa quando authData (que inclui igrejaId e carregando) mudar

  // Renderização condicional enquanto os dados de autenticação estão carregando
  if (!authData || authData.carregando) {
    return <p style={{ color: '#777', marginTop: '20px', textAlign: 'center' }}>Carregando dados de autenticação...</p>;
  }

  // Renderização se o igrejaId não for encontrado após o carregamento da autenticação
  if (!authData.igrejaId) {
    return <p style={{ color: 'red', marginTop: '20px', textAlign: 'center' }}>Erro: Igreja ID não encontrado. Não é possível carregar o relatório de membros.</p>;
  }
  
  // Renderização enquanto os membros estão carregando (após authData estar pronto)
  if (loadingMembros) {
    return <p style={{ color: '#777', marginTop: '20px', textAlign: 'center' }}>Carregando relatório de membros...</p>;  }

  if (error) {
    return <p style={{ color: 'red', marginTop: '20px', textAlign: 'center' }}>Erro: {error}</p>;
  }

  return (
    <div style={{ marginTop: '40px' }}>
      <h2 style={{ fontSize: '1.2em', marginBottom: '25px', color: '#333', textAlign: 'center' }}>📋 Relatório Detalhado dos Membros</h2>
      {membros.length === 0 ? (
        <p style={{ color: '#777', textAlign: 'center' }}>Nenhum membro encontrado nesta igreja.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {membros.map((membro) => (
            <div key={membro.id} style={cardStyle}>
              <div style={labelStyle}>👤 Nome:</div>
              <div style={valueStyle}>{membro.nome || '-'}</div>

              <div style={labelStyle}>📧 Email:</div>
              <div style={valueStyle}>{membro.email || '-'}</div>

              <div style={labelStyle}>📞 Telefone:</div>
              <div style={valueStyle}>{membro.telefone || '-'}</div>

              <div style={labelStyle}>📍 Endereço:</div>
              <div style={valueStyle}>{`${membro.endereco || '-'}, ${membro.numero || 'S/N'} - ${membro.bairro || '-'}, ${membro.cidade || '-'} - ${membro.estado || '-'}`}</div>

              <div style={labelStyle}>🎂 Nascimento:</div>
              <div style={valueStyle}>{formatDate(membro.dataNascimento || membro.nascimento)}</div>

              {membro.profissao && <><div style={labelStyle}>💼 Profissão:</div><div style={valueStyle}>{membro.profissao}</div></>} 
              {membro.estadoCivil && <><div style={labelStyle}>💍 Estado Civil:</div><div style={valueStyle}>{membro.estadoCivil}</div></>} 
              {membro.funcao && <><div style={labelStyle}>📌 Função na Igreja:</div><div style={valueStyle}>{membro.funcao}</div></>} 
              {membro.dataBatismo && <><div style={labelStyle}>🕊️ Data Batismo:</div><div style={valueStyle}>{formatDate(membro.dataBatismo)}</div></>} 
              {membro.cursos && <><div style={labelStyle}>🎓 Cursos:</div><div style={valueStyle}>{membro.cursos}</div></>} 
              
              <div style={labelStyle}>💰 Dizimista:</div>
              <div style={valueStyle}>{typeof membro.dizimista === 'boolean' ? (membro.dizimista ? 'Sim' : 'Não') : '-'}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RelatorioMembro;

