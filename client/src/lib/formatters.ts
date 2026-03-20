/**
 * Formatadores compartilhados para o sistema
 * Use essas funções em todos os componentes para manter consistência
 */

/**
 * Formata telefone com máscara (XX) XXXXX-XXXX
 * @param value - Valor do telefone (com ou sem formatação)
 * @returns Telefone formatado
 */
export const formatPhone = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
};
