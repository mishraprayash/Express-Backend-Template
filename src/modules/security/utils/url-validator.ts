import { URL } from 'url';
import dns from 'dns';
import { promisify } from 'util';

const dnsLookup = promisify(dns.lookup);

// List of blocked IP ranges (private networks, localhost, etc.)
const BLOCKED_IP_RANGES = [
  /^0\.0\.0\.0/, // All IPv4 addresses
  /^127\./, // Localhost
  /^10\./, // Private network
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // Private network
  /^192\.168\./, // Private network
  /^169\.254\./, // Link-local
  /^fc00::/, // Unique local address
  /^fe80::/, // Link-local
  /^::1/, // Localhost
  /^::/, // Unspecified
];

// List of allowed protocols
const ALLOWED_PROTOCOLS = ['http:', 'https:'];

// List of allowed domains (optional, for strict control)
const ALLOWED_DOMAINS = [
  'api.example.com',
  'cdn.example.com',
  // Add your allowed domains here
];

export class URLValidator {
  /**
   * Validates a URL to prevent SSRF attacks
   * @param urlString The URL to validate
   * @param options Validation options
   * @returns Promise<boolean> Whether the URL is safe
   */
  static async validateURL(
    urlString: string,
    options: {
      allowedProtocols?: string[];
      allowedDomains?: string[];
      checkDNS?: boolean;
    } = {}
  ): Promise<boolean> {
    try {
      const url = new URL(urlString);

      // Check protocol
      const allowedProtocols = options.allowedProtocols || ALLOWED_PROTOCOLS;
      if (!allowedProtocols.includes(url.protocol)) {
        return false;
      }

      // Check domain if allowedDomains is provided
      const allowedDomains = options.allowedDomains || ALLOWED_DOMAINS;
      if (allowedDomains.length > 0 && !allowedDomains.includes(url.hostname)) {
        return false;
      }

      // Check DNS if enabled
      if (options.checkDNS !== false) {
        const { address } = await dnsLookup(url.hostname);

        // Check if IP is in blocked ranges
        for (const range of BLOCKED_IP_RANGES) {
          if (range.test(address)) {
            return false;
          }
        }
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Sanitizes a URL by removing potentially dangerous parts
   * @param urlString The URL to sanitize
   * @returns string The sanitized URL
   */
  static sanitizeURL(urlString: string): string {
    try {
      const url = new URL(urlString);

      // Remove sensitive information from URL
      url.username = '';
      url.password = '';

      // Remove fragments
      url.hash = '';

      return url.toString();
    } catch (error) {
      throw new Error('Invalid URL');
    }
  }
}
