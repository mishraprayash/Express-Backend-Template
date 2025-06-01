import { URLValidator } from './url-validator';

export class InputSanitizer {
  /**
   * Sanitizes a string to prevent command injection
   * @param input The input string to sanitize
   * @returns string The sanitized string
   */
  static sanitizeString(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }

    // Remove command injection patterns
    return input
      .replace(/[;&|`$]/g, '') // Remove command separators
      .replace(/[<>]/g, '') // Remove redirection operators
      .replace(/\$\(/g, '') // Remove command substitution
      .replace(/\\/g, '') // Remove escape characters
      .trim();
  }

  /**
   * Sanitizes an object to prevent prototype pollution
   * @param obj The object to sanitize
   * @returns object The sanitized object
   */
  static sanitizeObject<T extends object>(obj: T): T {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => {
        if (typeof item === 'object' && item !== null) {
          return this.sanitizeObject(item);
        } else if (typeof item === 'string') {
          return this.sanitizeString(item);
        }
        return item;
      }) as unknown as T;
    }
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      // Prevent prototype pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }

      // Recursively sanitize nested objects
      if (typeof value === 'object' && value !== null) {
        (sanitized as Record<string, unknown>)[key] = this.sanitizeObject(value);
      } else if (typeof value === 'string') {
        (sanitized as Record<string, unknown>)[key] = this.sanitizeString(value);
      } else {
        (sanitized as Record<string, unknown>)[key] = value;
      }
    }

    return sanitized as T;
  }

  /**
   * Sanitizes a URL string
   * @param url The URL to sanitize
   * @returns string The sanitized URL
   */
  static sanitizeURL(url: string): string {
    try {
      return URLValidator.sanitizeURL(url);
    } catch (error) {
      return '';
    }
  }

  /**
   * Sanitizes an array of strings
   * @param arr The array to sanitize
   * @returns string[] The sanitized array
   */
  static sanitizeArray(arr: string[]): string[] {
    if (!Array.isArray(arr)) {
      return [];
    }

    return arr
      .map((item) => (typeof item === 'string' ? this.sanitizeString(item) : ''))
      .filter(Boolean);
  }

  /**
   * Sanitizes query parameters
   * @param query The query parameters to sanitize
   * @returns object The sanitized query parameters
   */
  static sanitizeQuery(query: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(query)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value);
      } else if (Array.isArray(value)) {
        sanitized[key] = this.sanitizeArray(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}
