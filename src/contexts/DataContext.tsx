// src/contexts/DataContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { db, auth } from "../firebase"; // Caminho corrigido na etapa anterior
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  onSnapshot,
  DocumentData,
  QuerySnapshot,
  FirestoreError,
  getDoc // Adicionado para getMemberById
} from "firebase/firestore";
import { Member, Dizimo, Transacao } from "./DataContextTypes"; // Caminhos corrigidos e usando Transacao

interface DataContextType {
  membros: Member[];
  dizimos: Dizimo[];
  transacoes: Transacao[];
  loading: boolean;
  error: Error | null;
  addMember: (igrejaId: string, memberData: Omit<Member, 'id' | 'dataCadastro'>) => Promise<void>;
  updateMember: (igrejaId: string, memberId: string, memberData: Partial<Omit<Member, 'id'>>) => Promise<void>;
  deleteMember: (igrejaId: string, memberId: string) => Promise<void>;
  addTransaction: (igrejaId: string, transactionData: Omit<Transacao, 'id' | 'data'>) => Promise<void>; // Usa Transacao
  getMemberById: (igrejaId: string, memberId: string) => Promise<Member | null>;
  // Adicionar addDizimo se necessário
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData deve ser usado dentro de um DataProvider");
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
  igrejaId: string | null;
}

export const DataProvider = ({ children, igrejaId }: DataProviderProps) => {
  const [membros, setMembros] = useState<Member[]>([]);
  const [dizimos, setDizimos] = useState<Dizimo[]>([]); // Adicionado estado para dízimos
  const [transacoes, setTransacoes] = useState<Transacao[]>([]); // Usa Transacao
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!igrejaId) {
      setLoading(false);
      setMembros([]);
      setDizimos([]);
      setTransacoes([]);
      return;
    }

    setLoading(true);
    let hasSetError = false;

    // Listener para Membros
    const membersCollectionRef = collection(db, "igrejas", igrejaId, "membros");
    const unsubscribeMembers = onSnapshot(membersCollectionRef, (snapshot: QuerySnapshot<DocumentData>) => {
      const membersList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          nome: data.nome || "",
          telefone: data.telefone || "",
          idade: (data.idade !== undefined && data.idade !== null) ? String(data.idade) : "", // Garante que idade seja string
          dataNascimento: data.dataNascimento instanceof Timestamp ? data.dataNascimento.toDate().toISOString().split('T')[0] : (typeof data.dataNascimento === 'string' ? data.dataNascimento : undefined),
          funcao: data.funcao || "",
          profissao: data.profissao || "",
          estadoCivil: data.estadoCivil || "",
          genero: data.genero || "", // Campo de gênero adicionado
          dizimista: data.dizimista === true, // Garante booleano
          batizado: data.batizado === true,   // Garante booleano
          cursos: data.cursos || {
            encontroComDeus: false,
            cursoDeBatismo: false,
            maturidadeNoEspirito: false,
            escolaDeLideres: false,
            outros: []
          },
          dataCadastro: data.dataCadastro instanceof Timestamp ? data.dataCadastro.toDate() : undefined,
          ultimaAtualizacao: data.ultimaAtualizacao instanceof Timestamp ? data.ultimaAtualizacao.toDate() : undefined,
        } as Member;
      });
      setMembros(membersList);
      if (!hasSetError) setLoading(false);
    }, (err: FirestoreError) => {
      console.error("Erro ao buscar membros: ", err);
      setError(err);
      setLoading(false);
      hasSetError = true;
    });

    // Listener para Dízimos
    const dizimosCollectionRef = collection(db, "igrejas", igrejaId, "dizimos"); 
    const unsubscribeDizimos = onSnapshot(dizimosCollectionRef, (snapshot: QuerySnapshot<DocumentData>) => {
      const dizimosList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        data: doc.data().data instanceof Timestamp ? doc.data().data.toDate() : new Date(),
      })) as Dizimo[];
      setDizimos(dizimosList);
    }, (err: FirestoreError) => {
      console.error("Erro ao buscar dízimos: ", err);
      if (!hasSetError) {
        setError(err); 
        setLoading(false);
        hasSetError = true;
      }
    });

    // Listener para Transações
    const transacoesCollectionRef = collection(db, "igrejas", igrejaId, "transacoes");
    const unsubscribeTransacoes = onSnapshot(transacoesCollectionRef, (snapshot: QuerySnapshot<DocumentData>) => {
      const transacoesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        data: doc.data().data instanceof Timestamp ? doc.data().data.toDate() : new Date(),
      })) as Transacao[];
      setTransacoes(transacoesList);
    }, (err: FirestoreError) => {
      console.error("Erro ao buscar transações: ", err);
      if (!hasSetError) {
         setError(err);
         setLoading(false);
         hasSetError = true;
      }
    });

    return () => {
      unsubscribeMembers();
      unsubscribeDizimos();
      unsubscribeTransacoes();
    };
  }, [igrejaId]);

  const addMember = async (igrejaId: string, memberData: Omit<Member, 'id' | 'dataCadastro'>) => {
    if (!auth.currentUser) throw new Error("Usuário não autenticado para adicionar membro.");
    const dataCadastro = Timestamp.now();
    await addDoc(collection(db, "igrejas", igrejaId, "membros"), { ...memberData, dataCadastro, ultimaAtualizacao: dataCadastro });
  };

  const updateMember = async (igrejaId: string, memberId: string, memberData: Partial<Omit<Member, 'id'>>) => {
    try {
      if (!auth.currentUser) throw new Error("Usuário não autenticado.");
      console.log("DataContext.updateMember - Igreja ID (parâmetro):", igrejaId);
      console.log("DataContext.updateMember - Member ID (parâmetro):", memberId);
      console.log("DataContext.updateMember - Current User UID (auth.currentUser.uid):", auth.currentUser.uid);
      const memberDocRef = doc(db, "igrejas", igrejaId, "membros", memberId);
      await updateDoc(memberDocRef, { ...memberData, ultimaAtualizacao: Timestamp.now() });
      console.log("Membro atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar membro no Firestore:", error);
      throw error;
    }
  };

  const deleteMember = async (igrejaId: string, memberId: string) => {
    if (!auth.currentUser) throw new Error("Usuário não autenticado para deletar membro.");
    const memberDocRef = doc(db, "igrejas", igrejaId, "membros", memberId);
    await deleteDoc(memberDocRef);
  };

  const addTransaction = async (igrejaId: string, transactionData: Omit<Transacao, 'id' | 'data'>) => {
    if (!auth.currentUser) throw new Error("Usuário não autenticado para adicionar transação.");
    const data = Timestamp.now();
    await addDoc(collection(db, "igrejas", igrejaId, "transacoes"), { ...transactionData, data });
  };

  const getMemberById = async (igrejaId: string, memberId: string): Promise<Member | null> => {
    const memberDocRef = doc(db, "igrejas", igrejaId, "membros", memberId);
    const memberSnap = await getDoc(memberDocRef);
    if (memberSnap.exists()) {
      const data = memberSnap.data();
      return {
        id: memberSnap.id,
        nome: data.nome || "",
        telefone: data.telefone || "",
        idade: (data.idade !== undefined && data.idade !== null) ? String(data.idade) : "",
        dataNascimento: data.dataNascimento instanceof Timestamp ? data.dataNascimento.toDate().toISOString().split('T')[0] : (typeof data.dataNascimento === 'string' ? data.dataNascimento : undefined),
        funcao: data.funcao || "",
        profissao: data.profissao || "",
        estadoCivil: data.estadoCivil || "",
        genero: data.genero || "", // Campo de gênero adicionado
        dizimista: data.dizimista === true,
        batizado: data.batizado === true,
        cursos: data.cursos || {
          encontroComDeus: false,
          cursoDeBatismo: false,
          maturidadeNoEspirito: false,
          escolaDeLideres: false,
          outros: []
        },
        dataCadastro: data.dataCadastro instanceof Timestamp ? data.dataCadastro.toDate() : undefined,
        ultimaAtualizacao: data.ultimaAtualizacao instanceof Timestamp ? data.ultimaAtualizacao.toDate() : undefined,
      } as Member;
    }
    return null;
  };

  return (
    <DataContext.Provider value={{
      membros, 
      dizimos, 
      transacoes, 
      loading, 
      error, 
      addMember, 
      updateMember, 
      deleteMember, 
      addTransaction, 
      getMemberById 
    }}>
      {children}
    </DataContext.Provider>
  );
};
