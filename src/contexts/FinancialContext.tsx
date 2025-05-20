import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { db as firestore } from '@/firebase'; // CORRIGIDO: Importação do Firebase
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  updateDoc, // Descomentado para atualizar transações
  deleteDoc, // Adicionado para excluir transações
  Timestamp,
  getDocs,
  writeBatch, // Para operações atômicas em lote
  getDoc, // Adicionado para buscar documento específico
} from 'firebase/firestore';
import { useAuth } from './AuthContext'; // Para obter o ID da igreja autenticada

// --- Tipos e Interfaces ---

export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}

export type FormaPagamento = 'dinheiro' | 'cartão' | 'pix' | 'transferencia' | 'boleto' | 'outro';
export type TipoEntrada = 'Dízimo' | 'Oferta' | 'Campanha' | 'Doação' | 'Outra Entrada';
export type TipoSaida = 
  | 'Aluguel do Templo/Salão'
  | 'Contas de Consumo - Água'
  | 'Contas de Consumo - Luz'
  | 'Contas de Consumo - Gás'
  | 'Contas de Consumo - Internet'
  | 'Contas de Consumo - Telefone'
  | 'Materiais de Escritório e Papelaria'
  | 'Software e Assinaturas'
  | 'Serviços de Contabilidade e Advocacia'
  | 'Seguros'
  | 'Manutenção e Reparos Prediais'
  | 'Limpeza e Conservação'
  | 'Segurança'
  | 'Transporte e Deslocamento'
  | 'Taxas e Impostos'
  | 'Salário Pastoral (Prebenda, Côngrua)'
  | 'Ajudas de Custo para Pastores e Líderes'
  | 'Salários de Funcionários'
  | 'Encargos Sociais e Trabalhistas'
  | 'Benefícios'
  | 'Treinamento e Desenvolvimento de Líderes e Voluntários'
  | 'Despesas com Viagens Missionárias e Ministeriais de Líderes'
  | 'Departamento Infantil (Kids)'
  | 'Departamento de Jovens e Adolescentes'
  | 'Departamento de Casais'
  | 'Ministério de Louvor e Adoração'
  | 'Ministério de Ensino (Escola Bíblica Dominical, cursos)'
  | 'Ministério de Ação Social e Evangelismo'
  | 'Ministério de Comunicação'
  | 'Outros Ministérios'
  | 'Eventos Especiais (conferências, seminários, congressos)'
  | 'Celebrações (Páscoa, Natal, Aniversário da Igreja)'
  | 'Batismos e Ceias'
  | 'Tarifas bancárias'
  | 'Juros e multas'
  | 'Taxas de máquinas de cartão'
  | 'Aquisição de Imobilizado'
  | 'Despesas com Hospitalidade'
  | 'Flores e Decoração do Templo'
  | 'Contribuições para Convenções ou Associações Denominacionais'
  | 'Projetos Missionários'
  | 'Fundo de Reserva ou Contingência'
  | 'Outra Saída';

export interface TransacaoBase {
  id?: string; // ID do documento no Firestore
  igrejaId: string;
  valor: number;
  data: Timestamp | Date; 
  descricao?: string;
  pago: boolean; 
  identificador?: string; 
  dataCadastro?: Timestamp | Date;
  ultimaAtualizacao?: Timestamp | Date;
}

export interface Entrada extends TransacaoBase {
  tipo: 'entrada';
  categoria: TipoEntrada;
  membroId?: string | null; 
  membroNome?: string | null; 
  formaPagamento: FormaPagamento;
}

export interface Saida extends TransacaoBase {
  tipo: 'saida';
  categoria: TipoSaida; 
  categoriaPrincipal?: string; 
  subCategoria?: string; 
}

export type Transacao = Entrada | Saida;

// Para o registro de dízimo no perfil do membro
export interface DizimoMembro {
  id?: string; // ID do documento na subcoleção de dízimos do membro
  transacaoId: string; // ID da transação original na coleção de transações da igreja
  igrejaId: string;
  membroId: string;
  valor: number;
  data: Timestamp | Date;
  formaPagamento: FormaPagamento;
  descricao?: string;
  dataCadastro?: Timestamp | Date;
}

export interface Saldos {
  entradasMes: number;
  saidasMes: number;
  saldoMes: number;
  saldoTotal: number;
  distribuicaoReceitas: Array<{ categoria: TipoEntrada | string; valor: number; percentual: number }>;
}

interface FinancialContextType {
  transacoes: Transacao[];
  saldos: Saldos;
  loadingTransacoes: boolean;
  loadingSaldos: boolean;
  addEntrada: (entradaData: Omit<Entrada, 'id' | 'igrejaId' | 'tipo' | 'pago' | 'dataCadastro' | 'ultimaAtualizacao'>) => Promise<string | undefined>; // Retorna o ID da transação
  addSaida: (saidaData: Omit<Saida, 'id' | 'igrejaId' | 'tipo' | 'pago' | 'dataCadastro' | 'ultimaAtualizacao'>) => Promise<string | undefined>; // Retorna o ID da transação
  updateEntrada: (id: string, entradaData: Partial<Omit<Entrada, 'id' | 'igrejaId' | 'tipo' | 'dataCadastro'>>) => Promise<void>; // Nova função para atualizar entrada
  updateSaida: (id: string, saidaData: Partial<Omit<Saida, 'id' | 'igrejaId' | 'tipo' | 'dataCadastro'>>) => Promise<void>; // Nova função para atualizar saída
  deleteEntrada: (id: string) => Promise<void>; // Nova função para excluir entrada
  deleteSaida: (id: string) => Promise<void>; // Nova função para excluir saída
  getTransacoesPorMes: (ano: number, mes: number) => Promise<Transacao[]>;
  calcularSaldos: (transacoesFiltradas: Transacao[], todasTransacoes: Transacao[]) => Saldos;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

// Função para padronizar categorias e métodos de pagamento
const padronizarTexto = (texto: string): string => {
  if (!texto) return '';
  
  // Mapeamento de textos para versões padronizadas
  const mapeamento: Record<string, string> = {
    // Categorias
    'dizimo': 'Dízimo',
    'dízimo': 'Dízimo',
    'Dizimo': 'Dízimo',
    'oferta': 'Oferta',
    'campanha': 'Campanha',
    'doacao': 'Doação',
    'doação': 'Doação',
    'Doacao': 'Doação',
    
    // Métodos de pagamento
    'cartao': 'Cartão',
    'cartão': 'Cartão',
    'Cartao': 'Cartão',
    'pix': 'PIX',
    'Pix': 'PIX',
    'dinheiro': 'Dinheiro',
    'transferencia': 'Transferência',
    'transferência': 'Transferência',
    'Transferencia': 'Transferência',
    'boleto': 'Boleto',
    'nao informado': 'Não informado',
    'não informado': 'Não informado',
    'Nao informado': 'Não informado',
  };
  
  // Verifica se o texto está no mapeamento
  if (texto.toLowerCase() in mapeamento) {
    return mapeamento[texto.toLowerCase()];
  }
  
  // Se não estiver no mapeamento, retorna o texto original com primeira letra maiúscula
  return texto.charAt(0).toUpperCase() + texto.slice(1);
};

const FinancialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { igrejaId } = useAuth();
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [saldos, setSaldos] = useState<Saldos>({
    entradasMes: 0,
    saidasMes: 0,
    saldoMes: 0,
    saldoTotal: 0,
    distribuicaoReceitas: [],
  });
  const [loadingTransacoes, setLoadingTransacoes] = useState<boolean>(true);
  const [loadingSaldos, setLoadingSaldos] = useState<boolean>(true);

  const convertTimestampToDate = (timestamp: FirestoreTimestamp | Date): Date => {
    if (timestamp instanceof Date) {
      return timestamp;
    }
    return new Timestamp(timestamp.seconds, timestamp.nanoseconds).toDate();
  };

  useEffect(() => {
    if (!igrejaId) {
      setTransacoes([]);
      setLoadingTransacoes(false);
      return;
    }

    setLoadingTransacoes(true);
    const transacoesRef = collection(firestore, `igrejas/${igrejaId}/transacoes`);
    const q = query(transacoesRef, orderBy('data', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const transacoesData = querySnapshot.docs.map(doc => {
        const data = doc.data() as Omit<Transacao, 'id'>;
        
        // Padronizar categorias e métodos de pagamento
        if (data.tipo === 'entrada') {
          const entrada = data as Omit<Entrada, 'id'>;
          entrada.categoria = padronizarTexto(entrada.categoria) as TipoEntrada;
          entrada.formaPagamento = padronizarTexto(entrada.formaPagamento) as FormaPagamento;
        } else if (data.tipo === 'saida') {
          const saida = data as Omit<Saida, 'id'>;
          saida.categoria = padronizarTexto(saida.categoria) as TipoSaida;
          if (saida.categoriaPrincipal) {
            saida.categoriaPrincipal = padronizarTexto(saida.categoriaPrincipal);
          }
          if (saida.subCategoria) {
            saida.subCategoria = padronizarTexto(saida.subCategoria);
          }
        }
        
        return {
          id: doc.id,
          ...data,
          data: convertTimestampToDate(data.data),
        } as Transacao;
      });
      setTransacoes(transacoesData);
      setLoadingTransacoes(false);
    }, (error) => {
      console.error("Erro ao buscar transações: ", error);
      setLoadingTransacoes(false);
    });

    return () => unsubscribe();
  }, [igrejaId]);

  const addEntrada = useCallback(async (entradaData: Omit<Entrada, 'id' | 'igrejaId' | 'tipo' | 'pago' | 'dataCadastro' | 'ultimaAtualizacao'>): Promise<string | undefined> => {
    if (!igrejaId) throw new Error("ID da Igreja não encontrado.");

    // Padronizar categoria e método de pagamento
    const categoriaCorrigida = padronizarTexto(entradaData.categoria) as TipoEntrada;
    const formaPagamentoCorrigida = padronizarTexto(entradaData.formaPagamento) as FormaPagamento;

    const dataParaSalvar: Omit<Entrada, 'id'> = {
      ...entradaData,
      categoria: categoriaCorrigida,
      formaPagamento: formaPagamentoCorrigida,
      igrejaId,
      tipo: 'entrada',
      pago: true,
      data: Timestamp.fromDate(entradaData.data instanceof Timestamp ? entradaData.data.toDate() : entradaData.data),
      dataCadastro: Timestamp.now(),
      ultimaAtualizacao: Timestamp.now(),
    };

    const batch = writeBatch(firestore);

    try {
      const transacoesRef = collection(firestore, `igrejas/${igrejaId}/transacoes`);
      const novaTransacaoRef = doc(transacoesRef); // Cria uma referência com ID automático
      batch.set(novaTransacaoRef, dataParaSalvar);
      const transacaoId = novaTransacaoRef.id;

      // Se for Dízimo e tiver membroId, registra na subcoleção do membro
      if (categoriaCorrigida === 'Dízimo' && entradaData.membroId) {
        const dizimoMembroData: Omit<DizimoMembro, 'id'> = {
          transacaoId: transacaoId, // ID da transação principal
          igrejaId,
          membroId: entradaData.membroId,
          valor: entradaData.valor,
          data: dataParaSalvar.data, // Usa a mesma data convertida para Timestamp
          formaPagamento: formaPagamentoCorrigida,
          descricao: entradaData.descricao,
          dataCadastro: Timestamp.now(),
        };
        const dizimoMembroRef = doc(collection(firestore, `igrejas/${igrejaId}/membros/${entradaData.membroId}/dizimos`));
        batch.set(dizimoMembroRef, dizimoMembroData);
      }

      await batch.commit();
      return transacaoId;
    } catch (error) {
      console.error("Erro ao adicionar entrada: ", error);
      throw error;
    }
  }, [igrejaId]);

  const addSaida = useCallback(async (saidaData: Omit<Saida, 'id' | 'igrejaId' | 'tipo' | 'pago' | 'dataCadastro' | 'ultimaAtualizacao'>): Promise<string | undefined> => {
    if (!igrejaId) throw new Error("ID da Igreja não encontrado.");

    // Padronizar categorias
    const categoriaCorrigida = padronizarTexto(saidaData.categoria) as TipoSaida;
    const categoriaPrincipalCorrigida = saidaData.categoriaPrincipal ? padronizarTexto(saidaData.categoriaPrincipal) : undefined;
    const subCategoriaCorrigida = saidaData.subCategoria ? padronizarTexto(saidaData.subCategoria) : undefined;

    const dataParaSalvar: Omit<Saida, 'id'> = {
      ...saidaData,
      categoria: categoriaCorrigida,
      categoriaPrincipal: categoriaPrincipalCorrigida,
      subCategoria: subCategoriaCorrigida,
      igrejaId,
      tipo: 'saida',
      pago: true,
      data: Timestamp.fromDate(saidaData.data instanceof Timestamp ? saidaData.data.toDate() : saidaData.data),
      dataCadastro: Timestamp.now(),
      ultimaAtualizacao: Timestamp.now(),
    };

    try {
      const transacoesRef = collection(firestore, `igrejas/${igrejaId}/transacoes`);
      const docRef = await addDoc(transacoesRef, dataParaSalvar);
      return docRef.id;
    } catch (error) {
      console.error("Erro ao adicionar saída: ", error);
      throw error;
    }
  }, [igrejaId]);

  // Nova função para atualizar uma entrada
  const updateEntrada = useCallback(async (id: string, entradaData: Partial<Omit<Entrada, 'id' | 'igrejaId' | 'tipo' | 'dataCadastro'>>): Promise<void> => {
    if (!igrejaId) throw new Error("ID da Igreja não encontrado.");
    if (!id) throw new Error("ID da transação não fornecido.");

    try {
      // Buscar a transação atual para verificar se é uma entrada e se é um dízimo
      const transacaoRef = doc(firestore, `igrejas/${igrejaId}/transacoes/${id}`);
      const transacaoSnap = await getDoc(transacaoRef);
      
      if (!transacaoSnap.exists()) {
        throw new Error("Transação não encontrada.");
      }
      
      const transacaoAtual = transacaoSnap.data() as Entrada;
      
      if (transacaoAtual.tipo !== 'entrada') {
        throw new Error("A transação não é uma entrada.");
      }

      // Preparar dados para atualização
      const dataParaAtualizar: Partial<Entrada> = {
        ...entradaData,
        ultimaAtualizacao: Timestamp.now(),
      };

      // Se houver alteração na categoria, padronizar
      if (entradaData.categoria) {
        dataParaAtualizar.categoria = padronizarTexto(entradaData.categoria) as TipoEntrada;
      }

      // Se houver alteração na forma de pagamento, padronizar
      if (entradaData.formaPagamento) {
        dataParaAtualizar.formaPagamento = padronizarTexto(entradaData.formaPagamento) as FormaPagamento;
      }

      // Se houver alteração na data, converter para Timestamp
      if (entradaData.data) {
        dataParaAtualizar.data = Timestamp.fromDate(
          entradaData.data instanceof Timestamp ? entradaData.data.toDate() : entradaData.data
        );
      }

      const batch = writeBatch(firestore);
      batch.update(transacaoRef, dataParaAtualizar);

      // Verificar se é um dízimo e se tem membroId para atualizar na subcoleção do membro
      const eraDizimo = transacaoAtual.categoria === 'Dízimo';
      const ehDizimoAgora = dataParaAtualizar.categoria === 'Dízimo' || (eraDizimo && !dataParaAtualizar.categoria);
      const membroId = dataParaAtualizar.membroId || transacaoAtual.membroId;

      if (ehDizimoAgora && membroId) {
        // Buscar o registro de dízimo na subcoleção do membro
        const dizimoQuery = query(
          collection(firestore, `igrejas/${igrejaId}/membros/${membroId}/dizimos`),
          where('transacaoId', '==', id)
        );
        const dizimoSnap = await getDocs(dizimoQuery);

        if (!dizimoSnap.empty) {
          // Atualizar o registro existente
          const dizimoDoc = dizimoSnap.docs[0];
          const dizimoRef = doc(firestore, `igrejas/${igrejaId}/membros/${membroId}/dizimos/${dizimoDoc.id}`);
          
          const dizimoDataParaAtualizar: Partial<DizimoMembro> = {
            valor: dataParaAtualizar.valor !== undefined ? dataParaAtualizar.valor : transacaoAtual.valor,
            data: dataParaAtualizar.data || transacaoAtual.data,
            formaPagamento: dataParaAtualizar.formaPagamento || transacaoAtual.formaPagamento,
            descricao: dataParaAtualizar.descricao !== undefined ? dataParaAtualizar.descricao : transacaoAtual.descricao,
          };
          
          batch.update(dizimoRef, dizimoDataParaAtualizar);
        } else if (eraDizimo && membroId !== transacaoAtual.membroId) {
          // Se o membroId mudou, remover o registro antigo e criar um novo
          if (transacaoAtual.membroId) {
            const dizimoAntigoQuery = query(
              collection(firestore, `igrejas/${igrejaId}/membros/${transacaoAtual.membroId}/dizimos`),
              where('transacaoId', '==', id)
            );
            const dizimoAntigoSnap = await getDocs(dizimoAntigoQuery);
            
            if (!dizimoAntigoSnap.empty) {
              const dizimoAntigoDoc = dizimoAntigoSnap.docs[0];
              const dizimoAntigoRef = doc(firestore, `igrejas/${igrejaId}/membros/${transacaoAtual.membroId}/dizimos/${dizimoAntigoDoc.id}`);
              batch.delete(dizimoAntigoRef);
            }
          }
          
          // Criar novo registro para o novo membro
          const novoDizimoData: Omit<DizimoMembro, 'id'> = {
            transacaoId: id,
            igrejaId,
            membroId,
            valor: dataParaAtualizar.valor !== undefined ? dataParaAtualizar.valor : transacaoAtual.valor,
            data: dataParaAtualizar.data || transacaoAtual.data,
            formaPagamento: dataParaAtualizar.formaPagamento || transacaoAtual.formaPagamento,
            descricao: dataParaAtualizar.descricao !== undefined ? dataParaAtualizar.descricao : transacaoAtual.descricao,
            dataCadastro: Timestamp.now(),
          };
          
          const novoDizimoRef = doc(collection(firestore, `igrejas/${igrejaId}/membros/${membroId}/dizimos`));
          batch.set(novoDizimoRef, novoDizimoData);
        } else if (!eraDizimo && ehDizimoAgora) {
          // Se não era dízimo antes, mas agora é, criar um novo registro
          const novoDizimoData: Omit<DizimoMembro, 'id'> = {
            transacaoId: id,
            igrejaId,
            membroId,
            valor: dataParaAtualizar.valor !== undefined ? dataParaAtualizar.valor : transacaoAtual.valor,
            data: dataParaAtualizar.data || transacaoAtual.data,
            formaPagamento: dataParaAtualizar.formaPagamento || transacaoAtual.formaPagamento,
            descricao: dataParaAtualizar.descricao !== undefined ? dataParaAtualizar.descricao : transacaoAtual.descricao,
            dataCadastro: Timestamp.now(),
          };
          
          const novoDizimoRef = doc(collection(firestore, `igrejas/${igrejaId}/membros/${membroId}/dizimos`));
          batch.set(novoDizimoRef, novoDizimoData);
        }
      } else if (eraDizimo && !ehDizimoAgora && transacaoAtual.membroId) {
        // Se era dízimo antes, mas agora não é, remover o registro
        const dizimoQuery = query(
          collection(firestore, `igrejas/${igrejaId}/membros/${transacaoAtual.membroId}/dizimos`),
          where('transacaoId', '==', id)
        );
        const dizimoSnap = await getDocs(dizimoQuery);
        
        if (!dizimoSnap.empty) {
          const dizimoDoc = dizimoSnap.docs[0];
          const dizimoRef = doc(firestore, `igrejas/${igrejaId}/membros/${transacaoAtual.membroId}/dizimos/${dizimoDoc.id}`);
          batch.delete(dizimoRef);
        }
      }

      await batch.commit();
    } catch (error) {
      console.error("Erro ao atualizar entrada: ", error);
      throw error;
    }
  }, [igrejaId]);

  // Nova função para atualizar uma saída
  const updateSaida = useCallback(async (id: string, saidaData: Partial<Omit<Saida, 'id' | 'igrejaId' | 'tipo' | 'dataCadastro'>>): Promise<void> => {
    if (!igrejaId) throw new Error("ID da Igreja não encontrado.");
    if (!id) throw new Error("ID da transação não fornecido.");

    try {
      // Buscar a transação atual para verificar se é uma saída
      const transacaoRef = doc(firestore, `igrejas/${igrejaId}/transacoes/${id}`);
      const transacaoSnap = await getDoc(transacaoRef);
      
      if (!transacaoSnap.exists()) {
        throw new Error("Transação não encontrada.");
      }
      
      const transacaoAtual = transacaoSnap.data();
      
      if (transacaoAtual.tipo !== 'saida') {
        throw new Error("A transação não é uma saída.");
      }

      // Preparar dados para atualização
      const dataParaAtualizar: Partial<Saida> = {
        ...saidaData,
        ultimaAtualizacao: Timestamp.now(),
      };

      // Se houver alteração na categoria, padronizar
      if (saidaData.categoria) {
        dataParaAtualizar.categoria = padronizarTexto(saidaData.categoria) as TipoSaida;
      }

      // Se houver alteração na categoria principal, padronizar
      if (saidaData.categoriaPrincipal) {
        dataParaAtualizar.categoriaPrincipal = padronizarTexto(saidaData.categoriaPrincipal);
      }

      // Se houver alteração na subcategoria, padronizar
      if (saidaData.subCategoria) {
        dataParaAtualizar.subCategoria = padronizarTexto(saidaData.subCategoria);
      }

      // Se houver alteração na data, converter para Timestamp
      if (saidaData.data) {
        dataParaAtualizar.data = Timestamp.fromDate(
          saidaData.data instanceof Timestamp ? saidaData.data.toDate() : saidaData.data
        );
      }

      await updateDoc(transacaoRef, dataParaAtualizar);
    } catch (error) {
      console.error("Erro ao atualizar saída: ", error);
      throw error;
    }
  }, [igrejaId]);

  // Nova função para excluir uma entrada
  const deleteEntrada = useCallback(async (id: string): Promise<void> => {
    if (!igrejaId) throw new Error("ID da Igreja não encontrado.");
    if (!id) throw new Error("ID da transação não fornecido.");

    try {
      // Buscar a transação para verificar se é uma entrada e se é um dízimo
      const transacaoRef = doc(firestore, `igrejas/${igrejaId}/transacoes/${id}`);
      const transacaoSnap = await getDoc(transacaoRef);
      
      if (!transacaoSnap.exists()) {
        throw new Error("Transação não encontrada.");
      }
      
      const transacao = transacaoSnap.data() as Entrada;
      
      if (transacao.tipo !== 'entrada') {
        throw new Error("A transação não é uma entrada.");
      }

      const batch = writeBatch(firestore);
      batch.delete(transacaoRef);

      // Se for um dízimo e tiver membroId, remover da subcoleção do membro
      if (transacao.categoria === 'Dízimo' && transacao.membroId) {
        const dizimoQuery = query(
          collection(firestore, `igrejas/${igrejaId}/membros/${transacao.membroId}/dizimos`),
          where('transacaoId', '==', id)
        );
        const dizimoSnap = await getDocs(dizimoQuery);
        
        if (!dizimoSnap.empty) {
          dizimoSnap.forEach((doc) => {
            batch.delete(doc.ref);
          });
        }
      }

      await batch.commit();
    } catch (error) {
      console.error("Erro ao excluir entrada: ", error);
      throw error;
    }
  }, [igrejaId]);

  // Nova função para excluir uma saída
  const deleteSaida = useCallback(async (id: string): Promise<void> => {
    if (!igrejaId) throw new Error("ID da Igreja não encontrado.");
    if (!id) throw new Error("ID da transação não fornecido.");

    try {
      // Buscar a transação para verificar se é uma saída
      const transacaoRef = doc(firestore, `igrejas/${igrejaId}/transacoes/${id}`);
      const transacaoSnap = await getDoc(transacaoRef);
      
      if (!transacaoSnap.exists()) {
        throw new Error("Transação não encontrada.");
      }
      
      const transacao = transacaoSnap.data();
      
      if (transacao.tipo !== 'saida') {
        throw new Error("A transação não é uma saída.");
      }

      await deleteDoc(transacaoRef);
    } catch (error) {
      console.error("Erro ao excluir saída: ", error);
      throw error;
    }
  }, [igrejaId]);

  // Função para obter transações de um mês específico
  const getTransacoesPorMes = useCallback(async (ano: number, mes: number): Promise<Transacao[]> => {
    if (!igrejaId) throw new Error("ID da Igreja não encontrado.");

    setLoadingTransacoes(true);
    const inicioMes = new Date(ano, mes - 1, 1);
    const fimMes = new Date(ano, mes, 0, 23, 59, 59, 999);

    const transacoesRef = collection(firestore, `igrejas/${igrejaId}/transacoes`);
    const q = query(transacoesRef, 
                    where('data', '>=', Timestamp.fromDate(inicioMes)), 
                    where('data', '<=', Timestamp.fromDate(fimMes)),
                    orderBy('data', 'desc'));
    try {
      const querySnapshot = await getDocs(q);
      const transacoesDoMes = querySnapshot.docs.map(doc => {
        const data = doc.data() as Omit<Transacao, 'id'>;
        
        // Padronizar categorias e métodos de pagamento
        if (data.tipo === 'entrada') {
          const entrada = data as Omit<Entrada, 'id'>;
          entrada.categoria = padronizarTexto(entrada.categoria) as TipoEntrada;
          entrada.formaPagamento = padronizarTexto(entrada.formaPagamento) as FormaPagamento;
        } else if (data.tipo === 'saida') {
          const saida = data as Omit<Saida, 'id'>;
          saida.categoria = padronizarTexto(saida.categoria) as TipoSaida;
          if (saida.categoriaPrincipal) {
            saida.categoriaPrincipal = padronizarTexto(saida.categoriaPrincipal);
          }
          if (saida.subCategoria) {
            saida.subCategoria = padronizarTexto(saida.subCategoria);
          }
        }
        
        return {
          id: doc.id,
          ...data,
          data: convertTimestampToDate(data.data),
        } as Transacao;
      });
      setLoadingTransacoes(false);
      return transacoesDoMes;
    } catch (error) {
      console.error("Erro ao buscar transações por mês: ", error);
      setLoadingTransacoes(false);
      return [];
    }
  }, [igrejaId]);

  // Função para calcular saldos - MODIFICADA para não atualizar estado diretamente
  const calcularSaldos = useCallback((transacoesFiltradas: Transacao[], todasAsTransacoes: Transacao[]): Saldos => {
    // Removida a linha: setLoadingSaldos(true);
    let entradasMes = 0;
    let saidasMes = 0;
    const distribuicao: { [key: string]: number } = {};

    // Padronizar e agrupar categorias
    transacoesFiltradas.forEach(t => {
      if (t.tipo === 'entrada') {
        const entrada = t as Entrada;
        entradasMes += entrada.valor;
        
        // Padronizar categoria antes de agrupar
        const categoriaCorrigida = padronizarTexto(entrada.categoria);
        distribuicao[categoriaCorrigida] = (distribuicao[categoriaCorrigida] || 0) + entrada.valor;
      } else if (t.tipo === 'saida') {
        saidasMes += t.valor;
      }
    });

    let saldoTotalAcumulado = 0;
    todasAsTransacoes.forEach(t => {
      if (t.tipo === 'entrada') {
        saldoTotalAcumulado += t.valor;
      } else if (t.tipo === 'saida') {
        saldoTotalAcumulado -= t.valor;
      }
    });

    const distribuicaoReceitasArray = Object.entries(distribuicao)
      .map(([categoria, valor]) => ({
        categoria: categoria,
        valor: valor || 0,
        percentual: entradasMes > 0 ? Math.round(((valor || 0) / entradasMes) * 100) : 0,
      }))
      .sort((a, b) => b.valor - a.valor);
    
    // Removida a linha: setLoadingSaldos(false);
    return {
      entradasMes,
      saidasMes,
      saldoMes: entradasMes - saidasMes,
      saldoTotal: saldoTotalAcumulado,
      distribuicaoReceitas: distribuicaoReceitasArray,
    };
  }, []);

  // NOVO useEffect para atualizar saldos quando as transações mudarem
  useEffect(() => {
    if (!loadingTransacoes) {
      const saldosCalculados = calcularSaldos(transacoes, transacoes);
      setSaldos(saldosCalculados);
      setLoadingSaldos(false);
    }
  }, [transacoes, loadingTransacoes, calcularSaldos]);

  const value = {
    transacoes,
    saldos,
    loadingTransacoes,
    loadingSaldos,
    addEntrada,
    addSaida,
    updateEntrada,
    updateSaida,
    deleteEntrada,
    deleteSaida,
    getTransacoesPorMes,
    calcularSaldos,
  };

  return <FinancialContext.Provider value={value}>{children}</FinancialContext.Provider>;
};

export const useFinancialData = () => {
  const context = useContext(FinancialContext);
  if (context === undefined) {
    throw new Error('useFinancialData deve ser usado dentro de um FinancialProvider');
  }
  return context;
};
export default FinancialProvider;
