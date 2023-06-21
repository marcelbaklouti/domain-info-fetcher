[![Build](https://img.shields.io/github/actions/workflow/status/marcelbaklouti/domain-info-fetcher/release.yml)](https://github.com/marcelbaklouti/domain-info-fetcher/actions) [![GitHub release](https://img.shields.io/github/release/marcelbaklouti/domain-info-fetcher.svg)](https://github.com/marcelbaklouti/domain-info-fetcher/releases/latest) [![npm](https://img.shields.io/npm/v/domain-info-fetcher.svg)](https://www.npmjs.com/package/domain-info-fetcher) [![Known Vulnerabilities](https://snyk.io/test/github/marcelbaklouti/domain-info-fetcher/badge.svg)](https://snyk.io/test/github/marcelbaklouti/domain-info-fetcher) [![License](https://img.shields.io/github/license/marcelbaklouti/domain-info-fetcher.svg)](https://github.com/marcelbaklouti/domain-info-fetcher/blob/main/LICENCE) [![GitHub issues](https://img.shields.io/github/issues/marcelbaklouti/domain-info-fetcher.svg)](https://github.com/marcelbaklouti/domain-info-fetcher/issues)

# domain-info-fetcher

A simple Node.js package to fetch SSL, server and DNS information of a domain.

## Installation

You can install the package using npm:

```bash
npm install domain-info-fetcher
```

## Usage

### TypeScript

```typescript
import { fetchDomainInfo } from 'domain-info-fetcher';

async function main() {
  const domainInfo = await fetchDomainInfo('example.com');

  if (domainInfo) {
    console.log('SSL Data:', domainInfo.sslData);
    console.log('Server Data:', domainInfo.serverData);
    console.log('DNS Data:', domainInfo.dnsData);
    console.log('HTTP Status:', domainInfo.httpStatus);
  } else {
    console.error('Error fetching domain information');
  }
}

main();
```

### JavaScript

```javascript
const { fetchDomainInfo } = require('domain-info-fetcher');

async function main() {
  const domainInfo = await fetchDomainInfo('example.com');
  
  if (domainInfo) {
    console.log('SSL Data:', domainInfo.sslData);
    console.log('Server Data:', domainInfo.serverData);
    console.log('DNS Data:', domainInfo.dnsData);
    console.log('HTTP Status:', domainInfo.httpStatus);
  } else {
    console.error('Error fetching domain information');
  }
}

main();
```

## API

### `fetchDomainInfo(domain: string): Promise<DomainInfo | undefined>`

Fetches the SSL, server and DNS information of the given domain.

| Name | Type | Description |
| --- | --- | --- |
| `domain` | string | The domain to fetch the information for. |

Returns a promise that resolves to an object with the following properties:

| Name | Description |
| --- | --- |
| `sslData` | The SSL certificate data of the domain. |
| `serverData` | The server software used by the domain. (if available) |
| `dnsData` | The DNS records of the domain. |
| `httpStatus` | The HTTP status code of the domain. |

Returns `undefined` if an error occurs while fetching the domain information.

### `DomainInfo`

The interface for the object returned by `fetchDomainInfo`.

```typescript
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
```

## Contributing to domain-info-fetcher

Thank you for considering contributing to domain-info-fetcher! We welcome contributions from everyone, whether you're an experienced developer or just getting started with open source.

To contribute to this project, please follow these steps:

1. Fork this repository to your own GitHub account.
2. Clone your fork to your local machine.
3. Create a new branch for your changes: git checkout -b my-branch-name.
4. Make your changes and commit them with a descriptive message.
5. Push your changes to your fork: git push -u origin my-branch-name.
6. Open a pull request in this repository and describe the changes you made.

### Code style

Please make sure to follow the existing code style as much as possible. We use TypeScript and adhere to the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript#readme) with some minor modifications.

### Testing

Please make sure to add appropriate tests for any new code you write, and ensure that all existing tests continue to pass. We use Jest as our testing framework.

### Documentation

Please make sure to update the README.md file with any necessary documentation for new features or changes to existing features.

### Code of Conduct

This project adheres to the Contributor Covenant, a widely-used standard for community and open source projects. By participating in this project, you agree to abide by its code of conduct.

## License

MIT
