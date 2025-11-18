import { validateInput, sanitizeInput } from './validation';

export interface ValidationSchema<T> {
  validate: (data: unknown) => { isValid: boolean; errors: string[]; data?: T };
}

export const productIdeaSchema: ValidationSchema<string> = {
  validate: (data: unknown) => {
    const errors: string[] = [];

    if (typeof data !== 'string') {
      errors.push('Product idea must be a string');
      return { isValid: false, errors };
    }

    const trimmed = data.trim();

    if (trimmed.length === 0) {
      errors.push('Product idea cannot be empty');
    }

    if (trimmed.length < 3) {
      errors.push('Product idea must be at least 3 characters');
    }

    if (trimmed.length > 500) {
      errors.push('Product idea must be less than 500 characters');
    }

    if (!validateInput(trimmed)) {
      errors.push('Product idea contains invalid characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
      data: errors.length === 0 ? sanitizeInput(trimmed) : undefined,
    };
  },
};

export const emailSchema: ValidationSchema<string> = {
  validate: (data: unknown) => {
    const errors: string[] = [];

    if (typeof data !== 'string') {
      errors.push('Email must be a string');
      return { isValid: false, errors };
    }

    const trimmed = data.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmed)) {
      errors.push('Invalid email format');
    }

    return {
      isValid: errors.length === 0,
      errors,
      data: errors.length === 0 ? trimmed.toLowerCase() : undefined,
    };
  },
};

export const priceSchema: ValidationSchema<number> = {
  validate: (data: unknown) => {
    const errors: string[] = [];

    if (typeof data !== 'number') {
      errors.push('Price must be a number');
      return { isValid: false, errors };
    }

    if (data < 0) {
      errors.push('Price cannot be negative');
    }

    if (!Number.isFinite(data)) {
      errors.push('Price must be a finite number');
    }

    return {
      isValid: errors.length === 0,
      errors,
      data: errors.length === 0 ? Math.round(data) : undefined,
    };
  },
};

export const urlSchema: ValidationSchema<string> = {
  validate: (data: unknown) => {
    const errors: string[] = [];

    if (typeof data !== 'string') {
      errors.push('URL must be a string');
      return { isValid: false, errors };
    }

    const trimmed = data.trim();

    try {
      new URL(trimmed);
    } catch {
      errors.push('Invalid URL format');
    }

    return {
      isValid: errors.length === 0,
      errors,
      data: errors.length === 0 ? trimmed : undefined,
    };
  },
};

export function validateField<T>(
  schema: ValidationSchema<T>,
  data: unknown
): { isValid: boolean; error?: string; data?: T } {
  const result = schema.validate(data);
  return {
    isValid: result.isValid,
    error: result.errors[0],
    data: result.data,
  };
}
