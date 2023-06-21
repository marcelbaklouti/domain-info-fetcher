import { fetchDomainInfo, formatDomain, checkDomain, dateToTimestamp } from '../index';

describe('fetchDomainInfo', () => {
  test('should return domain info', async () => {
    const domainInfo = await fetchDomainInfo('https://www.google.com');
    expect(domainInfo).toHaveProperty('sslData');
    expect(domainInfo).toHaveProperty('serverData');
    expect(domainInfo).toHaveProperty('dnsData');
    expect(domainInfo).toHaveProperty('httpStatus');
  });

  test('sslData should contain valid data', async () => {
    const domainInfo = await fetchDomainInfo('https://www.google.com');
    expect(domainInfo?.sslData).toHaveProperty('subject');
    expect(domainInfo?.sslData).toHaveProperty('issuer');
    expect(domainInfo?.sslData).toHaveProperty('valid');
    expect(domainInfo?.sslData).toHaveProperty('validFrom');
    expect(domainInfo?.sslData).toHaveProperty('validTo');
  });

  test('should throw error for invalid domain', async () => {
    expect(fetchDomainInfo('invalid')).rejects.toThrow('Invalid domain name');
  });
});

describe('formatDomain', () => {
  test('should return domain without http and www', () => {
    const domain = formatDomain('https://www.google.com');
    expect(domain).toBe('google.com');
  });

  test('should return domain without www', () => {
    const domain = formatDomain('www.google.com');
    expect(domain).toBe('google.com');
  });
});

describe('checkDomain', () => {
  test('should return true for valid domain', () => {
    const isValid = checkDomain('google.com');
    expect(isValid).toBe(true);
  });

  test('should return false for invalid domain', () => {
    const isValid = checkDomain('invalid');
    expect(isValid).toBe(false);
  });
});

describe('dateToTimestamp', () => {
  test('should convert date string to timestamp', () => {
    const date = new Date('2023-06-21');
    const timestamp = dateToTimestamp(date.toString());
    expect(timestamp).toBe(date.getTime());
  });

  test('should return NaN for invalid date string', () => {
    const timestamp = dateToTimestamp('invalid');
    expect(timestamp).toBeNaN();
  });
});
