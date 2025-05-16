// src/pages/PainelAdminLogo.js
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

function PainelAdminLogo() {
  const [igrejas, setIgrejas] = useState([]);
  const [logos, setLogos] = useState({});

  useEffect(() => {
    const fetchIgrejas = async () => {
      const snapshot = await getDocs(collection(db, 'igrejas'));
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setIgrejas(lista);

      // Preencher campo de logo se já tiver
      const logosAtuais = {};
      lista.forEach(igreja => {
        logosAtuais[igreja.id] = igreja.logo || '';
      });
      setLogos(logosAtuais);
    };

    fetchIgrejas();
  }, []);

  const atualizarLogo = async (id) => {
    try {
      const docRef = doc(db, 'igrejas', id);
      await updateDoc(docRef, { logo: logos[id] });
      alert('Logo atualizada com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar logo.');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Painel Admin - Atualizar Logos das Igrejas</h2>
      <p>Altere a URL da logo para cada igreja cadastrada:</p>

      {igrejas.map((igreja) => (
        <div key={igreja.id} style={{ marginBottom: '20px' }}>
          <strong>{igreja.nome || igreja.email}</strong>
          <br />
          <input
            type="text"
            value={logos[igreja.id]}
            onChange={(e) =>
              setLogos({ ...logos, [igreja.id]: e.target.value })
            }
            placeholder="URL da logo"
            style={{ width: '300px', padding: '8px', marginRight: '10px' }}
          />
          <button onClick={() => atualizarLogo(igreja.id)}>Salvar</button>
        </div>
      ))}
    </div>
  );
}

export default PainelAdminLogo;
