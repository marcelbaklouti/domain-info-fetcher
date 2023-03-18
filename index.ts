import https from 'https';
import { Socket } from 'net';
import dns from 'dns';

// Custom interface for the socket object
interface CustomSocket extends Socket {
  getPeerCertificate(detailed: boolean): any;
}

// DomainInfo interface to describe the return type of fetchDomainInfo function
interface IDomainInfo {
  sslData: any;
  serverData: string | undefined;
  dnsData: {
    A: string[];
    CNAME: string | null;
    TXT: string[];
    MX: Array<{ exchange: string; priority: number }>;
    NS: string[];
    SOA: dns.SoaRecord | null;
  };
}

/**
 * Fetches SSL, server, and DNS data for the given domain.
 * @param domain The domain to fetch the information for.
 * @returns A Promise that resolves to an object containing the SSL, server, and DNS data.
 */
export async function fetchDomainInfo(domain: string): Promise<IDomainInfo | undefined> {
  try {
    const sslData = await getSslData(domain);
    const serverData = await getServerData(domain);
    const dnsData = await getDnsData(domain);

    // console.log('SSL Data:', sslData);
    // console.log('Server Data:', serverData);
    // console.log('DNS Data:', dnsData);

    return {
      sslData,
      serverData,
      dnsData,
    };

  } catch (error) {
    console.error('Error fetching domain information:', error);
    return undefined;
  }
}

/**
 * Retrieves SSL data for the given domain.
 * @param domain The domain to fetch the SSL data for.
 * @returns A Promise that resolves to an object containing the SSL data.
 */
async function getSslData(domain: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const req = https.request(`https://${domain}`, { method: 'HEAD' }, (res) => {
      const socket = res.socket as CustomSocket;
      resolve(socket.getPeerCertificate(true));
      socket.destroy();
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

/**
 * Retrieves server data for the given domain.
 * @param domain The domain to fetch the server data for.
 * @returns A Promise that resolves to a string containing the server data.
 */
async function getServerData(domain: string): Promise<string | undefined> {
  return new Promise((resolve, reject) => {
    const req = https.request(`https://${domain}`, { method: 'HEAD' }, (res) => {
      const serverHeaderValue = res.headers['server'];
      if (Array.isArray(serverHeaderValue)) {
        resolve(serverHeaderValue[0]);
      } else {
        resolve(serverHeaderValue);
      }
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
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


