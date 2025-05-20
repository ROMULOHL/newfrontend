// Utilitários para lidar com datas do Firestore
import { Timestamp } from "firebase/firestore";

/**
 * Converte qualquer tipo de data (Date, Timestamp, string, number) para Date
 * @param date Data em qualquer formato
 * @returns Date
 */
export function toDate(date: any): Date {
  if (date === null || date === undefined) {
    return new Date();
  }
  
  // Se já for Date, retorna diretamente
  if (date instanceof Date) {
    return date;
  }
  
  // Se for Timestamp do Firestore
  if (date && typeof date.toDate === 'function') {
    return date.toDate();
  }
  
  // Se for string ou número
  return new Date(date);
}

/**
 * Formata uma data para exibição no formato dd/mm/yyyy
 * @param date Data em qualquer formato
 * @returns String formatada
 */
export function formatDate(date: any): string {
  const dateObj = toDate(date);
  return dateObj.toLocaleDateString('pt-BR');
}

/**
 * Formata uma data para exibição no formato mês/ano
 * @param date Data em qualquer formato
 * @returns String formatada
 */
export function formatMonthYear(date: any): string {
  const dateObj = toDate(date);
  const month = dateObj.toLocaleString('pt-BR', { month: 'long' });
  const year = dateObj.getFullYear();
  return `${month} ${year}`;
}

/**
 * Verifica se duas datas são do mesmo mês e ano
 * @param date1 Primeira data
 * @param date2 Segunda data
 * @returns boolean
 */
export function isSameMonthAndYear(date1: any, date2: any): boolean {
  const d1 = toDate(date1);
  const d2 = toDate(date2);
  return d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
}

/**
 * Formata um período de datas
 * @param startDate Data inicial
 * @param endDate Data final
 * @returns String formatada
 */
export function formatDateRange(startDate: any, endDate: any): string {
  const start = toDate(startDate);
  const end = toDate(endDate);
  
  if (isSameMonthAndYear(start, end)) {
    return formatMonthYear(start);
  } else {
    return `${formatDate(start)} - ${formatDate(end)}`;
  }
}
