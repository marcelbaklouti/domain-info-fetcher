# domain-info-fetcher

[![Build](https://img.shields.io/github/actions/workflow/status/marcelbaklouti/domain-info-fetcher/release.yml)](https://github.com/marcelbaklouti/domain-info-fetcher/actions)
[![npm](https://img.shields.io/npm/v/domain-info-fetcher.svg)](https://www.npmjs.com/package/domain-info-fetcher)
[![GitHub release](https://img.shields.io/github/release/marcelbaklouti/domain-info-fetcher.svg)](https://github.com/marcelbaklouti/domain-info-fetcher/releases/latest)
[![License](https://img.shields.io/github/license/marcelbaklouti/domain-info-fetcher.svg)](https://github.com/marcelbaklouti/domain-info-fetcher/blob/main/LICENCE)
[![Known Vulnerabilities](https://snyk.io/test/github/marcelbaklouti/domain-info-fetcher/badge.svg)](https://snyk.io/test/github/marcelbaklouti/domain-info-fetcher)
[![GitHub issues](https://img.shields.io/github/issues/marcelbaklouti/domain-info-fetcher.svg)](https://github.com/marcelbaklouti/domain-info-fetcher/issues)

A simple Node.js package to fetch SSL/TLS certificate information, server details, DNS records, and HTTP status codes for any domain or subdomain.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Command Line Interface](#command-line-interface)
- [API Documentation](#api-documentation)
  - [Main Functions](#main-functions)
  - [Helper Functions](#helper-functions)
  - [TypeScript Interfaces](#typescript-interfaces)
- [Advanced Usage](#advanced-usage)
  - [Subdomain Support](#subdomain-support)
  - [Custom Request Options](#custom-request-options)
  - [Processing Multiple Domains](#processing-multiple-domains)
- [Error Handling](#error-handling)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

## Features

- 🔒 Fetch SSL/TLS certificate data including validity and expiration
- 🖥️ Get server information and HTTP status codes
- 🌐 Retrieve comprehensive DNS records (A, CNAME, MX, TXT, NS, SOA)
- 🏗️ Full TypeScript support with detailed typings
- 🔄 Promise-based API for easy async/await usage
- 🧩 Intelligent subdomain support with automatic root domain recognition
- 💻 Command-line interface for quick domain analysis
- 🚀 Simple, lightweight with minimal dependencies

## Installation

Install with your preferred package manager:

```bash
# npm
npm install domain-info-fetcher

# yarn
yarn add domain-info-fetcher

# pnpm
pnpm add domain-info-fetcher
```

## Quick Start

```typescript
import { fetchDomainInfo } from "domain-info-fetcher";

// Async/Await syntax
async function checkDomain() {
  try {
    const info = await fetchDomainInfo("example.com");

    // Check SSL certificate validity
    console.log(`SSL Valid: ${info.sslData.valid ? "Yes" : "No"}`);
    console.log(
      `Expires: ${new Date(info.sslData.validTo).toLocaleDateString()}`
    );

    // Display server & HTTP info
    console.log(`Server: ${info.serverData || "Unknown"}`);
    console.log(`HTTP Status: ${info.httpStatus}`);

    // Show IP addresses
    console.log(`IP Addresses: ${info.dnsData?.A.join(", ")}`);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

checkDomain();
```

## Command Line Interface

The package includes a CLI for quick domain analysis from the terminal:

```bash
# Install globally
npm install -g domain-info-fetcher

# Run a quick domain check
domain-info-fetcher example.com

# Check a subdomain
domain-info-fetcher blog.example.com

# Set request timeout and get JSON output
domain-info-fetcher example.com --timeout 5000 --json
```

### CLI Options

| Option           | Description                                          |
| ---------------- | ---------------------------------------------------- |
| `--timeout <ms>` | Set request timeout in milliseconds (default: 10000) |
| `--json`         | Output results as JSON                               |
| `--help`         | Show help information                                |

## API Documentation

### Main Functions

#### `fetchDomainInfo(domain: string, options?: RequestOptions): Promise<DomainInfo | undefined>`

Fetches comprehensive information about a domain including SSL/TLS certificate, server details, DNS records, and HTTP status.

**Parameters:**

- `domain`: The domain to analyze (e.g., "example.com" or "blog.example.com")
- `options`: Optional [request configuration](#request-options)

**Returns:** A Promise resolving to a [DomainInfo](#domaininfo) object or undefined if an error occurs.

### Helper Functions

#### `extractSubdomain(domain: string): string | null`

Extracts the subdomain part from a given domain.

```typescript
const subdomain = extractSubdomain("blog.example.com"); // Returns "blog"
const none = extractSubdomain("example.com"); // Returns null
```

#### `getRootDomain(domain: string): string`

Extracts the root domain from a given domain that may include a subdomain.

```typescript
const root = getRootDomain("blog.example.com"); // Returns "example.com"
const same = getRootDomain("example.com"); // Returns "example.com"
```

### TypeScript Interfaces

#### DomainInfo

The main interface returned by `fetchDomainInfo`:

```typescript
interface DomainInfo {
  // SSL/TLS certificate data
  sslData: {
    subject: { [key: string]: string | string[] };
    issuer: { [key: string]: string | string[] };
    valid: boolean;
    validFrom: number; // Timestamp
    validTo: number; // Timestamp
    // PEM-encoded certificates (available since v2.1.0)
    certificate?: string; // PEM-encoded server certificate
    intermediateCertificate?: string; // PEM-encoded intermediate certificate
    rootCertificate?: string; // PEM-encoded root certificate
    // Human-readable details (available since v2.1.0)
    details?: {
      subject: string; // Formatted subject name
      issuer: string; // Formatted issuer name
      validFrom: Date; // Validity start date as Date object
      validTo: Date; // Validity end date as Date object
    };
  };

  // Server software (if available)
  serverData: string | undefined;

  // DNS records
  dnsData:
    | {
        A: string[]; // IP addresses
        CNAME: string | null;
        TXT: string[];
        MX: Array<{ exchange: string; priority: number }>;
        NS: string[];
        SOA: dns.SoaRecord | null;
      }
    | undefined;

  // HTTP status code
  httpStatus: number | undefined;
}
```

#### RequestOptions

Options for configuring the fetch request:

```typescript
interface RequestOptions {
  /** Timeout in milliseconds (default: 10000) */
  timeout?: number;
  /** Custom headers to include in HTTP requests */
  headers?: Record<string, string>;
  /** Whether to follow redirects (default: true) */
  followRedirects?: boolean;
  /** Maximum number of redirects to follow (default: 5) */
  maxRedirects?: number;
}
```

## Advanced Usage

### Subdomain Support

The package intelligently handles subdomains such as `blog.example.com`:

```typescript
import {
  fetchDomainInfo,
  extractSubdomain,
  getRootDomain,
} from "domain-info-fetcher";

async function analyzeSubdomain() {
  const domain = "blog.example.com";
  const subdomain = extractSubdomain(domain); // Returns "blog"
  const rootDomain = getRootDomain(domain); // Returns "example.com"

  const info = await fetchDomainInfo(domain);

  // For subdomains:
  // - A and CNAME records are fetched for the subdomain
  // - MX, TXT, NS, and SOA records are fetched from the root domain
  console.log(`Subdomain A Records: ${info.dnsData?.A.join(", ")}`);
  console.log(
    `Root Domain MX Records: ${info.dnsData?.MX.length} records found`
  );
}
```

### Custom Request Options

Customize the request behavior with options:

```typescript
import { fetchDomainInfo } from "domain-info-fetcher";

const options = {
  timeout: 5000, // 5 second timeout
  headers: {
    "User-Agent": "Custom UA", // Custom user agent
  },
  followRedirects: true, // Follow redirects
  maxRedirects: 3, // Max redirects to follow
};

const info = await fetchDomainInfo("example.com", options);
```

### Processing Multiple Domains

Check multiple domains in parallel:

```typescript
import { fetchDomainInfo } from "domain-info-fetcher";

async function checkMultipleDomains(domains: string[]) {
  const results = await Promise.allSettled(
    domains.map((domain) => fetchDomainInfo(domain))
  );

  // Process results
  results.forEach((result, index) => {
    const domain = domains[index];
    if (result.status === "fulfilled") {
      const info = result.value;
      console.log(
        `✅ ${domain}: SSL valid until ${new Date(
          info.sslData.validTo
        ).toLocaleDateString()}`
      );
    } else {
      console.log(`❌ ${domain}: Error - ${result.reason.message}`);
    }
  });
}

// Example usage
checkMultipleDomains(["example.com", "github.com", "blog.medium.com"]);
```

### Working with Certificate Data

The package now provides PEM-encoded certificates and human-readable certificate details:

```typescript
import { fetchDomainInfo } from "domain-info-fetcher";
import * as fs from "fs/promises";

async function saveCertificate() {
  try {
    const domain = "example.com";
    const info = await fetchDomainInfo(domain);

    // Access human-readable certificate information
    if (info.sslData.details) {
      console.log(`Certificate issued to: ${info.sslData.details.subject}`);
      console.log(`Certificate issued by: ${info.sslData.details.issuer}`);
      console.log(
        `Valid from: ${info.sslData.details.validFrom.toLocaleDateString()}`
      );
      console.log(
        `Valid until: ${info.sslData.details.validTo.toLocaleDateString()}`
      );
    }

    // Save PEM-encoded certificates to files
    if (info.sslData.certificate) {
      await fs.writeFile(`${domain}-cert.pem`, info.sslData.certificate);
      console.log(`Server certificate saved to ${domain}-cert.pem`);
    }

    if (info.sslData.intermediateCertificate) {
      await fs.writeFile(
        `${domain}-intermediate.pem`,
        info.sslData.intermediateCertificate
      );
      console.log(
        `Intermediate certificate saved to ${domain}-intermediate.pem`
      );
    }

    if (info.sslData.rootCertificate) {
      await fs.writeFile(`${domain}-root.pem`, info.sslData.rootCertificate);
      console.log(`Root certificate saved to ${domain}-root.pem`);
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}
```

This allows you to:

- Access nicely formatted certificate issuer and subject information
- Work with date objects instead of timestamps
- Extract and save certificates for further processing
- Implement certificate pinning in your applications
- Verify digital signatures using the certificate data

## Error Handling

The package provides specific error messages for different failure scenarios:

```typescript
import { fetchDomainInfo } from "domain-info-fetcher";

try {
  const info = await fetchDomainInfo("example.com");
  // Process successful result
} catch (error) {
  // Handle specific errors
  if (error.message.includes("Invalid domain")) {
    console.error("Please provide a valid domain format");
  } else if (error.message.includes("SSL data")) {
    console.error("SSL certificate issue or HTTPS not supported");
  } else if (error.message.includes("DNS data")) {
    console.error("DNS resolution failed");
  } else {
    console.error("Unknown error:", error.message);
  }
}
```

## Examples

The package includes ready-to-run examples:

```bash
# Clone the repository
git clone https://github.com/marcelbaklouti/domain-info-fetcher.git
cd domain-info-fetcher

# Install dependencies
npm install

# Run examples
npm run example          # Basic domain info
npm run example:multi    # Multiple domains
npm run example:subdomain # Subdomain analysis
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please make sure to update tests as appropriate and adhere to the existing coding style.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
