import React from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

function DashboardPastor({ membros, entradas, saidas, saldoAtual }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      alert('Erro ao sair: ' + error.message);
    }
  };

  // Cálculos adicionais
  const totalMembros = membros.length;
  const totalDizimistas = membros.filter(m => m.dizimista).length;
  const totalBatizados = membros.filter(m => m.batizado).length;
  const totalCursos = membros.filter(m => m.fezCursos).length;

  return (
    <div style={{
      padding: '1rem',
      border: '1px solid #ccc',
      borderRadius: '8px',
      marginBottom: '2rem',
      marginTop: '2rem'
    }}>
      <h2>Painel da Igreja</h2>
      <button onClick={handleLogout} style={{ marginBottom: '1rem' }}>Sair</button>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        <div><strong>Total de Membros:</strong> {totalMembros}</div>
        <div><strong>Total de Dizimistas:</strong> {totalDizimistas}</div>
        <div><strong>Total de Batizados:</strong> {totalBatizados}</div>
        <div><strong>Fez os Cursos:</strong> {totalCursos}</div>
        <div><strong>Total de Entradas:</strong> R$ {entradas}</div>
        <div><strong>Total de Saídas:</strong> R$ {saidas}</div>
        <div><strong>Saldo Atual:</strong> R$ {saldoAtual}</div>
      </div>
    </div>
  );
}

export default DashboardPastor;
