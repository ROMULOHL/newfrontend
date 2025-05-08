import React, { useState } from 'react';
import Header from '../components/Header';
import ListaMembros from '../components/ListaMembros';
import RelatorioMembro from '../components/RelatorioMembro';

function MembrosPage() {
  const [buscaNome, setBuscaNome] = useState('');

  return (
    <div className="painel-completo">
      <Header />
      <div className="conteudo-painel">
        <h1>Membros da Igreja</h1>

        <div style={{ margin: '20px 0' }}>
          <label><strong>Buscar membro por nome:</strong></label>
          <input
            type="text"
            value={buscaNome}
            onChange={(e) => setBuscaNome(e.target.value)}
            placeholder="Digite o nome do membro"
            style={{
              marginLeft: '10px',
              padding: '8px',
              width: '260px',
              borderRadius: '6px',
              border: '1px solid #ccc'
            }}
          />
        </div>

        <ListaMembros buscaNome={buscaNome} />
        <RelatorioMembro />
      </div>
    </div>
  );
}

export default MembrosPage;
