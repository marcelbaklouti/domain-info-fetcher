# domain-info-fetcher

[![Build](https://img.shields.io/github/actions/workflow/status/marcelbaklouti/domain-info-fetcher/release.yml)](https://github.com/marcelbaklouti/domain-info-fetcher/actions)
[![npm](https://img.shields.io/npm/v/domain-info-fetcher.svg)](https://www.npmjs.com/package/domain-info-fetcher)
[![GitHub release](https://img.shields.io/github/release/marcelbaklouti/domain-info-fetcher.svg)](https://github.com/marcelbaklouti/domain-info-fetcher/releases/latest)
[![License](https://img.shields.io/github/license/marcelbaklouti/domain-info-fetcher.svg)](https://github.com/marcelbaklouti/domain-info-fetcher/blob/main/LICENCE)
[![Known Vulnerabilities](https://snyk.io/test/github/marcelbaklouti/domain-info-fetcher/badge.svg)](https://snyk.io/test/github/marcelbaklouti/domain-info-fetcher)
[![GitHub issues](https://img.shields.io/github/issues/marcelbaklouti/domain-info-fetcher.svg)](https://github.com/marcelbaklouti/domain-info-fetcher/issues)

A comprehensive domain analysis tool for Node.js that provides detailed information about any domain or subdomain. Features rich WHOIS data (including registration dates, expiration monitoring, registrar details, and domain status), SSL/TLS certificate analysis, DNS records, and server information. The intuitive CLI with colorized output makes domain analysis accessible to everyone.

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
  - [Working with WHOIS Data](#working-with-whois-data)
- [Error Handling](#error-handling)
- [Examples](#examples)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

## Features

- 📋 **Comprehensive WHOIS Information**:
  - Registrar details with IANA IDs and URLs
  - Registration, update, and expiration dates with expiry warnings
  - Domain status codes with human-readable descriptions
  - Registrant information (when available)
  - Name servers and raw WHOIS data access
- 🔒 SSL/TLS certificate data including validity and expiration
- 🖥️ Server information and HTTP status codes
- 🌐 Comprehensive DNS records (A, CNAME, MX, TXT, NS, SOA)
- 🧩 Intelligent subdomain support with automatic root domain recognition
- 💻 Feature-rich CLI with colorized, structured output
- 🏗️ Full TypeScript support with detailed typings
- 🔄 Promise-based API for easy async/await usage
- 🚀 Simple, lightweight with minimal dependencies
- 📋 PEM-encoded certificates for direct use in other applications
- 🔍 Detailed error messages with helpful troubleshooting suggestions
- 🛡️ Robust error handling with specific error types

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

    // Show WHOIS information (v2.3.0+)
    if (info.whoisData) {
      console.log(`Registrar: ${info.whoisData.registrar || "Unknown"}`);
      console.log(
        `Creation Date: ${
          info.whoisData.creationDate
            ? new Date(info.whoisData.creationDate).toLocaleDateString()
            : "Unknown"
        }`
      );
      console.log(
        `Expiration Date: ${
          info.whoisData.expirationDate
            ? new Date(info.whoisData.expirationDate).toLocaleDateString()
            : "Unknown"
        }`
      );

      // Check domain status codes
      if (info.whoisData.statusCodes && info.whoisData.statusCodes.length > 0) {
        console.log("Domain Status Codes:");
        info.whoisData.statusCodes.forEach((status) =>
          console.log(`- ${status}`)
        );
      }
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

checkDomain();
```

## Command Line Interface

The package includes a feature-rich CLI for quick domain analysis from the terminal, with colorized output for better readability:

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

### CLI Output

The CLI provides a comprehensive, color-coded output with sections for:

- 🔒 **SSL Certificate**: Validity, issuer, expiration dates, and PEM availability
- 🖥️ **Server Information**: Server software and HTTP status codes
- 🌐 **DNS Records**: A, CNAME, MX, TXT, and NS records with formatted display
- 📋 **WHOIS Information**:
  - Registrar details and IANA IDs
  - ⏰ Important dates (creation, update, expiration) with color-coded warnings
  - 👤 Registrant information (when not privacy-protected)
  - 🔒 Domain status codes with human-readable descriptions
  - 🌐 Name servers
  - Sample of the raw WHOIS data with tip for viewing full data

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
      issuer: string; // Formatted issuer name (prioritizes Organization name over Common Name)
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

  // WHOIS data (available since v2.3.0)
  whoisData?: {
    // Registration information
    registrar?: string;
    registrarUrl?: string;
    registrarIanaId?: string;

    // Dates
    creationDate?: Date;
    updatedDate?: Date;
    expirationDate?: Date;

    // Contact information (redacted in many cases due to privacy)
    registrant?: {
      organization?: string;
      country?: string;
      email?: string;
    };

    // Status codes
    statusCodes?: string[];

    // Name servers
    nameServers?: string[];

    // Raw WHOIS response
    rawText: string;
  };
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

### Working with WHOIS Data

The package provides comprehensive WHOIS information for domains (added in v2.3.0):

```typescript
import { fetchDomainInfo, WhoisData } from "domain-info-fetcher";

async function analyzeWhoisData() {
  try {
    const domain = "example.com";
    const info = await fetchDomainInfo(domain);

    if (info.whoisData) {
      // Display key WHOIS data
      console.log(`Domain: ${domain}`);
      console.log(`Registrar: ${info.whoisData.registrar || "N/A"}`);
      console.log(`Registrar URL: ${info.whoisData.registrarUrl || "N/A"}`);

      if (info.whoisData.registrarIanaId) {
        console.log(`Registrar IANA ID: ${info.whoisData.registrarIanaId}`);
      }

      // Format and display dates
      if (info.whoisData.creationDate) {
        console.log(
          `Registration Date: ${info.whoisData.creationDate.toLocaleDateString()}`
        );
      }

      if (info.whoisData.updatedDate) {
        console.log(
          `Last Updated: ${info.whoisData.updatedDate.toLocaleDateString()}`
        );
      }

      if (info.whoisData.expirationDate) {
        console.log(
          `Expiration Date: ${info.whoisData.expirationDate.toLocaleDateString()}`
        );

        // Calculate days until expiration
        const now = new Date();
        const expiry = info.whoisData.expirationDate;
        const daysRemaining = Math.ceil(
          (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Color code based on proximity to expiration
        let status = "✅";
        if (daysRemaining < 30) {
          status = "⚠️ EXPIRING SOON";
        } else if (daysRemaining < 0) {
          status = "❌ EXPIRED";
        }

        console.log(`Days until expiration: ${daysRemaining} ${status}`);
      }

      // Display domain status codes
      if (info.whoisData.statusCodes && info.whoisData.statusCodes.length > 0) {
        console.log("\nDomain Status Codes:");
        info.whoisData.statusCodes.forEach((status) => {
          // Add helpful descriptions for common status codes
          let description = "";
          if (status.includes("clientTransferProhibited")) {
            description = " (Transfer locked by registrar)";
          } else if (status.includes("clientDeleteProhibited")) {
            description = " (Deletion protected)";
          } else if (status.includes("clientUpdateProhibited")) {
            description = " (Updates restricted)";
          }

          console.log(`- ${status}${description}`);
        });
      }

      // Display registrant information if available
      if (info.whoisData.registrant) {
        console.log("\nRegistrant Information:");

        if (info.whoisData.registrant.organization) {
          console.log(
            `- Organization: ${info.whoisData.registrant.organization}`
          );
        }

        if (info.whoisData.registrant.country) {
          console.log(`- Country: ${info.whoisData.registrant.country}`);
        }

        if (info.whoisData.registrant.email) {
          console.log(`- Email: ${info.whoisData.registrant.email}`);
        }
      }

      // Display nameservers
      if (info.whoisData.nameServers && info.whoisData.nameServers.length > 0) {
        console.log("\nNameservers:");
        info.whoisData.nameServers.forEach((ns) => console.log(`- ${ns}`));
      }

      // Access raw WHOIS text for custom parsing
      if (info.whoisData.rawText) {
        console.log("\nRaw WHOIS data excerpt:");
        // Display first 5 lines
        const excerpt = info.whoisData.rawText
          .split("\n")
          .filter((line) => line.trim() !== "")
          .slice(0, 5)
          .join("\n");
        console.log(excerpt + "...");
      }
    } else {
      console.log(`No WHOIS data available for ${domain}`);
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

analyzeWhoisData();
```

The enhanced WHOIS data is particularly useful for:

- Monitoring domain expiration dates with visual alerts
- Verifying domain ownership information
- Checking domain status codes with human-readable explanations
- Retrieving detailed registrar information including IANA IDs
- Identifying registration and update history
- Analyzing domain transfer and security settings

## Error Handling

The package provides specific error messages for different failure scenarios with helpful suggestions for troubleshooting:

```typescript
import { fetchDomainInfo } from "domain-info-fetcher";

try {
  const info = await fetchDomainInfo("example.com");
  // Process successful result
} catch (error) {
  // Handle specific errors
  if (error.message.includes("Invalid domain name format")) {
    console.error("Please provide a valid domain format (e.g., example.com)");
  } else if (error.message.includes("Could not fetch SSL data")) {
    console.error("SSL certificate issue or HTTPS not supported");
    console.error(
      "Try increasing the timeout or check if the domain supports HTTPS"
    );
  } else if (error.message.includes("Could not fetch DNS data")) {
    console.error(
      "DNS resolution failed - check domain spelling or DNS connectivity"
    );
  } else if (error.message.includes("Could not fetch WHOIS data")) {
    console.error(
      "WHOIS lookup failed - server may be unavailable or rate limiting"
    );
  } else if (error.message.includes("ETIMEDOUT")) {
    console.error("Connection timed out - try increasing the timeout value");
  } else {
    console.error("Unknown error:", error.message);
  }
}
```

When using the CLI, detailed error suggestions are automatically provided:

```
❌ Error fetching domain information:
   Could not fetch SSL data for domain invalid.site. Error code: ENOTFOUND

Suggestion: Domain not found. This could be because:
  - The domain doesn't exist or is misspelled
  - Your DNS resolver can't resolve this domain
  - Check for typos in the domain name
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
npm run example:certificate # Certificate extraction
npm run example:whois    # WHOIS data analysis with detailed output
```

## Roadmap

We have an ambitious roadmap for the future of domain-info-fetcher. The project is evolving to better serve both technical and non-technical users, with planned support for:

### Upcoming Versions

- ✅ **v2.3.0**: WHOIS data integration with comprehensive data extraction (Completed)
- **v2.4.0**: Batch processing system for efficiently handling multiple domains
- **v3.0.0**: Enhanced CLI and data export capabilities (JSON, CSV, tables)
- **v3.1.0**: GitHub Pages web interface for non-technical users
- **v3.2.0**: Dashboard support with specialized formatting and monitoring tools

For detailed information about our development plans, implementation timeline, and how to contribute to specific features, please see our [ROADMAP.md](ROADMAP.md) document.

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
