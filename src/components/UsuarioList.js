import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; // ✅ CORRETA

function UsuarioList() {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const usuariosRef = collection(db, 'usuarios');
        const snapshot = await getDocs(usuariosRef);
        const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsuarios(lista);
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
      }
    };

    fetchUsuarios();
  }, []);

  return (
    <div>
      <h2>Usuários Cadastrados</h2>
      {usuarios.length > 0 ? (
        <ul>
          {usuarios.map(user => (
            <li key={user.id}>
              <strong>{user.nome}</strong> – {user.email} ({user.estado})
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhum usuário encontrado.</p>
      )}
    </div>
  );
}

export default UsuarioList;
