import DOMPurify from 'dompurify';

export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  }).trim();
}

export function sanitizeHTML(html: string, allowedTags?: string[]): string {
  if (typeof html !== 'string') return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: allowedTags || ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'a'],
    ALLOWED_ATTR: allowedTags?.includes('a') ? ['href', 'target', 'rel'] : [],
    ALLOW_DATA_ATTR: false,
  });
}

export function sanitizeJSON(data: unknown): unknown {
  if (typeof data === 'string') {
    return sanitizeInput(data);
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeJSON);
  }

  if (data && typeof data === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[sanitizeInput(key)] = sanitizeJSON(value);
    }
    return sanitized;
  }

  return data;
}

export function preventXSS(html: string): string {
  return sanitizeHTML(html, ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li']);
}

export function validateInput(input: string, allowedPattern?: RegExp): boolean {
  if (typeof input !== 'string') return false;
  if (!allowedPattern) return true;
  return allowedPattern.test(input);
}

export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') return '';

  const trimmed = url.trim();

  if (!trimmed) return '';

  const lowerUrl = trimmed.toLowerCase();
  if (lowerUrl.startsWith('javascript:') ||
      lowerUrl.startsWith('data:') ||
      lowerUrl.startsWith('vbscript:')) {
    return '';
  }

  return trimmed;
}
