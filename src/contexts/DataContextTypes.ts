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
    idade: string;
    dataNascimento?: string | Date | FirestoreTimestamp;
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
    dataCadastro?: Date | FirestoreTimestamp;
    ultimaAtualizacao?: Date | FirestoreTimestamp;
}
      