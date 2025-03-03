# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.3.0] - 2025-03-03

### Added

- WHOIS data integration with new `whoisData` property in the `DomainInfo` object
- Built-in WHOIS protocol implementation using native Node.js modules
- TLD-specific WHOIS server mapping for accurate results
- Data extraction for registration dates, expiration dates, registrar information
- Domain status codes and registrant information (when available)
- Caching system for WHOIS queries to respect rate limits
- CLI now displays WHOIS data including registrar, important dates, and status
- New example in `examples/whois-usage.ts` demonstrating WHOIS functionality
- `WhoisData` interface exported for TypeScript users
- Comprehensive error handling with helpful suggestions for WHOIS-related issues

### Changed

- Enhanced `fetchDomainInfo` to include WHOIS data
- Made WHOIS data retrieval resilient to failures (won't prevent other data from being returned)
- Improved CLI error messages for WHOIS-specific errors

## [2.2.2] - 2025-03-03

### Changed

- Improved error handling in CLI
- Improved error handling in the `fetchDomainInfo` function
- Added helpful error suggestions in CLI output to assist users in troubleshooting common issues
- Enhanced error messages with more specific details about failure causes
- Fixed linter warnings in the codebase
- Improved TypeScript type definitions for SSL certificate data
- Fixed certificate issuer display to prioritize Organization name over Common Name
- Updated README.md with enhanced error handling examples and certificate issuer details
- Updated package description and keywords to better reflect the project's capabilities

## [2.2.1] - 2025-02-27

### Changed

- Updated the README.md

## [2.2.0] - 2025-02-27

### Added

- Added PEM-encoded certificate access with new properties in the `sslData` object:
  - `certificate`: The server's PEM-encoded certificate
  - `intermediateCertificate`: The PEM-encoded intermediate certificate (if available)
  - `rootCertificate`: The PEM-encoded root certificate (if available)
- Added human-readable certificate details in a new `details` property:
  - `subject`: Formatted readable subject name
  - `issuer`: Formatted readable issuer name
  - `validFrom`: Certificate validity start date as JavaScript Date object
  - `validTo`: Certificate validity end date as JavaScript Date object
- New example in documentation showing how to save certificates to files and access the human-readable details

### Changed

- Enhanced the certificate data extraction process to include PEM formats
- Improved type definitions for better TypeScript support

## [2.1.0] - 2025-02-27

### Added

- Support for subdomains like `blog.example.com`
- New utility functions `extractSubdomain` and `getRootDomain` to work with subdomain structures
- Intelligent DNS record handling for subdomains: A and CNAME records are fetched from the subdomain, while MX, TXT, NS, and SOA records are fetched from the root domain
- New example demonstrating subdomain functionality: `examples/subdomain-usage.ts`
- Enhanced CLI with subdomain detection and helpful messages for subdomain queries
- Updated documentation with comprehensive subdomain examples and explanations

### Changed

- DNS resolution logic improved to handle subdomain hierarchies
- CLI help text expanded to include subdomain usage examples

## [2.0.1] - 2025-02-27

### Fixed

- ESM compatibility issue with chalk package by downgrading to a CommonJS compatible version
- Error `ERR_REQUIRE_ESM` when running CLI with ts-node due to chalk v5+ being ESM-only while project uses CommonJS

## [2.0.0] - 2025-02-27

### Added

- CLI interface for running queries directly from the command line
- Support for custom request options (timeout, headers, redirects)
- Comprehensive documentation with advanced usage examples
- Improved test coverage with real network tests

### Changed

- Enhanced error handling with specific error messages for different failure scenarios
- Improved TypeScript typings for better IDE support
- Updated all dependencies to their latest versions
- Restructured the codebase for better maintainability

### Fixed

- Issues with DNS resolution error handling
- Performance bottlenecks in HTTPS requests
- Reliability issues when fetching data from servers with non-standard configurations

### Security

- Fixed high severity vulnerability in braces package (GHSA-grv7-fg5c-xmjg) related to uncontrolled resource consumption
- Fixed moderate severity vulnerability in micromatch package (GHSA-952p-6rrq-rcjv) related to ReDoS
- Updated multiple dependencies to address potential security issues

## [1.2.0] - 2023-06-22

### Fixed

- Bug that caused the `fetchDomainInfo` function to not return the correct data
- Typescript errors

## [1.1.1] - 2023-06-21

### Fixed

- Bug that caused circular json objects to not return the correct data

### Updated

- Updated the README.md
- Updated dependencies to the latest version
- Tests

### Added

- New functions to format and validate data returned by the `fetchDomainInfo` function
- New tests for the new functions

## [1.1.0] - 2023-05-23

### Breaking

- The `IDomainInfo` interface has been renamed to `DomainInfo` so the `fetchDomainInfo` function now returns a `DomainInfo` object instead of an `IDomainInfo` object.

### Updated

- Updated the README.md
- Updated the package.json keywords
- Updated the package.json description
- Updated the installed packages to the latest version

### Added

- New HTTP Status Codes to the DomainInfo Object
- Domains will now be formatted to lowercase before fetching the information
- Domains that start with `http://`, `https://` or `www` will now be stripped of the protocol before fetching the information
- New Tests for the new HTTP Status Codes

## [1.0.8] - 2023-03-19

### Updated

- Sorting of the Badges in the README.md

## [1.0.7] - 2023-03-19

### Added

- More Badges to the README.md

## [1.0.6] - 2023-03-19

### Fixed

- Bug that generated double workflow runs

## [1.0.5] - 2023-03-19

### Fixed

- Bug that caused the workflow to not generate a new release with the correct version

## [1.0.4] - 2023-03-19

### Fixed

- Bug that caused the workflow to skip the release

## [1.0.3] - 2023-03-19

### Added

- New Tokens for Workflow in the README.md

## [1.0.1] - 2023-03-19

### Fixed

- Bugfix in Workflow

## [1.0.0] - 2023-03-18

### Added

- Initial release features
