import DOMPurify from 'dompurify';

export const VALIDATION_RULES = {
  productIdea: {
    minLength: 3,
    maxLength: 500,
    pattern: /^[a-zA-Z0-9\s\-',&.!()]+$/,
  },
  ventureName: {
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-'&.]+$/,
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 255,
  },
  password: {
    minLength: 8,
    maxLength: 128,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  },
} as const;

export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  }).trim();
}

export function validateProductIdea(idea: string): { valid: boolean; error?: string } {
  const sanitized = sanitizeInput(idea);

  if (!sanitized) {
    return { valid: false, error: 'Product idea cannot be empty' };
  }

  if (sanitized.length < VALIDATION_RULES.productIdea.minLength) {
    return {
      valid: false,
      error: `Product idea must be at least ${VALIDATION_RULES.productIdea.minLength} characters`,
    };
  }

  if (sanitized.length > VALIDATION_RULES.productIdea.maxLength) {
    return {
      valid: false,
      error: `Product idea must be less than ${VALIDATION_RULES.productIdea.maxLength} characters`,
    };
  }

  if (!VALIDATION_RULES.productIdea.pattern.test(sanitized)) {
    return {
      valid: false,
      error: 'Product idea contains invalid characters',
    };
  }

  return { valid: true };
}

export function validateVentureName(name: string): { valid: boolean; error?: string } {
  const sanitized = sanitizeInput(name);

  if (!sanitized) {
    return { valid: false, error: 'Venture name cannot be empty' };
  }

  if (sanitized.length < VALIDATION_RULES.ventureName.minLength) {
    return {
      valid: false,
      error: `Venture name must be at least ${VALIDATION_RULES.ventureName.minLength} character`,
    };
  }

  if (sanitized.length > VALIDATION_RULES.ventureName.maxLength) {
    return {
      valid: false,
      error: `Venture name must be less than ${VALIDATION_RULES.ventureName.maxLength} characters`,
    };
  }

  return { valid: true };
}

export function validateEmail(email: string): { valid: boolean; error?: string } {
  const sanitized = sanitizeInput(email);

  if (!sanitized) {
    return { valid: false, error: 'Email cannot be empty' };
  }

  if (!VALIDATION_RULES.email.pattern.test(sanitized)) {
    return { valid: false, error: 'Invalid email format' };
  }

  if (sanitized.length > VALIDATION_RULES.email.maxLength) {
    return { valid: false, error: 'Email is too long' };
  }

  return { valid: true };
}

export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password) {
    return { valid: false, error: 'Password cannot be empty' };
  }

  if (password.length < VALIDATION_RULES.password.minLength) {
    return {
      valid: false,
      error: `Password must be at least ${VALIDATION_RULES.password.minLength} characters`,
    };
  }

  if (password.length > VALIDATION_RULES.password.maxLength) {
    return {
      valid: false,
      error: `Password must be less than ${VALIDATION_RULES.password.maxLength} characters`,
    };
  }

  if (!VALIDATION_RULES.password.pattern.test(password)) {
    return {
      valid: false,
      error: 'Password must contain uppercase, lowercase, and numbers',
    };
  }

  return { valid: true };
}

export function preventXSS(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
  });
}
