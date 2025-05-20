import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { db as firestore } from '@/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
  DocumentData,
  QuerySnapshot,
  FirestoreError,
  where,
  getDocs
} from 'firebase/firestore';
import { useAuth } from './AuthContext'; // Para obter o ID da igreja autenticada

// --- Tipos e Interfaces ---

export interface Evento {
  id?: string;
  titulo: string;
  diaSemana: string;
  dia: number;
  mes: string;
  horario: string;
  data: Timestamp | Date; // Campo adicional para armazenar como Timestamp no Firebase
  igrejaId: string;
  dataCadastro?: Timestamp | Date;
  ultimaAtualizacao?: Timestamp | Date;
}

interface EventContextType {
  eventos: Evento[];
  loading: boolean;
  error: Error | null;
  addEvento: (eventoData: Omit<Evento, 'id' | 'igrejaId' | 'dataCadastro' | 'ultimaAtualizacao' | 'data'>) => Promise<string | undefined>;
  updateEvento: (eventoId: string, eventoData: Partial<Omit<Evento, 'id' | 'igrejaId' | 'dataCadastro' | 'ultimaAtualizacao'>>) => Promise<void>;
  deleteEvento: (eventoId: string) => Promise<void>;
  getEventosByMes: (ano: number, mes: number) => Promise<Evento[]>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const useEventData = () => {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEventData deve ser usado dentro de um EventProvider');
  }
  return context;
};

interface EventProviderProps {
  children: ReactNode;
}

export const EventProvider: React.FC<EventProviderProps> = ({ children }) => {
  const { igrejaId } = useAuth();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Função para converter string de data e hora para objeto Date
  const converterParaDate = (dia: number, mes: string, horario: string): Date => {
    // Mapeamento de nomes de meses para números
    const mesesMap: { [key: string]: number } = {
      'janeiro': 0, 'fevereiro': 1, 'março': 2, 'abril': 3, 'maio': 4, 'junho': 5,
      'julho': 6, 'agosto': 7, 'setembro': 8, 'outubro': 9, 'novembro': 10, 'dezembro': 11,
      'jan': 0, 'fev': 1, 'mar': 2, 'abr': 3, 'mai': 4, 'jun': 5,
      'jul': 6, 'ago': 7, 'set': 8, 'out': 9, 'nov': 10, 'dez': 11
    };
    
    // Normalizar o nome do mês (converter para minúsculo)
    const mesNormalizado = mes.toLowerCase();
    
    // Obter o número do mês
    const mesNumero = mesesMap[mesNormalizado] !== undefined ? mesesMap[mesNormalizado] : new Date().getMonth();
    
    // Obter o ano atual (poderia ser parametrizado se necessário)
    const anoAtual = new Date().getFullYear();
    
    // Extrair horas e minutos do horário (formato esperado: "HH:MM")
    const [horas, minutos] = horario.split(':').map(num => parseInt(num, 10));
    
    // Criar objeto Date
    return new Date(anoAtual, mesNumero, dia, horas || 0, minutos || 0);
  };

  // Função para converter Timestamp para objeto com campos separados
  const converterTimestampParaCampos = (timestamp: Timestamp | Date): { diaSemana: string, dia: number, mes: string, horario: string } => {
    const data = timestamp instanceof Date ? timestamp : timestamp.toDate();
    
    // Dias da semana em português
    const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    
    // Meses em português
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    // Extrair informações da data
    const diaSemana = diasSemana[data.getDay()];
    const dia = data.getDate();
    const mes = meses[data.getMonth()];
    
    // Formatar horário (HH:MM)
    const horas = data.getHours().toString().padStart(2, '0');
    const minutos = data.getMinutes().toString().padStart(2, '0');
    const horario = `${horas}:${minutos}`;
    
    return { diaSemana, dia, mes, horario };
  };

  useEffect(() => {
    if (!igrejaId) {
      setEventos([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const eventosRef = collection(firestore, `igrejas/${igrejaId}/eventos`);
    const q = query(eventosRef, orderBy('data', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const eventosData = snapshot.docs.map(doc => {
        const data = doc.data();
        
        // Converter Timestamp para Date
        const dataEvento = data.data instanceof Timestamp ? data.data.toDate() : new Date();
        
        // Extrair campos da data
        const { diaSemana, dia, mes, horario } = data.diaSemana && data.dia && data.mes && data.horario ? 
          { diaSemana: data.diaSemana, dia: data.dia, mes: data.mes, horario: data.horario } : 
          converterTimestampParaCampos(dataEvento);
        
        return {
          id: doc.id,
          titulo: data.titulo || "",
          diaSemana,
          dia,
          mes,
          horario,
          data: dataEvento,
          igrejaId: data.igrejaId,
          dataCadastro: data.dataCadastro instanceof Timestamp ? data.dataCadastro.toDate() : undefined,
          ultimaAtualizacao: data.ultimaAtualizacao instanceof Timestamp ? data.ultimaAtualizacao.toDate() : undefined,
        } as Evento;
      });
      
      setEventos(eventosData);
      setLoading(false);
    }, (err: FirestoreError) => {
      console.error("Erro ao buscar eventos: ", err);
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [igrejaId]);

  const addEvento = useCallback(async (eventoData: Omit<Evento, 'id' | 'igrejaId' | 'dataCadastro' | 'ultimaAtualizacao' | 'data'>): Promise<string | undefined> => {
    if (!igrejaId) throw new Error("ID da Igreja não encontrado.");
    
    // Converter campos separados para objeto Date
    const dataEvento = converterParaDate(eventoData.dia, eventoData.mes, eventoData.horario);
    
    const dataParaSalvar = {
      ...eventoData,
      igrejaId,
      data: Timestamp.fromDate(dataEvento),
      dataCadastro: Timestamp.now(),
      ultimaAtualizacao: Timestamp.now(),
    };

    try {
      const eventosRef = collection(firestore, `igrejas/${igrejaId}/eventos`);
      const docRef = await addDoc(eventosRef, dataParaSalvar);
      return docRef.id;
    } catch (error) {
      console.error("Erro ao adicionar evento: ", error);
      throw error;
    }
  }, [igrejaId, converterParaDate]);

  const updateEvento = useCallback(async (eventoId: string, eventoData: Partial<Omit<Evento, 'id' | 'igrejaId' | 'dataCadastro' | 'ultimaAtualizacao'>>): Promise<void> => {
    if (!igrejaId) throw new Error("ID da Igreja não encontrado.");
    
    let dataParaAtualizar: any = {
      ...eventoData,
      ultimaAtualizacao: Timestamp.now(),
    };
    
    // Se os campos de data foram atualizados, recalcular o campo data
    if (eventoData.dia !== undefined || eventoData.mes !== undefined || eventoData.horario !== undefined) {
      // Buscar o evento atual para obter os campos que não foram atualizados
      const eventoAtual = eventos.find(e => e.id === eventoId);
      if (eventoAtual) {
        const dia = eventoData.dia !== undefined ? eventoData.dia : eventoAtual.dia;
        const mes = eventoData.mes !== undefined ? eventoData.mes : eventoAtual.mes;
        const horario = eventoData.horario !== undefined ? eventoData.horario : eventoAtual.horario;
        
        // Converter para Date e depois para Timestamp
        const dataEvento = converterParaDate(dia, mes, horario);
        dataParaAtualizar.data = Timestamp.fromDate(dataEvento);
      }
    }

    try {
      const eventoDocRef = doc(firestore, `igrejas/${igrejaId}/eventos`, eventoId);
      await updateDoc(eventoDocRef, dataParaAtualizar);
    } catch (error) {
      console.error("Erro ao atualizar evento: ", error);
      throw error;
    }
  }, [igrejaId, eventos, converterParaDate]);

  const deleteEvento = useCallback(async (eventoId: string): Promise<void> => {
    if (!igrejaId) throw new Error("ID da Igreja não encontrado.");
    
    try {
      const eventoDocRef = doc(firestore, `igrejas/${igrejaId}/eventos`, eventoId);
      await deleteDoc(eventoDocRef);
    } catch (error) {
      console.error("Erro ao excluir evento: ", error);
      throw error;
    }
  }, [igrejaId]);

  const getEventosByMes = useCallback(async (ano: number, mes: number): Promise<Evento[]> => {
    if (!igrejaId) return [];
    
    const inicioMes = new Date(ano, mes - 1, 1);
    const fimMes = new Date(ano, mes, 0, 23, 59, 59, 999);
    
    const eventosRef = collection(firestore, `igrejas/${igrejaId}/eventos`);
    const q = query(eventosRef, 
                  where('data', '>=', Timestamp.fromDate(inicioMes)), 
                  where('data', '<=', Timestamp.fromDate(fimMes)),
                  orderBy('data', 'asc'));
    
    try {
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        
        // Converter Timestamp para Date
        const dataEvento = data.data instanceof Timestamp ? data.data.toDate() : new Date();
        
        // Extrair campos da data
        const { diaSemana, dia, mes, horario } = converterTimestampParaCampos(dataEvento);
        
        return {
          id: doc.id,
          titulo: data.titulo || "",
          diaSemana,
          dia,
          mes,
          horario,
          data: dataEvento,
          igrejaId: data.igrejaId,
          dataCadastro: data.dataCadastro instanceof Timestamp ? data.dataCadastro.toDate() : undefined,
          ultimaAtualizacao: data.ultimaAtualizacao instanceof Timestamp ? data.ultimaAtualizacao.toDate() : undefined,
        } as Evento;
      });
    } catch (error) {
      console.error("Erro ao buscar eventos por mês: ", error);
      return [];
    }
  }, [igrejaId, converterTimestampParaCampos]);

  const value = {
    eventos,
    loading,
    error,
    addEvento,
    updateEvento,
    deleteEvento,
    getEventosByMes,
  };

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
};

export default EventProvider;
