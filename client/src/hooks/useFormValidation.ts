import { toast } from 'sonner';

export interface ValidationRule {
  field: string;
  label: string;
  validate: (value: any) => boolean;
}

/**
 * Hook para validação de formulários com mensagens de erro detalhadas
 * 
 * @param rules - Array de regras de validação
 * @returns Função para validar formulário
 * 
 * @example
 * const validate = useFormValidation([
 *   { field: 'name', label: 'Nome', validate: (v) => !!v?.trim() },
 *   { field: 'email', label: 'Email', validate: (v) => !!v?.trim() },
 * ]);
 * 
 * if (!validate(formData)) return;
 */
export function useFormValidation(rules: ValidationRule[]) {
  return (formData: Record<string, any>): boolean => {
    const missingFields: string[] = [];

    for (const rule of rules) {
      const value = formData[rule.field];
      if (!rule.validate(value)) {
        missingFields.push(rule.label);
      }
    }

    if (missingFields.length > 0) {
      toast.error(`Campos obrigatórios faltando: ${missingFields.join(', ')}`);
      return false;
    }

    return true;
  };
}

/**
 * Função auxiliar para validar se um campo está vazio
 */
export function isNotEmpty(value: any): boolean {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return !!value;
}

/**
 * Função auxiliar para validar email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Função auxiliar para validar CPF
 */
export function isValidCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '');
  return cleaned.length === 11;
}

/**
 * Função auxiliar para validar telefone
 */
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10;
}
