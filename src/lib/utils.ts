import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Função para inferir o gênero com base no primeiro nome
 * Esta é uma solução temporária até que um campo de gênero seja adicionado ao formulário
 * 
 * @param {string} nome - Nome completo da pessoa
 * @returns {string} - 'masculino' ou 'feminino'
 */
export const inferirGeneroPorNome = (nome: string): string | null => {
  if (!nome) return null;
  
  // Extrair o primeiro nome
  const primeiroNome = nome.split(' ')[0].toLowerCase();
  
  // Lista de terminações comuns para nomes femininos em português
  const terminacoesFemininas = ['a', 'na', 'ia', 'ina', 'ana', 'ela', 'ila', 'ola', 'ene', 'ane', 'ene', 'ise', 'ice'];
  
  // Lista de terminações comuns para nomes masculinos em português
  const terminacoesMasculinas = ['o', 'os', 'or', 'io', 'eu', 'on', 'el', 'il', 'im', 'an', 'em', 'ar'];
  
  // Lista de nomes femininos comuns que não seguem o padrão de terminação
  const nomesFemininos = [
    'isabel', 'raquel', 'rachel', 'ingrid', 'ruth', 'yasmin', 'carmen', 'miriam', 
    'iris', 'lais', 'tais', 'ines', 'agnes', 'mercedes', 'doris', 'cris', 'iris',
    'nicoly'
  ];
  
  // Lista de nomes masculinos comuns que não seguem o padrão de terminação
  const nomesMasculinos = [
    'davi', 'levi', 'ravi', 'noah', 'miguel', 'gabriel', 'rafael', 'samuel', 
    'daniel', 'joel', 'emanuel', 'djalma', 'josue', 'felipe', 'william', 'jefferson'
  ];
  
  // Verificar se o nome está nas listas específicas
  if (nomesFemininos.includes(primeiroNome)) {
    return 'feminino';
  }
  
  if (nomesMasculinos.includes(primeiroNome)) {
    return 'masculino';
  }
  
  // Verificar terminações
  for (const terminacao of terminacoesFemininas) {
    if (primeiroNome.endsWith(terminacao)) {
      return 'feminino';
    }
  }
  
  for (const terminacao of terminacoesMasculinas) {
    if (primeiroNome.endsWith(terminacao)) {
      return 'masculino';
    }
  }
  
  // Se não conseguir determinar, retorna null
  return null;
};
