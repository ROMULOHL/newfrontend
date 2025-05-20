import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { auth, db } from "@/firebase";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  confirmPasswordReset 
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// Tipos
interface AuthContextType {
  currentUser: any;
  igrejaId: string | null;
  loading: boolean;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>; // Nova função para recuperação de senha
  confirmReset: (oobCode: string, newPassword: string) => Promise<void>; // Nova função para confirmar redefinição
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useTypedAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useTypedAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [igrejaId, setIgrejaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("PASSO 1: AuthProvider montado - Iniciando autenticação...");
    let isMounted = true; // Para evitar atualizações em estado após desmontagem

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("PASSO 2: onAuthStateChanged disparado");
      if (isMounted) {
        if (user) {
          console.log("PASSO 3: Usuário já autenticado:", user.uid, "Email:", user.email);
          setCurrentUser(user); // Usar a função de atualização com o valor atual
          try {
            const userDocRef = doc(db, "usuarios_auth", user.uid);
            const userDocSnap = await getDoc(userDocRef);
            console.log("PASSO 4: Resultado de getDoc:", userDocSnap.exists(), userDocSnap.data());
            if (userDocSnap && userDocSnap.exists()) {
              const userData = userDocSnap.data();
              setIgrejaId(userData.igrejaId || null);
              console.log("PASSO 5: igrejaId definido:", userData.igrejaId);
            } else {
              console.error("PASSO 5: Documento usuarios_auth não encontrado para o usuário:", user.uid);
              setIgrejaId(null);
            }
          } catch (error) {
            console.error("PASSO 5: Erro ao buscar dados do usuário:", error);
            setIgrejaId(null);
          }
        } else {
          console.log("PASSO 3: Nenhum usuário autenticado, tentando login automático...");
          try {
            const credential = await signInWithEmailAndPassword(auth, "admin@example.com", "senha123");
            if (isMounted) {
              console.log("PASSO 4: Usuário admin logado automaticamente com sucesso:", credential.user.uid, "Email:", credential.user.email);
              setCurrentUser(credential.user);
              const userDocRef = doc(db, "usuarios_auth", credential.user.uid);
              const userDocSnap = await getDoc(userDocRef);
              console.log("PASSO 5: Resultado de getDoc após login automático:", userDocSnap.exists(), userDocSnap.data());
              if (userDocSnap && userDocSnap.exists()) {
                const userData = userDocSnap.data();
                setIgrejaId(userData.igrejaId || null);
                console.log("PASSO 6: igrejaId definido após login automático:", userData.igrejaId);
              } else {
                console.error("PASSO 6: Documento usuarios_auth não encontrado após login automático:", credential.user.uid);
                setIgrejaId(null);
              }
            }
          } catch (error: any) {
            if (isMounted) {
              console.error("PASSO 4: Erro ao logar automaticamente:", error.message, "Código:", error.code);
              setCurrentUser(null);
              setIgrejaId(null);
            }
          }
        }
        setLoading(false);
        console.log("PASSO 7: Autenticação concluída. currentUser:", currentUser?.uid, "igrejaId:", igrejaId);
      }
    });

    return () => {
      isMounted = false;
      console.log("PASSO 8: Desmontando AuthProvider, cancelando onAuthStateChanged");
      unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  // Nova função para enviar email de recuperação de senha
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error("Erro ao enviar email de recuperação:", error);
      
      // Traduzir mensagens de erro comuns para português
      if (error.code === 'auth/user-not-found') {
        throw new Error("Não existe usuário com este email.");
      } else if (error.code === 'auth/invalid-email') {
        throw new Error("O formato do email é inválido.");
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error("Muitas tentativas. Tente novamente mais tarde.");
      } else {
        throw new Error("Erro ao enviar email de recuperação. Tente novamente.");
      }
    }
  };

  // Nova função para confirmar redefinição de senha
  const confirmReset = async (oobCode: string, newPassword: string) => {
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
    } catch (error: any) {
      console.error("Erro ao redefinir senha:", error);
      
      // Traduzir mensagens de erro comuns para português
      if (error.code === 'auth/invalid-action-code') {
        throw new Error("O código de redefinição é inválido ou expirou.");
      } else if (error.code === 'auth/weak-password') {
        throw new Error("A senha é muito fraca. Use pelo menos 6 caracteres.");
      } else {
        throw new Error("Erro ao redefinir senha. Tente novamente.");
      }
    }
  };

  const value: AuthContextType = {
    currentUser,
    igrejaId,
    loading,
    logout,
    resetPassword,
    confirmReset
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : <p>Carregando autenticação...</p>}
    </AuthContext.Provider>
  );
};

export { useTypedAuth as useAuth };
