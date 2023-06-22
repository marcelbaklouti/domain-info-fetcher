import * as https from 'https';
import { Socket } from 'net';
import * as dns from 'dns';

// Custom interface for the socket object
interface CustomSocket extends Socket {
  getPeerCertificate(detailed: boolean): any;
}

// DomainInfo interface to describe the return type of fetchDomainInfo function
interface DomainInfo {
  sslData: {
    subject: { [key: string]: string | string[] };
    issuer: { [key: string]: string | string[] };
    valid: boolean;
    validFrom: number;
    validTo: number;
  }
  serverData: string | undefined;
  dnsData: {
    A: string[];
    CNAME: string | null;
    TXT: string[];
    MX: Array<{ exchange: string; priority: number }>;
    NS: string[];
    SOA: dns.SoaRecord | null;
  } | undefined;
  httpStatus: number | undefined;
}

/**
 * Formats a given domain to `example.com` format.
 * @param domain The domain to format.
 * @returns The formatted domain.
 */
export function formatDomain(domain: string): string {
  return domain.replace(/^(https?:\/\/)?(www\.)?/i, '').replace(/\/$/, '').toLowerCase();
}


/**
 * Checks if the given domain is valid.
 * @param domain The domain to check.
 * @returns True if the domain is valid, false otherwise.
 */
export const checkDomain = (domain: string): boolean => {
  const domainParts = domain.split('.');
  return domainParts.length > 1 && domainParts[0].length > 0;
};

/**
 * converts a date string to a timestamp
 * @param dateString
 * @returns timestamp
 */
export function dateToTimestamp(dateString: string): number {
  return new Date(dateString).getTime();
}

/**
 * Extracts SSL data from the given certificate.
 * @param cert 
 * @returns  An object containing the SSL data.
 */
function extractSslData(cert: any): any {
  const validToTimestamp = dateToTimestamp(cert.valid_to);
  const validFromTimestamp = dateToTimestamp(cert.valid_from);

  return {
    subject: cert.subject as { [key: string]: string | string[] },
    issuer: cert.issuer as { [key: string]: string | string[] },
    valid: validToTimestamp > Date.now() as boolean,
    validFrom: validFromTimestamp,
    validTo: validToTimestamp
  };
}

/**
 * Fetches SSL, server, and DNS data for the given domain.
 * @param domain The domain to fetch the information for.
 * @returns A Promise that resolves to an object containing the SSL, server, and DNS data.
 */
export async function fetchDomainInfo(domain: string): Promise<DomainInfo | undefined> {
  try {
    if (!domain) {
      throw new Error("Domain name cannot be empty");
    }

    if (!checkDomain(domain)) {
      throw new Error("Invalid domain name");
    }

    const formattedDomain = formatDomain(domain);
    const [sslData, serverData, dnsData, httpStatus] = await Promise.all([
      getSslData(formattedDomain)
        .catch((error) => {
          throw new Error("Could not fetch SSL data for domain " + domain + ". Error: " + error.message);
        }),
      getServerData(formattedDomain).catch((error) => {
        throw new Error("Could not fetch server data for domain " + domain + ". Error: " + error.message);
      }),
      getDnsData(formattedDomain).catch((error) => {
        throw new Error("Could not fetch DNS data for domain " + domain + ". Error: " + error.message);
      }),
      getHttpStatus(formattedDomain),
    ]);

    if (!sslData) {
      throw new Error("Could not fetch SSL data for domain");
    }

    return { sslData, serverData, dnsData, httpStatus };

  } catch (error) {
    throw error;
  }
}

/**
 * Retrieves SSL data for the given domain.
 * @param domain The domain to fetch the SSL data for.
 * @returns A Promise that resolves to an object containing the SSL data.
 */
async function getSslData(domain: string): Promise<any> {
  return new Promise((resolve, reject) => {
    https.request(`https://${domain}`, { method: 'HEAD' }, (res) => {
      const socket = res.socket as CustomSocket;
      const cert = socket.getPeerCertificate(true);
      resolve(extractSslData(cert));
      socket.destroy();
    }).on('error', (error) => {
      reject(error);
    }).end();
  });
}

/**
 * Retrieves server data for the given domain.
 * @param domain The domain to fetch the server data for.
 * @returns A Promise that resolves to a string containing the server data.
 */
async function getServerData(domain: string): Promise<string | undefined> {
  return new Promise((resolve, reject) => {
    https.request(`https://${domain}`, { method: 'HEAD' }, (res) => {
      const serverHeaderValue = res.headers['server'];
      if (Array.isArray(serverHeaderValue)) {
        resolve(serverHeaderValue[0]);
      } else {
        resolve(serverHeaderValue);
      }
    }).on('error', (error) => {
      reject(error);
    }).end();
  });
}

/**
 * Retrieves DNS data for the given domain.
 * @param domain The domain to fetch the DNS data for.
 * @returns A Promise that resolves to an object containing the DNS data.
 */
async function getDnsData(domain: string): Promise<{ 
  A: string[]; 
  CNAME: string | null; 
  TXT: string[]; 
  MX: Array<{ exchange: string; priority: number }>;
  NS: string[]; 
  SOA: dns.SoaRecord | null 
}> {
  const A = await getARecords(domain);
  const CNAME = await getCNameRecord(domain);
  const TXT = await getTxtRecords(domain);
  const MX = await getMxRecords(domain);
  const NS = await getNsRecords(domain);
  const SOA = await getSoaRecord(domain);

  return { A, CNAME, TXT, MX, NS, SOA };
}

/**
 * Retrieves A records for the given domain.
 * @param domain The domain to fetch the A records for.
 * @returns A Promise that resolves to an array of strings containing the A records.
 */
function getARecords(domain: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    dns.resolve4(domain, (error, addresses) => {
      if (error) {
        reject(error);
      } else {
        resolve(addresses);
      }
    });
  });
}

/**
 * Retrieves CNAME record for the given domain.
 * @param domain The domain to fetch the CNAME record for.
 * @returns A Promise that resolves to a string containing the CNAME record.
 */
function getCNameRecord(domain: string): Promise<string | null> {
  return new Promise((resolve, reject) => {
    dns.resolveCname(domain, (error, addresses) => {
      if (error) {
        if (error.code === 'ENODATA') {
          resolve(null);
        } else {
          reject(error);
        }
      } else {
        resolve(addresses[0]);
      }
    });
  });
}

/**
 * Retrieves TXT records for the given domain.
 * @param domain The domain to fetch the TXT records for.
 * @returns A Promise that resolves to an array of strings containing the TXT records.
 */
function getTxtRecords(domain: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    dns.resolveTxt(domain, (error, records) => {
      if (error) {
        reject(error);
      } else {
        const flattenedRecords = records.flat();
        resolve(flattenedRecords);
      }
    });
  });
}

/**
 * Retrieves MX records for the given domain.
 * @param domain The domain to fetch the MX records for.
 * @returns A Promise that resolves to an array of objects containing the MX records.
 */
function getMxRecords(domain: string): Promise<Array<{ exchange: string; priority: number }>> {
  return new Promise((resolve, reject) => {
    dns.resolveMx(domain, (error, records) => {
      if (error) {
        reject(error);
      } else {
        resolve(records);
      }
    });
  });
}

/**
 * Retrieves NS records for the given domain.
 * @param domain The domain to fetch the NS records for.
 * @returns A Promise that resolves to an array of strings containing the NS records.
 */
function getNsRecords(domain: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    dns.resolveNs(domain, (error, records) => {
      if (error) {
        reject(error);
      } else {
        resolve(records);
      }
    });
  });
}

/**
 * Retrieves SOA record for the given domain.
 * @param domain The domain to fetch the SOA record for.
 * @returns A Promise that resolves to an object containing the SOA record.
 */
function getSoaRecord(domain: string): Promise<dns.SoaRecord | null> {
  return new Promise((resolve, reject) => {
    dns.resolveSoa(domain, (error, record) => {
      if (error) {
        if (error.code === 'ENODATA') {
          resolve(null);
        } else {
          reject(error);
        }
      } else {
        resolve(record);
      }
    });
  });
}

/**
 * Retrieves HTTP status for the given domain.
 * @param domain The domain to fetch the HTTP status for.
 * @returns A Promise that resolves to a number containing the HTTP status.
 */
async function getHttpStatus(domain: string): Promise<number> {
  return new Promise((resolve, reject) => {
    https.request(`https://${domain}`, { method: 'HEAD' }, (res) => {
      resolve(res.statusCode || 0);
    }).on('error', (error) => {
      reject(error);
    }).end();
  });
}
