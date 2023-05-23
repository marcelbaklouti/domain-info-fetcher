import { fetchDomainInfo } from '../index';

describe('fetchDomainInfo function', () => {
  test('fetches domain info for baklouti.de', async () => {
    const domainInfo = await fetchDomainInfo('baklouti.de');
    expect(domainInfo).toBeDefined();
  });

  test('fetches domain info for https://baklouti.de', async () => {
    const domainInfo = await fetchDomainInfo('https://baklouti.de');
    expect(domainInfo).toBeDefined();
  });

  test('fetches domain info for invalid domain', async () => {
    const domainInfo = await fetchDomainInfo('invalid.invalid');
    expect(domainInfo).toBeUndefined();
  });

  test('fetches domain info for empty domain', async () => {
    const domainInfo = await fetchDomainInfo('');
    expect(domainInfo).toBeUndefined();
  });

});

describe ('Values of DomainInfo are correct', () => {
  test('fetches domain info for baklouti.de', async () => {
    const domainInfo = await fetchDomainInfo('baklouti.de');
    expect(domainInfo?.sslData).toBeDefined();
    expect(domainInfo?.serverData).toBeDefined();
    expect(domainInfo?.dnsData).toBeDefined();
    expect(domainInfo?.httpStatus).toBeDefined();
    expect(domainInfo?.httpStatus).toBeGreaterThan(0);
  });
});
