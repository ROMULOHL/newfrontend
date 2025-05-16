// src/components/CardInfo.js
import React from 'react';

function CardInfo({ titulo, valor, icone, corFundo }) {
  return (
    <div
      className="card-info"
      style={{
        backgroundColor: corFundo,
        padding: '20px',
        borderRadius: '8px',
        flex: '1 1 200px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
        fontSize: '16px'
      }}
    >
      <div style={{ fontSize: '26px', marginBottom: '8px' }}>{icone}</div>
      <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '5px' }}>{titulo}</div>
      <div style={{ fontSize: '20px', fontWeight: '600' }}>{valor}</div>
    </div>
  );
}

export default CardInfo;
