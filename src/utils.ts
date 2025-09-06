/**
 * Formats a given domain to `example.com` format.
 * - Strips protocol and leading www
 * - Removes trailing slash
 * - Lowercases the domain
 */
export function formatDomain(domain: string): string {
  return domain
    .replace(/^(https?:\/\/)?(www\.)?/i, "")
    .replace(/\/$/, "")
    .toLowerCase();
}

/**
 * Extracts the subdomain from a given domain.
 * Returns null if no subdomain is present.
 */
export function extractSubdomain(domain: string): string | null {
  const formattedDomain = formatDomain(domain);
  const parts = formattedDomain.split(".");

  if (parts.length > 2) {
    return parts[0];
  }

  return null;
}

/**
 * Gets the root domain (e.g., example.com) from a domain that may include a subdomain.
 */
export function getRootDomain(domain: string): string {
  const formattedDomain = formatDomain(domain);
  const parts = formattedDomain.split(".");

  if (parts.length > 2) {
    return parts.slice(-2).join(".");
  }

  return formattedDomain;
}

/**
 * Checks if the given domain is valid.
 */
export function checkDomain(domain: string): boolean {
  const domainParts = domain.split(".");
  return domainParts.length > 1 && domainParts[0].length > 0;
}

/**
 * Converts a date string to a timestamp.
 */
export function dateToTimestamp(dateString: string): number {
  return new Date(dateString).getTime();
}


