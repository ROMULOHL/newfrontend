import React, { useState } from 'react';

function PainelCard({ titulo, children }) {
  const [aberto, setAberto] = useState(false);

  const toggle = () => setAberto(!aberto);

  return (
    <div style={{ border: '1px solid #ddd', marginBottom: '15px', borderRadius: '5px', overflow: 'hidden' }}>
      <div
        onClick={toggle}
        style={{
          backgroundColor: '#f0f0f0',
          padding: '10px 15px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        {titulo} {aberto ? '▲' : '▼'}
      </div>
      {aberto && (
        <div style={{ padding: '15px', backgroundColor: '#fff' }}>
          {children}
        </div>
      )}
    </div>
  );
}

export default PainelCard;
