// src/contexts/AuthContext_corrigido.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [igrejaId, setIgrejaId] = useState(null);
  const [carregando, setCarregando] = useState(true); // Estado de carregamento do contexto

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUsuario(user);
      if (user) {
        console.log("AuthContext: Usuário logado, UID:", user.uid);
        const userDocRef = doc(db, "usuarios_auth", user.uid);
        try {
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            console.log("AuthContext: Documento usuarios_auth encontrado:", data);
            if (data.igrejaId) {
              setIgrejaId(data.igrejaId);
              console.log("AuthContext: Igreja ID definida:", data.igrejaId);
            } else {
              console.error("AuthContext: ❌ Erro: Campo 'igrejaId' não encontrado no documento usuarios_auth para o UID:", user.uid);
              setIgrejaId(null);
            }
          } else {
            console.error("AuthContext: ❌ Erro: Documento não encontrado em usuarios_auth para o UID:", user.uid, ". Usuário não associado a uma igreja.");
            setIgrejaId(null);
          }
        } catch (error) {
          console.error("AuthContext: ❌ Erro ao buscar documento usuarios_auth:", error);
          setIgrejaId(null);
        }
      } else {
        setIgrejaId(null);
        console.log("AuthContext: Usuário deslogado.");
      }
      setCarregando(false); // Finaliza o carregamento do contexto
    });

    return () => unsubscribe();
  }, []);

  const logout = () => {
    signOut(auth);
  };

  const value = {
    usuario,
    igrejaId,
    logout,
    carregando, // << ADICIONADO: Disponibiliza o estado de carregamento do contexto
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Renderiza children independentemente do carregando, 
          deixando os componentes filhos decidirem o que fazer com base no estado 'carregando'.
          Se quiser que nada seja renderizado até o contexto carregar, pode usar: !carregando && children 
          Mas é geralmente melhor deixar os filhos controlarem seu próprio estado de UI de carregamento.*/}
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

