// src/components/PainelAdmin.js
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

function PainelAdmin() {
  const [igrejas, setIgrejas] = useState([]);

  useEffect(() => {
    const buscarIgrejas = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'igrejas'));
        const lista = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setIgrejas(lista);
      } catch (error) {
        console.error('Erro ao buscar igrejas:', error);
      }
    };

    buscarIgrejas();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Painel Admin - Igrejas Cadastradas</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr>
            <th style={estiloTh}>Nome da Igreja</th>
            <th style={estiloTh}>E-mail</th>
            <th style={estiloTh}>Estado</th>
          </tr>
        </thead>
        <tbody>
          {igrejas.map((igreja) => (
            <tr key={igreja.id}>
              <td style={estiloTd}>{igreja.nome || '—'}</td>
              <td style={estiloTd}>{igreja.email || '—'}</td>
              <td style={estiloTd}>{igreja.estado || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const estiloTh = {
  border: '1px solid #ccc',
  padding: '8px',
  backgroundColor: '#f2f2f2',
  textAlign: 'left'
};

const estiloTd = {
  border: '1px solid #ccc',
  padding: '8px'
};

export default PainelAdmin;
