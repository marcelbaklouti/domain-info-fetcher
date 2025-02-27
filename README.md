[![Build](https://img.shields.io/github/actions/workflow/status/marcelbaklouti/domain-info-fetcher/release.yml)](https://github.com/marcelbaklouti/domain-info-fetcher/actions) [![GitHub release](https://img.shields.io/github/release/marcelbaklouti/domain-info-fetcher.svg)](https://github.com/marcelbaklouti/domain-info-fetcher/releases/latest) [![npm](https://img.shields.io/npm/v/domain-info-fetcher.svg)](https://www.npmjs.com/package/domain-info-fetcher) [![Known Vulnerabilities](https://snyk.io/test/github/marcelbaklouti/domain-info-fetcher/badge.svg)](https://snyk.io/test/github/marcelbaklouti/domain-info-fetcher) [![License](https://img.shields.io/github/license/marcelbaklouti/domain-info-fetcher.svg)](https://github.com/marcelbaklouti/domain-info-fetcher/blob/main/LICENCE) [![GitHub issues](https://img.shields.io/github/issues/marcelbaklouti/domain-info-fetcher.svg)](https://github.com/marcelbaklouti/domain-info-fetcher/issues)

# domain-info-fetcher

A simple Node.js package to fetch SSL, server and DNS information of a domain.

## Installation

You can install the package using your preferred package manager:

### npm

```bash
npm install domain-info-fetcher
```

### pnpm

```bash
pnpm add domain-info-fetcher
```

### yarn

```bash
yarn add domain-info-fetcher
```

## Usage

### TypeScript

```typescript
import { fetchDomainInfo } from "domain-info-fetcher";

async function main() {
  const domainInfo = await fetchDomainInfo("example.com");

  if (domainInfo) {
    console.log("SSL Data:", domainInfo.sslData);
    console.log("Server Data:", domainInfo.serverData);
    console.log("DNS Data:", domainInfo.dnsData);
    console.log("HTTP Status:", domainInfo.httpStatus);
  } else {
    console.error("Error fetching domain information");
  }
}

main();
```

### JavaScript

```javascript
const { fetchDomainInfo } = require("domain-info-fetcher");

async function main() {
  const domainInfo = await fetchDomainInfo("example.com");

  if (domainInfo) {
    console.log("SSL Data:", domainInfo.sslData);
    console.log("Server Data:", domainInfo.serverData);
    console.log("DNS Data:", domainInfo.dnsData);
    console.log("HTTP Status:", domainInfo.httpStatus);
  } else {
    console.error("Error fetching domain information");
  }
}

main();
```

## Examples

The package includes examples to help you get started:

```bash
# Clone the repository
git clone https://github.com/marcelbaklouti/domain-info-fetcher.git
cd domain-info-fetcher

# Install dependencies
npm install

# Run the basic example
npm run example

# Run the multiple domains example
npm run example:multi
```

The examples demonstrate:

- Basic usage: Fetching and displaying detailed information for a single domain
- Multiple domains: Processing multiple domains in parallel and generating a certificate expiration summary

## Command Line Interface (CLI)

This package includes a CLI that allows you to use it directly from the command line:

### Global Installation

```bash
# Install globally
npm install -g domain-info-fetcher

# Run the CLI
domain-info-fetcher example.com
```

### Local Usage with npx

```bash
npx domain-info-fetcher example.com
```

### CLI Options

```
Options:
  --timeout <ms>        Set request timeout in milliseconds (default: 10000)
  --json                Output as JSON
  --help                Show this help message

Example:
  domain-info-fetcher example.com --timeout 5000 --json
```

## Advanced Usage

### Custom Request Options

You can customize the request behavior by passing options:

```typescript
import { fetchDomainInfo } from "domain-info-fetcher";

async function main() {
  // Custom request options
  const options = {
    timeout: 5000, // 5 second timeout
    headers: {
      // Custom headers
      "User-Agent": "My Custom User Agent",
    },
    followRedirects: true, // Follow redirects
    maxRedirects: 3, // Maximum redirects to follow
  };

  try {
    const domainInfo = await fetchDomainInfo("example.com", options);
    console.log(domainInfo);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main();
```

### Processing Multiple Domains

```typescript
import { fetchDomainInfo } from "domain-info-fetcher";

async function checkMultipleDomains(domains: string[]) {
  const results = await Promise.allSettled(
    domains.map((domain) => fetchDomainInfo(domain))
  );

  results.forEach((result, index) => {
    const domain = domains[index];
    if (result.status === "fulfilled") {
      console.log(`✅ ${domain}: SSL valid - ${result.value?.sslData.valid}`);
    } else {
      console.log(`❌ ${domain}: Error - ${result.reason.message}`);
    }
  });
}

checkMultipleDomains(["example.com", "google.com", "github.com"]);
```

## API

### `fetchDomainInfo(domain: string): Promise<DomainInfo | undefined>`

Fetches the SSL, server and DNS information of the given domain.

| Name     | Type   | Description                              |
| -------- | ------ | ---------------------------------------- |
| `domain` | string | The domain to fetch the information for. |

Returns a promise that resolves to an object with the following properties:

| Name         | Description                                            |
| ------------ | ------------------------------------------------------ |
| `sslData`    | The SSL certificate data of the domain.                |
| `serverData` | The server software used by the domain. (if available) |
| `dnsData`    | The DNS records of the domain.                         |
| `httpStatus` | The HTTP status code of the domain.                    |

Returns `undefined` if an error occurs while fetching the domain information.

### Example Output

```javascript
// Example output for fetchDomainInfo("example.com")
{
  sslData: {
    subject: {
      CN: 'example.com'
    },
    issuer: {
      C: 'US',
      O: 'DigiCert Inc',
      CN: 'DigiCert TLS RSA SHA256 2020 CA1'
    },
    valid: true,
    validFrom: 1626566400000,  // timestamp for the start date
    validTo: 1689724799000     // timestamp for the expiration date
  },
  serverData: 'ECS (bsa/EB13)',
  dnsData: {
    A: ['93.184.216.34'],
    CNAME: null,
    TXT: [
      'v=spf1 -all',
      'docusign=05958488-4752-4ef2-95eb-aa7ba8a3bd0e'
    ],
    MX: [
      { exchange: 'mail.example.com', priority: 10 }
    ],
    NS: [
      'a.iana-servers.net',
      'b.iana-servers.net'
    ],
    SOA: {
      nsname: 'ns.icann.org',
      hostmaster: 'noc.dns.icann.org',
      serial: 2022091532,
      refresh: 7200,
      retry: 3600,
      expire: 1209600,
      minttl: 3600
    }
  },
  httpStatus: 200
}
```

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
  };
  serverData: string | undefined;
  dnsData:
    | {
        A: string[];
        CNAME: string | null;
        TXT: string[];
        MX: Array<{ exchange: string; priority: number }>;
        NS: string[];
        SOA: dns.SoaRecord | null;
      }
    | undefined;
  httpStatus: number | undefined;
}
```

## Error Handling

The `fetchDomainInfo` function may throw errors in the following scenarios:

- **Empty domain**: If the domain parameter is empty or undefined
- **Invalid domain**: If the domain format is invalid (e.g., missing TLD)
- **SSL data fetch failure**: If unable to establish HTTPS connection
- **Server data fetch failure**: If unable to retrieve server header
- **DNS data fetch failure**: If DNS resolution fails

Example of proper error handling:

```typescript
import { fetchDomainInfo } from "domain-info-fetcher";

async function getDomainInfo(domain: string): Promise<void> {
  try {
    const domainInfo = await fetchDomainInfo(domain);
    console.log("Domain information:", domainInfo);
  } catch (error) {
    console.error("Failed to fetch domain information:", error.message);
    // Handle specific errors
    if (error.message.includes("Invalid domain")) {
      console.error(
        'Please provide a valid domain in the format "example.com"'
      );
    } else if (error.message.includes("SSL data")) {
      console.error(
        "The domain does not support HTTPS or has an invalid certificate"
      );
    }
  }
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
