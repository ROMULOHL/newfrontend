// src/components/Sidebar.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import '../App.css'; // Estilos centralizados

const Sidebar = () => {
  const navigate = useNavigate();
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const userId = localStorage.getItem('usuarioId'); // ajuste se usar auth.uid
        if (!userId) return;

        const docRef = doc(db, 'usuarios', userId); // ou 'igrejas' se for outra coleção
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.logoUrl) setLogoUrl(data.logoUrl);
        }
      } catch (error) {
        console.error('Erro ao carregar logo da igreja:', error);
      }
    };

    fetchLogo();
  }, []);

  return (
    <div className="sidebar">
      {/* Logo carregada via Firestore */}
      {logoUrl && (
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img
            src={logoUrl}
            alt="Logo da Igreja"
            style={{ maxWidth: '100%', maxHeight: '80px', borderRadius: '5px' }}
          />
        </div>
      )}

      <h2>Painel da Igreja</h2>
      <ul>
        <li onClick={() => navigate('/dashboard')}>🏠 Início</li>
        <li onClick={() => navigate('/dashboard')}>👥 Membros</li>
        <li onClick={() => navigate('/dashboard')}>💰 Finanças</li>
        {/* Futuras rotas personalizadas */}
      </ul>
    </div>
  );
};

export default Sidebar;
