// src/contexts/DataContextTypes.ts

// Interface para o formato de Timestamp do Firestore
export interface FirestoreTimestamp {
    seconds: number;
    nanoseconds: number;
  }
  
  // Interface para um Membro
  export interface Member {
    id: string;
    nome: string;
    telefone: string;
    idade: string; // Já ajustamos para string
    dataNascimento?: string | Date | FirestoreTimestamp; // << IMPORTANTE: Certifique-se que está assim
    funcao: string;
    profissao?: string;
    estadoCivil?: string;
    genero?: string; // Novo campo adicionado
    dizimista: boolean;
    batizado: boolean;
    cursos: {
      encontroComDeus: boolean;
      cursoDeBatismo: boolean;
      maturidadeNoEspirito: boolean;
      escolaDeLideres: boolean;
      outros: string[];
    };
    // Assumindo que dataCadastro e ultimaAtualizacao também podem vir como Date ou FirestoreTimestamp do context
    dataCadastro?: Date | FirestoreTimestamp;
    ultimaAtualizacao?: Date | FirestoreTimestamp;
  }
  
  // Interface para Dízimo
  export interface Dizimo {
    id: string;
    userId: string;
    valor: number;
    data: Date | FirestoreTimestamp; // Consistência
  }
  
  // Interface para Transação (usando Transacao como definido anteriormente)
  export interface Transacao {
    id: string;
    tipo: string;
    valor: number;
    data: Date | FirestoreTimestamp; // Consistência
    descricao?: string;
  }
        