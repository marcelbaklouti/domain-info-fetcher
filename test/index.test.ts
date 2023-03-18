import { fetchDomainInfo } from '../index';

describe('fetchDomainInfo', () => {
  test('fetches domain info for baklouti.de', async () => {
    const domainInfo = await fetchDomainInfo('baklouti.de');

    expect(domainInfo).toHaveProperty('sslData');
    expect(domainInfo).toHaveProperty('serverData');
    expect(domainInfo).toHaveProperty('dnsData');
    expect(domainInfo?.dnsData).toHaveProperty('A');
    expect(domainInfo?.dnsData).toHaveProperty('CNAME');
    expect(domainInfo?.dnsData).toHaveProperty('TXT');
    expect(domainInfo?.dnsData).toHaveProperty('MX');
    expect(domainInfo?.dnsData).toHaveProperty('NS');
    expect(domainInfo?.dnsData).toHaveProperty('SOA');
  });
});

