// src/components/ResumoFinanceiro.js
import React from 'react';

function ResumoFinanceiro({ entradas, saidas, saldoAtual }) {
  const cardStyle = {
    flex: '1',
    minWidth: '200px',
    padding: '20px',
    borderRadius: '10px',
    backgroundColor: '#fff',
    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
    margin: '10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start'
  };

  const valorStyle = {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#1976d2',
    marginTop: '5px'
  };

  return (
    <div style={{ marginTop: '40px' }}>
      <h3 style={{ marginBottom: '20px', color: '#333' }}> Resumo Financeiro</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
        <div style={cardStyle}>
          <span> Total de Entradas</span>
          <span style={valorStyle}>R$ {entradas}</span>
        </div>
        <div style={cardStyle}>
          <span> Total de Saídas</span>
          <span style={{ ...valorStyle, color: '#d32f2f' }}>R$ {saidas}</span>
        </div>
        <div style={cardStyle}>
          <span> Saldo Atual</span>
          <span style={{ ...valorStyle, color: '#388e3c' }}>R$ {saldoAtual}</span>
        </div>
      </div>
    </div>
  );
}

export default ResumoFinanceiro;
